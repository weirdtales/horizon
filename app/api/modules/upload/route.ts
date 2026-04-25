import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import crypto from 'crypto';

const execAsync = promisify(exec);

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string) {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
        crypto.timingSafeEqual(bufA, bufA); // Prevent timing leakage
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
    try {
        // 1. Authorization check
        const expectedKey = process.env.UPLOAD_API_KEY || process.env.MODULE_API_KEY;
        const authHeader = req.headers.get('authorization');
        const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!expectedKey || !providedToken || !timingSafeEqual(providedToken, expectedKey)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('plugin') as File;

        if (!file) {
            return NextResponse.json({ error: 'No plugin file provided.' }, { status: 400 });
        }

        // 2. File Size Validation (Max 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large. Max size is 10MB.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 3. Sanitize filename
        const safeFileName = file.name.replace(/[^A-Za-z0-9.-]/g, '_');
        const tempDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tempDir)) await mkdir(tempDir);

        const zipPath = path.join(tempDir, `${Date.now()}-${safeFileName}`);
        await writeFile(zipPath, buffer);

        // Create a temporary extraction directory to validate
        const extractDir = path.join(tempDir, `extract-${Date.now()}`);
        await mkdir(extractDir);

        try {
            // Unzip using JS library (No shell invocation)
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractDir, true);

            // Find the module folder
            let moduleSourcePath = extractDir;
            const items = fs.readdirSync(extractDir);
            if (items.length === 1 && fs.statSync(path.join(extractDir, items[0])).isDirectory()) {
                moduleSourcePath = path.join(extractDir, items[0]);
            }

            // Validate manifest
            const manifestPath = path.join(moduleSourcePath, 'module.json');
            if (!fs.existsSync(manifestPath)) {
                throw new Error('Invalid plugin: module.json not found.');
            }

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            const moduleId = manifest.id;

            // 4. Sanitize and Validate Module ID
            if (!moduleId || !/^[A-Za-z0-9-]+$/.test(moduleId)) {
                throw new Error('Invalid or missing Module ID in manifest.');
            }

            // Final destination
            const destDir = path.join(process.cwd(), 'modules', moduleId);

            // Safety: Ensure we aren't trying to escape the modules directory
            if (!destDir.startsWith(path.join(process.cwd(), 'modules'))) {
                throw new Error('Invalid Module ID: path traversal detected.');
            }

            // 5. Use native Node APIs instead of shelling out for rm/cp
            if (fs.existsSync(destDir)) {
                fs.rmSync(destDir, { recursive: true, force: true });
            }

            await mkdir(path.dirname(destDir), { recursive: true });
            fs.cpSync(moduleSourcePath, destDir, { recursive: true });

            // Trigger registry generation (Awaited for consistency)
            try {
                await execAsync(`node scripts/generate-registry.mjs`);
            } catch (err) {
                console.error('[Upload Registry Regen Error]:', err);
                return NextResponse.json({
                    success: true,
                    message: `Plugin '${manifest.name}' installed, but registry sync failed.`,
                    warning: 'REGISTRY_SYNC_FAILED',
                });
            }

            return NextResponse.json({
                success: true,
                message: `Plugin '${manifest.name}' installed successfully.`,
                id: moduleId,
            });
        } finally {
            // Cleanup temp files reliably
            if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
            if (fs.existsSync(zipPath)) await unlink(zipPath);
        }
    } catch (error: unknown) {
        console.error('[Upload Error]:', error);

        // Strict allowlist for error messages to prevent leaking internal state
        const SAFE_ERRORS = [
            'No plugin file provided.',
            'File too large. Max size is 10MB.',
            'Invalid plugin: module.json not found.',
            'Invalid or missing Module ID in manifest.',
            'Invalid Module ID: path traversal detected.',
        ];

        const errorMessage = error instanceof Error ? error.message : '';
        const safeMessage = SAFE_ERRORS.includes(errorMessage) ? errorMessage : 'Internal server error during upload.';

        return NextResponse.json({ error: safeMessage }, { status: 500 });
    }
}

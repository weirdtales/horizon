import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1. Authorization check
        const expectedKey = process.env.UPLOAD_API_KEY || process.env.MODULE_API_KEY;
        const authHeader = req.headers.get('Authorization');
        const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!expectedKey || !providedToken || !timingSafeEqual(providedToken, expectedKey)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
        }

        // 2. Safe ID Validation: Allow alphanumeric and hyphens, preserve casing
        if (!/^[A-Za-z0-9-]+$/.test(id)) {
            return NextResponse.json({ error: 'Invalid Module ID format' }, { status: 400 });
        }

        const modulePath = path.join(process.cwd(), 'modules', id);

        // Safety: Ensure we aren't trying to escape the modules directory
        if (!modulePath.startsWith(path.join(process.cwd(), 'modules'))) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
        }

        // 3. Delete the directory using safe Async Node FS API
        // Attempt removal directly to avoid TOCTOU (Time-of-Check Time-of-Use) vulnerabilities
        try {
            await fs.promises.rm(modulePath, { recursive: true, force: false });
        } catch (rmErr: unknown) {
            if ((rmErr as { code?: string }).code === 'ENOENT') {
                return NextResponse.json({ error: 'Module not found' }, { status: 404 });
            }
            throw rmErr; // Rethrow other errors to be caught by the outer catch
        }

        // 4. Re-generate the registry (Awaited for consistency)
        try {
            await execAsync('node scripts/generate-registry.mjs');
        } catch (regErr) {
            console.error('[Registry Regen Error]:', regErr);
            return NextResponse.json({
                success: true,
                message: `Module ${id} deleted, but registry regeneration failed. Please run manually.`,
                warning: 'REGISTRY_SYNC_FAILED',
            });
        }

        return NextResponse.json({ success: true, message: `Module ${id} deleted successfully` });
    } catch (error: unknown) {
        console.error('[Module Deletion Error]:', error);
        // 5. Generic error message to prevent internal leak
        return NextResponse.json({ error: 'Internal server error during deletion' }, { status: 500 });
    }
}

import { getSettings, saveSettings } from '@/lib/settings';
import { NextResponse } from 'next/server';

/**
 * Recursively removes dangerous prototype pollution keys.
 */
function sanitizeObject(val: any): any {
    if (val === null || typeof val !== 'object') return val;
    if (Array.isArray(val)) return val.map(sanitizeObject);

    const sanitized = { ...val };
    delete sanitized['__proto__'];
    delete sanitized['constructor'];
    delete sanitized['prototype'];

    for (const key in sanitized) {
        if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }
    return sanitized;
}

export async function GET() {
    try {
        const settings = getSettings();
        const safeSettings = JSON.parse(JSON.stringify(settings));

        // Mask secrets
        for (const [key, moduleData] of Object.entries(safeSettings)) {
            if (!moduleData || Array.isArray(moduleData) || typeof moduleData !== 'object') continue;

            for (const [credential, val] of Object.entries(moduleData)) {
                if (val && typeof val === 'string' && (
                    credential.toLowerCase().includes('password') || 
                    credential.toLowerCase().includes('token') || 
                    credential.toLowerCase().includes('secret') || 
                    credential.toLowerCase().includes('key') || 
                    /apikey/i.test(credential)
                )) {
                    (moduleData as any)[credential] = '********';
                }
            }
        }
        return NextResponse.json({ settings: safeSettings });
    } catch (e: any) {
        console.error('[Settings API GET ERROR]:', e);
        // Sanitize error message to avoid infrastructure leaks
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let payload: any = null;
    try {
        payload = await request.json();
        if (!payload || !payload.settings || typeof payload.settings !== 'object' || Array.isArray(payload.settings)) {
            return NextResponse.json({ error: 'Invalid payload: missing or invalid settings object' }, { status: 400 });
        }

        const newOverrides = payload.settings;
        const current = getSettings() || {};

        for (const [moduleKey, moduleData] of Object.entries(newOverrides)) {
            // Prototype pollution protection
            if (moduleKey === '__proto__' || moduleKey === 'constructor' || moduleKey === 'prototype') continue;

            // 1. Handle root arrays (navigation, bookmarks) - Use sanitizeObject for array content
            if (Array.isArray(moduleData)) {
                (current as any)[moduleKey] = sanitizeObject(moduleData);
                continue;
            }

            // 2. Safety: Ignore non-object module data
            if (!moduleData || typeof moduleData !== 'object') continue;

            // 3. Ensure target module exists as an object
            const existingModule = (current as any)[moduleKey];
            if (!existingModule || typeof existingModule !== 'object' || Array.isArray(existingModule)) {
                (current as any)[moduleKey] = {};
            }

            // 4. Update fields
            for (const [field, val] of Object.entries(moduleData)) {
                if (field === '__proto__' || field === 'constructor' || field === 'prototype') continue;

                // Safety: If target is an array but update is an object (not array), skip or handle
                // to prevent data corruption.
                if (Array.isArray((current as any)[moduleKey][field]) && val !== null && typeof val === 'object' && !Array.isArray(val)) {
                    console.warn(`[Settings API]: Attempted to merge object onto array for ${moduleKey}.${field}. Skipping.`);
                    continue;
                }

                // Arrays are overwritten, not merged deep - Sanitize array content
                if (Array.isArray(val)) {
                    (current as any)[moduleKey][field] = sanitizeObject(val);
                } 
                // Only update if it's not the masked string
                else if (val !== '********') {
                    (current as any)[moduleKey][field] = sanitizeObject(val);
                }
            }
        }

        saveSettings(current);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[Settings API POST ERROR]:', e);
        return NextResponse.json({ 
            error: 'Unknown server error'
        }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';
import { LoopiaRecord } from '@/lib/types/loopia';

export async function POST(request: Request) {
    // CSRF Protection
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (process.env.NODE_ENV === 'production' && origin && host && !origin.includes(host)) {
        return NextResponse.json({ error: 'Forbidden: Cross-site request blocked' }, { status: 403 });
    }

    try {
        const { domain, oldSubdomain, newSubdomain } = await request.json();
        if (!domain || !oldSubdomain || !newSubdomain) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Create the new subdomain
        await callLoopia('addSubdomain', [domain, newSubdomain]);

        // 2. Fetch all records from the old subdomain
        const records = (await callLoopia('getZoneRecords', [domain, oldSubdomain])) as LoopiaRecord[];

        // 3. Add those records to the new subdomain
        for (const rec of records) {
            await callLoopia('addZoneRecord', [
                domain,
                newSubdomain,
                {
                    type: rec.type,
                    ttl: rec.ttl,
                    priority: rec.priority,
                    rdata: rec.rdata,
                },
            ]);
        }

        // 4. Delete the old subdomain
        await callLoopia('removeSubdomain', [domain, oldSubdomain]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Loopia Rename Error]:', err);
        return NextResponse.json({ error: 'Failed to rename subdomain' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';

export async function POST(request: Request) {
    try {
        const { domain, oldSubdomain, newSubdomain } = await request.json();
        if (!domain || !oldSubdomain || !newSubdomain) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Create the new subdomain
        await callLoopia('addSubdomain', [domain, newSubdomain]);

        // 2. Fetch all records from the old subdomain
        const records = await callLoopia('getZoneRecords', [domain, oldSubdomain]);

        // 3. Add those records to the new subdomain
        for (const rec of records) {
            await callLoopia('addZoneRecord', [domain, newSubdomain, {
                type: rec.type,
                ttl: rec.ttl,
                priority: rec.priority,
                rdata: rec.rdata
            }]);
        }

        // 4. Delete the old subdomain
        await callLoopia('removeSubdomain', [domain, oldSubdomain]);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

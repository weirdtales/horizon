import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET() {
    const settings = await getSettings();
    const plex = settings.plex;

    if (!plex || !plex.token) {
        return NextResponse.json({ error: 'Plex token missing' }, { status: 400 });
    }

    const headers = {
        'Accept': 'application/json',
        'X-Plex-Token': plex.token,
        'X-Plex-Product': 'Horizon Dashboard',
        'X-Plex-Client-Identifier': 'horizon-dashboard-v1'
    };

    try {
        const discRes = await fetch('https://plex.tv/api/v2/resources?includeHttps=1', { headers });
        const data = await discRes.json();
        
        const servers = data
            .filter((item: any) => item.provides && item.provides.includes('server'))
            .map((s: any) => ({
                name: s.name,
                machineId: s.clientIdentifier,
                connections: s.connections.map((c: any) => ({
                    uri: c.uri,
                    address: c.address,
                    local: c.local,
                    relay: c.relay || c.uri.includes('relay.plex.direct')
                }))
            }));

        return NextResponse.json({ servers });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET() {
    const settings = await getSettings();
    const plex = settings.plex;

    if (!plex || !plex.token) {
        return NextResponse.json({ error: 'Plex token missing' }, { status: 400 });
    }

    const headers = {
        Accept: 'application/json',
        'X-Plex-Token': plex.token,
        'X-Plex-Product': 'Horizon Dashboard',
        'X-Plex-Client-Identifier': 'horizon-dashboard-v1',
    };

    try {
        const discRes = await fetch('https://plex.tv/api/v2/resources?includeHttps=1', { headers });
        const data = (await discRes.json()) as PlexResourceItem[];

        const servers = data
            .filter(item => item.provides && item.provides.includes('server'))
            .map(s => ({
                name: s.name,
                machineId: s.clientIdentifier,
                connections: s.connections.map(c => ({
                    uri: c.uri,
                    address: c.address,
                    local: c.local,
                    relay: c.relay || c.uri.includes('relay.plex.direct'),
                })),
            }));

        return NextResponse.json({ servers });
    } catch (err) {
        console.error('[Plex Debug Error]:', err);
        return NextResponse.json({ error: 'Failed to retrieve Plex debug information' }, { status: 500 });
    }
}

interface PlexResourceItem {
    provides: string;
    name: string;
    clientIdentifier: string;
    connections: {
        uri: string;
        address: string;
        local: boolean;
        relay?: boolean;
    }[];
}

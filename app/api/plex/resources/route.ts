import { NextResponse } from 'next/server';

interface PlexConnection {
    uri: string;
    local: boolean;
    address: string;
    relay: boolean;
}

interface PlexResource {
    provides: string;
    name: string;
    product: string;
    productVersion: string;
    platform: string;
    clientIdentifier: string;
    connections: PlexConnection[];
}

interface CleanConnection {
    url: string;
    local: boolean;
    address: string;
    relay: boolean;
    protocol: string;
}

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const headers = {
            Accept: 'application/json',
            'X-Plex-Token': token,
            'X-Plex-Product': 'Horizon Dashboard',
            'X-Plex-Client-Identifier': 'horizon-dashboard-v1',
            'X-Plex-Device': 'Proxy Server',
        };

        const res = await fetch('https://plex.tv/api/v2/resources?includeHttps=1', { headers });
        if (!res.ok) {
            throw new Error(`Plex Resources API: ${res.status}`);
        }

        const data: PlexResource[] = await res.json();

        // Filter for Plex Media Servers and map to a clean format
        const servers = data
            .filter(item => item.provides && item.provides.includes('server'))
            .map(s => {
                // Find all unique connections - Guard against missing connections array
                const connArray = Array.isArray(s.connections) ? s.connections : [];
                const connections: CleanConnection[] = connArray.map(c => ({
                    url: c.uri,
                    local: c.local,
                    address: c.address,
                    relay: c.relay || c.uri.includes('relay.plex.direct'),
                    protocol: c.uri.startsWith('https') ? 'https' : 'http',
                }));

                // Priority Order for Auto-Selection:
                // 1. Local HTTP (fastest/most reliable inside home)
                // 2. Local HTTPS (.plex.direct local link)
                // 3. Remote HTTPS (Direct remote access)
                // 4. Relay (Slow but guaranteed fallback)
                const bestConnection =
                    connections.find(c => c.local && c.protocol === 'http') ||
                    connections.find(c => c.local && c.protocol === 'https') ||
                    connections.find(c => !c.local && !c.relay) ||
                    connections.find(c => c.relay) ||
                    connections[0];

                return {
                    name: s.name,
                    product: s.product,
                    productVersion: s.productVersion,
                    platform: s.platform,
                    machineId: s.clientIdentifier,
                    url: bestConnection?.url,
                    connections: connections.sort((a, b) => {
                        // Sort by priority for the resolver
                        if (a.local && !b.local) return -1;
                        if (!a.local && b.local) return 1;
                        if (!a.relay && b.relay) return -1;
                        if (a.relay && !b.relay) return 1;
                        return 0;
                    }),
                };
            });

        return NextResponse.json({ servers });
    } catch (err: unknown) {
        console.error('Plex Discovery Error Detail:', err);
        return NextResponse.json(
            {
                error: 'Failed to discover Plex resources',
            },
            { status: 500 }
        );
    }
}

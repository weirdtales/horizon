import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const headers = {
            'Accept': 'application/json',
            'X-Plex-Token': token,
            'X-Plex-Product': 'Horizon Dashboard',
            'X-Plex-Client-Identifier': 'horizon-dashboard-v1',
            'X-Plex-Device': 'Proxy Server'
        };

        const res = await fetch('https://plex.tv/api/v2/resources?includeHttps=1', { headers });
        if (!res.ok) {
            throw new Error(`Plex Resources API: ${res.status}`);
        }

        const data = await res.json();
        
        // Filter for Plex Media Servers and map to a clean format
        const servers = data
            .filter((item: any) => item.provides && item.provides.includes('server'))
            .map((s: any) => {
                // Find all unique connections - Guard against missing connections array
                const connArray = Array.isArray(s.connections) ? s.connections : [];
                const connections = connArray.map((c: any) => ({
                    url: c.uri,
                    local: c.local,
                    address: c.address,
                    relay: c.relay || c.uri.includes('relay.plex.direct'),
                    protocol: c.uri.startsWith('https') ? 'https' : 'http'
                }));

                // Priority Order for Auto-Selection:
                // 1. Local HTTP (fastest/most reliable inside home)
                // 2. Local HTTPS (.plex.direct local link)
                // 3. Remote HTTPS (Direct remote access)
                // 4. Relay (Slow but guaranteed fallback)
                const bestConnection = 
                    connections.find((c: any) => c.local && c.protocol === 'http') ||
                    connections.find((c: any) => c.local && c.protocol === 'https') ||
                    connections.find((c: any) => !c.local && !c.relay) ||
                    connections.find((c: any) => c.relay) ||
                    connections[0];

                return {
                    name: s.name,
                    product: s.product,
                    productVersion: s.productVersion,
                    platform: s.platform,
                    machineId: s.clientIdentifier,
                    url: bestConnection?.url,
                    connections: connections.sort((a: any, b: any) => {
                        // Sort by priority for the resolver
                        if (a.local && !b.local) return -1;
                        if (!a.local && b.local) return 1;
                        if (!a.relay && b.relay) return -1;
                        if (a.relay && !b.relay) return 1;
                        return 0;
                    })
                };
            });

        return NextResponse.json({ servers });

    } catch (err: any) {
        console.error('Plex Discovery Error Detail:', {
            message: err.message,
            cause: err.cause
        });
        return NextResponse.json({ 
            error: 'Discovery Failed', 
            details: err.message,
            cause: err.cause?.message
        }, { status: 500 });
    }
}

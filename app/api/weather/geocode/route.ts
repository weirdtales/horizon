import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.toUpperCase() === 'ABOUT:BLANK') {
        return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }

    try {
        console.log(`[GEODECODE]: Proxying request for "${q}"`);
        
        // Use a standard fetch without headers first to see if it's a header issue
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
            headers: {
                'User-Agent': 'Horizon-Dashboard/1.0',
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            const statusText = res.statusText || 'Unknown';
            console.error(`[GEODECODE ERROR]: Nominatim returned ${res.status} (${statusText})`);
            return NextResponse.json({ error: `Geocoding service error: ${res.status}` }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error('[GEODECODE_PROXY_CRASH]:', err.message || err);
        return NextResponse.json({ 
            error: 'Server internal error during geocoding',
            details: err.message 
        }, { status: 500 });
    }
}

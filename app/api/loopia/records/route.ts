import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const subdomain = searchParams.get('subdomain');
    if (!domain || !subdomain) return NextResponse.json({ error: 'Missing domain or subdomain parameter' }, { status: 400 });

    try {
        const records = await callLoopia('getZoneRecords', [domain, subdomain]);
        return NextResponse.json({ records });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { domain, subdomain, record } = await request.json();
        await callLoopia('addZoneRecord', [domain, subdomain, record]);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { domain, subdomain, record } = await request.json();
        await callLoopia('updateZoneRecord', [domain, subdomain, record]);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { domain, subdomain, record_id } = await request.json();
        if (!domain || !subdomain || record_id === undefined) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await callLoopia('removeZoneRecord', [domain, subdomain, parseInt(record_id, 10)]);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

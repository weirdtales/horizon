import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const subdomain = searchParams.get('subdomain');
    if (!domain || !subdomain)
        return NextResponse.json({ error: 'Missing domain or subdomain parameter' }, { status: 400 });

    try {
        const records = await callLoopia('getZoneRecords', [domain, subdomain]);
        return NextResponse.json({ records });
    } catch (err) {
        console.error('[Loopia GET Error]:', err);
        return NextResponse.json({ error: 'Failed to retrieve Loopia records' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // CSRF Protection
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (process.env.NODE_ENV === 'production' && origin && host && !origin.includes(host)) {
        return NextResponse.json({ error: 'Forbidden: Cross-site request blocked' }, { status: 403 });
    }

    try {
        const { domain, subdomain, record } = await request.json();
        await callLoopia('addZoneRecord', [domain, subdomain, record]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Loopia POST Error]:', err);
        return NextResponse.json({ error: 'Failed to add Loopia record' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // CSRF Protection
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (process.env.NODE_ENV === 'production' && origin && host && !origin.includes(host)) {
        return NextResponse.json({ error: 'Forbidden: Cross-site request blocked' }, { status: 403 });
    }

    try {
        const { domain, subdomain, record } = await request.json();
        await callLoopia('updateZoneRecord', [domain, subdomain, record]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Loopia PUT Error]:', err);
        return NextResponse.json({ error: 'Failed to update Loopia record' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // CSRF Protection
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (process.env.NODE_ENV === 'production' && origin && host && !origin.includes(host)) {
        return NextResponse.json({ error: 'Forbidden: Cross-site request blocked' }, { status: 403 });
    }

    try {
        const { domain, subdomain, record_id } = await request.json();
        if (!domain || !subdomain || record_id === undefined) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await callLoopia('removeZoneRecord', [domain, subdomain, parseInt(record_id, 10)]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Loopia DELETE Error]:', err);
        return NextResponse.json({ error: 'Failed to delete Loopia record' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    if (!domain) return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });

    try {
        const subdomains = await callLoopia('getSubdomains', [domain]);
        return NextResponse.json({ subdomains });
    } catch (err) {
        console.error('[Loopia Subdomain GET Error]:', err);
        return NextResponse.json({ error: 'Failed to retrieve subdomains' }, { status: 500 });
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
        const { domain, subdomain } = await request.json();
        if (!domain || !subdomain) return NextResponse.json({ error: 'Missing domain or subdomain' }, { status: 400 });

        await callLoopia('addSubdomain', [domain, subdomain]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Loopia Subdomain POST Error]:', err);
        return NextResponse.json({ error: 'Failed to add subdomain' }, { status: 500 });
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
        const { domain, subdomain } = await request.json();
        if (!domain || !subdomain) return NextResponse.json({ error: 'Missing domain or subdomain' }, { status: 400 });

        await callLoopia('removeSubdomain', [domain, subdomain]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Loopia Subdomain DELETE Error]:', err);
        return NextResponse.json({ error: 'Failed to remove subdomain' }, { status: 500 });
    }
}

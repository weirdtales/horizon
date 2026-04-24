import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    if (!domain) return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });

    try {
        const subdomains = await callLoopia('getSubdomains', [domain]);
        return NextResponse.json({ subdomains });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { domain, subdomain } = await request.json();
        if (!domain || !subdomain) return NextResponse.json({ error: 'Missing domain or subdomain' }, { status: 400 });

        await callLoopia('addSubdomain', [domain, subdomain]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { domain, subdomain } = await request.json();
        if (!domain || !subdomain) return NextResponse.json({ error: 'Missing domain or subdomain' }, { status: 400 });

        await callLoopia('removeSubdomain', [domain, subdomain]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

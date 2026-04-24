import { NextResponse } from 'next/server';
import { getNpmProxyHosts } from '@/lib/npm';

export async function GET() {
    try {
        const hosts = await getNpmProxyHosts();
        return NextResponse.json({ success: true, hosts });
    } catch (err: any) {
        console.error('NPM Proxy Hosts API Error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch NPM proxy hosts' }, { status: 500 });
    }
}

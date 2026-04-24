import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: zoneId } = await params;
    const settings = await getSettings();
    const cf = settings.cloudflare;

    if (!cf || !cf.token) {
        return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 400 });
    }

    let timeoutId: NodeJS.Timeout | undefined;
    try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);

        const headers = { 
            'Authorization': `Bearer ${cf.token}`,
            'Content-Type': 'application/json'
        };

        // Fetch DNS records for the zone
        const dnsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, { 
            headers, 
            cache: 'no-store',
            signal: controller.signal
        });

        if (!dnsRes.ok) {
            throw new Error(`DNS API error: ${dnsRes.status}`);
        }

        const dnsData = await dnsRes.json();
        const records = dnsData.result || [];

        // Fetch Zone details for metadata
        const zoneRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, { 
            headers, 
            cache: 'no-store',
            signal: controller.signal
        });

        if (!zoneRes.ok) {
            console.error(`Zone Detail Fetch Error: ${zoneRes.status}`);
            return NextResponse.json({ error: 'Failed to fetch zone details' }, { status: zoneRes.status });
        }

        const zoneData = await zoneRes.json();
        const zone = zoneData.result;
        
        clearTimeout(timeoutId);

        return NextResponse.json({
            status: 'online',
            zone: zone ? {
                id: zone.id,
                name: zone.name,
                status: zone.status,
                paused: zone.paused,
                plan: zone.plan?.name || 'Free',
                name_servers: zone.name_servers,
                development_mode: zone.development_mode > 0
            } : null,
            records: records.map((r: {
                id: string;
                type: string;
                name: string;
                content: string;
                proxiable: boolean;
                proxied: boolean;
                ttl: number;
                locked: boolean;
                created_on: string;
                modified_on: string;
            }) => ({
                id: r.id,
                type: r.type,
                name: r.name,
                content: r.content,
                proxiable: r.proxiable,
                proxied: r.proxied,
                ttl: r.ttl,
                locked: r.locked,
                created_on: r.created_on,
                modified_on: r.modified_on
            }))
        });

    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    } finally {
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const settings = await getSettings();
    const cf = settings.cloudflare;
    if (!cf || !cf.token) return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 400 });

    try {
        const body = await request.json();
        
        if (body.record_id) {
            const { record_id, ...record } = body;
            const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${id}/dns_records/${record_id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${cf.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            const data = await res.json();
            if (!res.ok) return NextResponse.json(data, { status: res.status });
            return NextResponse.json(data);
        }

        const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${id}/dns_records`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${cf.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: zoneId } = await params;
    const settings = await getSettings();
    const cf = settings.cloudflare;
    if (!cf || !cf.token) return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 400 });

    try {
        const body = await request.json();
        if (!body.record_id) {
            return NextResponse.json({ error: 'record_id is required' }, { status: 400 });
        }
        
        const { record_id, ...record } = body;
        const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record_id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${cf.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: zoneId } = await params;
    const settings = await getSettings();
    const cf = settings.cloudflare;
    if (!cf || !cf.token) return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 400 });

    try {
        const body = await request.json();
        if (!body.record_id) {
            return NextResponse.json({ error: 'record_id is required' }, { status: 400 });
        }

        const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${body.record_id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${cf.token}`, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}

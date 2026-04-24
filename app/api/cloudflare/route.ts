import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET() {
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

        // 1. Fetch Zones (Domains) with more metadata
        const zonesRes = await fetch('https://api.cloudflare.com/client/v4/zones', { 
            headers, 
            cache: 'no-store',
            signal: controller.signal
        });
        if (!zonesRes.ok) throw new Error(`Zones API error: ${zonesRes.status}`);
        const zonesData = await zonesRes.json();
        const zones = zonesData.result || [];

        // 2. Aggregate Global Analytics
        let totalBandwidth = 0;
        let totalThreats = 0;
        let totalRequests = 0;
        let totalPageViews = 0;
        let totalUniques = 0;
        let totalCached = 0;

        // Fetch stats for the first few zones to build an overview
        const analyticsPromises = zones.slice(0, 10).map((zone: { id: string }) => 
            fetch(`https://api.cloudflare.com/client/v4/zones/${zone.id}/analytics/dashboard?since=-1440`, { 
                headers, 
                cache: 'no-store',
                signal: controller.signal
            })
                .then(async r => {
                    if (!r.ok) return { error: `HTTP ${r.status}`, statusText: r.statusText };
                    return r.json();
                })
                .catch(() => null)
        );

        const analyticsResults = await Promise.all(analyticsPromises);
        clearTimeout(timeoutId);

        // Track per-zone metrics too
        const zoneMetrics: Record<string, {
            requests: number;
            bandwidth: number;
            threats: number;
            uniques: number;
            pageviews: number;
            cacheRatio: string;
        }> = {};

        analyticsResults.forEach((res, index) => {
            if (res?.result?.totals) {
                const t = res.result.totals;
                const zoneId = zones[index].id;
                
                const bandwidth = t.bandwidth?.all || 0;
                const threats = t.threats?.all || 0;
                const requests = t.requests?.all || 0;
                const pageviews = t.pageviews?.all || 0;
                const uniques = t.uniques?.all || 0;
                const cached = t.requests?.cached || 0;

                totalBandwidth += bandwidth;
                totalThreats += threats;
                totalRequests += requests;
                totalPageViews += pageviews;
                totalUniques += uniques;
                totalCached += cached;

                zoneMetrics[zoneId] = {
                    requests,
                    bandwidth,
                    threats,
                    uniques,
                    pageviews,
                    cacheRatio: requests > 0 ? ((cached / requests) * 100).toFixed(1) : "0"
                };
            }
        });

        const globalCacheRatio = totalRequests > 0 ? (totalCached / totalRequests) * 100 : 0;

        return NextResponse.json({
            status: 'online',
            domains: zones.map((z: { id: string; name: string; status: string; paused: boolean; plan?: { name: string }; name_servers: string[]; development_mode: number }) => ({
                id: z.id,
                name: z.name,
                status: z.status,
                paused: z.paused,
                plan: z.plan?.name || 'Free',
                name_servers: z.name_servers,
                development_mode: z.development_mode > 0,
                metrics: zoneMetrics[z.id] || null
            })),
            totals: {
                bandwidth: totalBandwidth,
                threats: totalThreats,
                requests: totalRequests,
                pageviews: totalPageViews,
                uniques: totalUniques,
                cacheRatio: globalCacheRatio.toFixed(1)
            }
        });

    } catch (err) {
        console.error('Cloudflare API Error:', err);
        return NextResponse.json({ 
            error: 'Failed to reach Cloudflare'
        }, { status: 500 });
    } finally {
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
    }
}

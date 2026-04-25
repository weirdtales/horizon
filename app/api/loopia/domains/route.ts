import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';

export async function GET() {
    try {
        const domains = (await callLoopia('getDomains')) as { domain: string }[];

        // Construct detailed domain objects safely
        const domainsWithMeta = domains
            .map((d: { domain: string }) => {
                return {
                    domain: d.domain || 'unknown',
                    status: 'OK',
                };
            })
            .filter((d: { domain: string }) => typeof d.domain === 'string' && d.domain !== 'unknown');

        return NextResponse.json({
            domains: domainsWithMeta,
            totals: {
                count: domainsWithMeta.length,
                active_zones: domainsWithMeta.length, // Mapping domains to active zones for UI consistency
                cluster_health: 'stable',
                status: 'OK',
                last_sync: new Date().toISOString(),
            },
        });
    } catch (err: unknown) {
        console.error('Loopia domains API Error:', err);
        return NextResponse.json(
            {
                error: 'Failed to reach Loopia API',
            },
            { status: 500 }
        );
    }
}

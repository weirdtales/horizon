import { NextResponse } from 'next/server';
import { callLoopia } from '@/lib/loopia';

export async function GET() {
    try {
        const domains = await callLoopia('getDomains');
        
        // Construct detailed domain objects safely
        const domainsWithMeta = domains.map((d: any) => {
            const domainName = typeof d === 'string' ? d : d?.domain;
            return {
                domain: domainName || 'unknown',
                status: 'OK',
            };
        }).filter((d: any) => d.domain !== 'unknown');

        return NextResponse.json({ 
            domains: domainsWithMeta,
            totals: {
                count: domainsWithMeta.length,
                status: 'OK',
                last_sync: new Date().toISOString()
            }
        });
    } catch (err: any) {
        console.error('Loopia domains API Error:', err);
        return NextResponse.json({ 
            error: 'Failed to reach Loopia API'
        }, { status: 500 });
    }
}

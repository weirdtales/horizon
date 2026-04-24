import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET() {
    const settings = await getSettings();
    const proxmox = settings.proxmox;

    if (!proxmox || !proxmox.host || !proxmox.tokenId || !proxmox.tokenSecret) {
        return NextResponse.json({ error: 'Proxmox not configured' }, { status: 400 });
    }

    let timeoutId: NodeJS.Timeout | undefined;
    try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);

        // Remove trailing slash if present
        const baseUrl = proxmox.host.replace(/\/$/, '');
        
        // Proxmox Token Auth Header: PVEAPIToken=USER@REALM!TOKENID=SECRET
        const authHeader = `PVEAPIToken=${proxmox.tokenId}=${proxmox.tokenSecret}`;

        // 1. Fetch Nodes
        const nodesRes = await fetch(`${baseUrl}/api2/json/nodes`, {
            headers: { 'Authorization': authHeader },
            cache: 'no-store',
            signal: controller.signal
        });

        if (!nodesRes.ok) throw new Error(`HTTP ${nodesRes.status}`);
        const nodesData = await nodesRes.json();
        const nodes = nodesData.data || [];

        // 2. Fetch VMs/LXC for each node (simplified)
        let resources = [];
        try {
            const allResourcesRes = await fetch(`${baseUrl}/api2/json/cluster/resources?type=vm`, {
                headers: { 'Authorization': authHeader },
                cache: 'no-store',
                signal: controller.signal
            });
            
            if (allResourcesRes.ok) {
                const resourcesData = await allResourcesRes.json();
                resources = resourcesData.data || [];
            } else {
                console.warn(`Proxmox cluster resources returned status: ${allResourcesRes.status}`);
            }
        } catch (resErr) {
            console.error('Failed to fetch Proxmox resources:', resErr);
            // Non-blocking: we still have node data
        }

        clearTimeout(timeoutId);
        timeoutId = undefined;

        return NextResponse.json({
            status: 'online',
            nodes: (Array.isArray(nodes) ? nodes : []).map((n: any) => ({
                name: n.node,
                status: n.status,
                cpu: n.cpu || 0,
                maxcpu: n.maxcpu || 1,
                mem: n.mem || 0,
                maxmem: n.maxmem || 1,
                uptime: n.uptime || 0
            })),
            vms: (Array.isArray(resources) ? resources : []).map((r: any) => ({
                id: r.vmid,
                name: r.name,
                status: r.status,
                type: r.type,
                node: r.node,
                cpu: r.cpu || 0,
                mem: r.mem || 0,
                maxmem: r.maxmem || 1,
                uptime: r.uptime || 0
            }))
        });

    } catch (err: any) {
        console.error('Proxmox API Error:', err);
        return NextResponse.json({ 
            error: 'Failed to connect to Proxmox',
            details: err.message
        }, { status: 502 });
    } finally {
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
    }
}

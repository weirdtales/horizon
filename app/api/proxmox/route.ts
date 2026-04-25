import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

interface ProxmoxNode {
    node: string;
    status: string;
    cpu?: number;
    maxcpu?: number;
    mem?: number;
    maxmem?: number;
    uptime?: number;
}

interface ProxmoxResource {
    vmid: number;
    name: string;
    status: string;
    type: string;
    node: string;
    cpu?: number;
    mem?: number;
    maxmem?: number;
    uptime?: number;
}

export async function GET() {
    const settings = await getSettings();
    const proxmox = settings.proxmox;

    if (!proxmox || !proxmox.host || !proxmox.tokenId || !proxmox.tokenSecret) {
        return NextResponse.json({ error: 'Proxmox not configured' }, { status: 400 });
    }

    // SSRF / Basic URL Validation
    try {
        const url = new URL(proxmox.host);
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Invalid protocol');
        }
    } catch {
        return NextResponse.json({ error: 'Invalid Proxmox host configuration' }, { status: 400 });
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
            headers: { Authorization: authHeader },
            cache: 'no-store',
            signal: controller.signal,
        });

        if (!nodesRes.ok) throw new Error(`HTTP ${nodesRes.status}`);
        const nodesData = await nodesRes.json();
        const nodes = (nodesData.data || []) as ProxmoxNode[];

        // 2. Fetch VMs/LXC for each node
        let resources: ProxmoxResource[] = [];
        try {
            const allResourcesRes = await fetch(`${baseUrl}/api2/json/cluster/resources?type=vm`, {
                headers: { Authorization: authHeader },
                cache: 'no-store',
                signal: controller.signal,
            });

            if (allResourcesRes.ok) {
                const resourcesData = await allResourcesRes.json();
                resources = (resourcesData.data || []) as ProxmoxResource[];
            }
        } catch (resErr) {
            console.error('Failed to fetch Proxmox resources:', resErr);
        }

        clearTimeout(timeoutId);
        timeoutId = undefined;

        return NextResponse.json({
            status: 'online',
            nodes: nodes.map(n => ({
                name: n.node,
                status: n.status,
                cpu: n.cpu || 0,
                maxcpu: n.maxcpu || 1,
                mem: n.mem || 0,
                maxmem: n.maxmem || 1,
                uptime: n.uptime || 0,
            })),
            vms: resources.map(r => ({
                id: r.vmid,
                name: r.name,
                status: r.status,
                type: r.type,
                node: r.node,
                cpu: r.cpu || 0,
                mem: r.mem || 0,
                maxmem: r.maxmem || 1,
                uptime: r.uptime || 0,
            })),
        });
    } catch (err) {
        console.error('Proxmox API Error:', err);
        return NextResponse.json(
            {
                error: 'Failed to connect to Proxmox',
            },
            { status: 502 }
        );
    } finally {
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
    }
}

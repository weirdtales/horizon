import dynamic from 'next/dynamic';
import React from 'react';

import adguardManifest from '@/modules/adguard/module.json';
import cloudflareManifest from '@/modules/cloudflare/module.json';
import dockgeManifest from '@/modules/dockge/module.json';
import example_helloManifest from '@/modules/example-hello/module.json';
import glancesManifest from '@/modules/glances/module.json';
import homeassistantManifest from '@/modules/homeassistant/module.json';
import immichManifest from '@/modules/immich/module.json';
import loopiaManifest from '@/modules/loopia/module.json';
import npmManifest from '@/modules/npm/module.json';
import piholeManifest from '@/modules/pihole/module.json';
import plexManifest from '@/modules/plex/module.json';
import proxmoxManifest from '@/modules/proxmox/module.json';
import radarrManifest from '@/modules/radarr/module.json';
import scryptedManifest from '@/modules/scrypted/module.json';
import sonarrManifest from '@/modules/sonarr/module.json';
import unifiManifest from '@/modules/unifi/module.json';
import uptimekumaManifest from '@/modules/uptimekuma/module.json';
import weatherManifest from '@/modules/weather/module.json';
import workspaceManifest from '@/modules/workspace/module.json';

export const MODULE_MANIFESTS = [
    adguardManifest,
    cloudflareManifest,
    dockgeManifest,
    example_helloManifest,
    glancesManifest,
    homeassistantManifest,
    immichManifest,
    loopiaManifest,
    npmManifest,
    piholeManifest,
    plexManifest,
    proxmoxManifest,
    radarrManifest,
    scryptedManifest,
    sonarrManifest,
    unifiManifest,
    uptimekumaManifest,
    weatherManifest,
    workspaceManifest,
];

export const MODULE_WIDGETS: Record<string, React.ComponentType<object>> = {
    adguard: dynamic(() => import('@/modules/adguard/widget')),
    cloudflare: dynamic(() => import('@/modules/cloudflare/widget')),
    dockge: dynamic(() => import('@/modules/dockge/widget')),
    'example-hello': dynamic(() => import('@/modules/example-hello/widget')),
    glances: dynamic(() => import('@/modules/glances/widget')),
    homeassistant: dynamic(() => import('@/modules/homeassistant/widget')),
    immich: dynamic(() => import('@/modules/immich/widget')),
    loopia: dynamic(() => import('@/modules/loopia/widget')),
    npm: dynamic(() => import('@/modules/npm/widget')),
    pihole: dynamic(() => import('@/modules/pihole/widget')),
    plex: dynamic(() => import('@/modules/plex/widget')),
    proxmox: dynamic(() => import('@/modules/proxmox/widget')),
    radarr: dynamic(() => import('@/modules/radarr/widget')),
    scrypted: dynamic(() => import('@/modules/scrypted/widget')),
    sonarr: dynamic(() => import('@/modules/sonarr/widget')),
    unifi: dynamic(() => import('@/modules/unifi/widget')),
    uptimekuma: dynamic(() => import('@/modules/uptimekuma/widget')),
    weather: dynamic(() => import('@/modules/weather/widget')),
    workspace: dynamic(() => import('@/modules/workspace/widget')),
};

export const MODULE_VIEWS: Record<string, React.ComponentType<object>> = {
    cloudflare: dynamic(() => import('@/modules/cloudflare/view')),
    'example-hello': dynamic(() => import('@/modules/example-hello/view')),
    loopia: dynamic(() => import('@/modules/loopia/view')),
    plex: dynamic(() => import('@/modules/plex/view')),
    radarr: dynamic(() => import('@/modules/radarr/view')),
    sonarr: dynamic(() => import('@/modules/sonarr/view')),
};

export function getModuleManifest(id: string) {
    return MODULE_MANIFESTS.find(m => m.id === id);
}

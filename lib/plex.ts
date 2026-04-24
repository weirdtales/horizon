import { getSettings, saveSettings } from './settings';
import { Agent } from 'undici';

// Cache structure
interface PlexCache {
    data: unknown;
    timestamp: number;
}

interface PlexConnection {
    uri: string;
    relay: boolean;
    [key: string]: unknown;
}

interface PlexResource {
    clientIdentifier: string;
    name: string;
    connections: PlexConnection[];
    [key: string]: unknown;
}

// Global cache object (persists within the server instance)
const plexGlobalCache: Record<string, PlexCache> = {};
const CACHE_TTL = 60 * 1000; // 60 seconds

// Custom HTTPS agents for TLS control (Compatible with native fetch/undici)
const insecureAgent = new Agent({ 
    keepAliveTimeout: 10 * 1000, 
    keepAliveMaxTimeout: 10 * 1000,
    connect: { rejectUnauthorized: false } 
});

// Track warned URLs to prevent log spam
const warnedUrls = new Set<string>();

/**
 * Gets a working Plex URL (Direct or Relay) using auto-discovery if needed.
 * Now specifically probes root metadata to extract the friendlyName.
 */
export async function getPlexConnection() {
    const settings = await getSettings();
    const plex = settings.plex;

    if (!plex || !plex.token) {
        throw new Error('Plex not configured');
    }

    const headers = {
        'Accept': 'application/json',
        'X-Plex-Token': plex.token,
        'X-Plex-Product': 'Horizon Dashboard',
        'X-Plex-Client-Identifier': 'horizon-dashboard-v1'
    };

    /**
     * Validates and cleans a Plex URL
     */
    const validatePlexUrl = (url: string) => {
        if (!url) return null;
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) return null;
            return parsed.origin.replace(/\/$/, '');
        } catch {
            return null;
        }
    };

    /**
     * Probes a specific URL
     */
    const probe = async (url: string) => {
        const baseUrl = validatePlexUrl(url);
        if (!baseUrl) return null;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const allowInsecure = plex.allowInsecure === true;
            if (allowInsecure && !warnedUrls.has(baseUrl)) {
                console.warn(`[Security] Plex: 'allowInsecure' is enabled for ${baseUrl}. Ensuring secure transport is still recommended.`);
                warnedUrls.add(baseUrl);
            }

            const res = await fetch(`${baseUrl}/`, { 
                headers,
                cache: 'no-store',
                signal: controller.signal,
                // @ts-expect-error - Only use custom dispatcher if explicitly allowed insecure
                dispatcher: allowInsecure ? insecureAgent : undefined
            });
            clearTimeout(timeoutId);
            if (!res.ok) return null;
            const data = await res.json();
            return { baseUrl, identity: data.MediaContainer };
        } catch {
            clearTimeout(timeoutId);
            return null;
        }
    };

    // 1. Try saved URL first
    let connection = await probe(plex.url || '');
    let wasHealed = false;

    // 2. Auto-Discovery if dead
    if (!connection) {
        console.log('Plex Connection Failed. Performing Auto-Discovery...');
        const controller = new AbortController();
        const discTimeout = setTimeout(() => controller.abort(), 10000);
        try {
            const discRes = await fetch('https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1', { 
                headers,
                signal: controller.signal
            });
            clearTimeout(discTimeout);
            if (discRes.ok) {
                const discData = await discRes.json();
                const server = discData.find((item: PlexResource) => item.clientIdentifier === plex.machineId || item.name === plex.serverName);
                
                if (server && server.connections) {
                    // Sort connections: Relay last (slow), Remote first, Local middle
                    // Clone to avoid mutating original settings data
                    const sortedConns = [...server.connections].sort((a: PlexConnection, b: PlexConnection) => {
                        const isRelayA = a.relay || a.uri.includes('relay.plex.direct');
                        const isRelayB = b.relay || b.uri.includes('relay.plex.direct');
                        if (isRelayA && !isRelayB) return 1;
                        if (!isRelayA && isRelayB) return -1;
                        return 0;
                    });

                    for (const conn of sortedConns) {
                        const found = await probe(conn.uri);
                        if (found) {
                            connection = found;
                            wasHealed = true;
                            // Save working URL back to settings for persistence
                            const nextSettings = { 
                                ...settings,
                                plex: { ...settings.plex, url: found.baseUrl }
                            };
                            await saveSettings(nextSettings);
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            clearTimeout(discTimeout);
            console.error('Plex Discovery Error:', err);
        }
    }

    if (!connection) {
        throw new Error('Plex Server Unreachable (Direct, Remote, and Relay all failed)');
    }

    return { 
        url: connection.baseUrl, 
        token: plex.token, 
        headers, 
        identity: JSON.parse(JSON.stringify(connection.identity)), // Clone to prevent mutation
        healed: wasHealed
    };
}

/**
 * Enhanced fetch with 60s in-memory caching
 */
export async function cachedPlexFetch(url: string, headers: Record<string, string>, useCache = true) {
    const now = Date.now();
    const cacheKey = url;

    if (useCache && plexGlobalCache[cacheKey]) {
        const cached = plexGlobalCache[cacheKey];
        if (now - cached.timestamp < CACHE_TTL) {
            const safeUrl = url.replace(/X-Plex-Token=[^&]*/g, 'X-Plex-Token=REDACTED');
            console.log(`[Plex Cache] Hit: ${safeUrl}`);
            return cached.data;
        }
    }

    const safeUrl = url.replace(/X-Plex-Token=[^&]*/g, 'X-Plex-Token=REDACTED');
    console.log(`[Plex Cache] Miss: ${safeUrl}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const settings = await getSettings();
        const allowInsecure = settings.plex?.allowInsecure === true;

        const res = await fetch(url, { 
            headers, 
            cache: 'no-store',
            signal: controller.signal,
            // @ts-expect-error
            dispatcher: allowInsecure ? insecureAgent : undefined
        });
        
        if (!res.ok) throw new Error(`Plex Error: ${res.status}`);
        const data = await res.json();

        if (useCache) {
            plexGlobalCache[cacheKey] = { data, timestamp: now };
        }

        return data;
    } finally {
        clearTimeout(timeoutId);
    }
}

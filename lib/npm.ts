import { getSettings } from './settings';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getNpmToken() {
    const settings = getSettings();
    const { url, user, password } = settings.npm;

    if (!url || !user || !password) {
        throw new Error('Nginx Proxy Manager not configured');
    }

    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const cleanUrl = url.replace(/\/$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const res = await fetch(`${cleanUrl}/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: user, secret: password }),
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error(`NPM Auth Failed: ${res.statusText}`);
        }

        const data = await res.json();
        cachedToken = data.token;
        tokenExpiry = Date.now() + 6 * 3600 * 1000; // 6 hours (standard NPM token lifespan)
        return cachedToken;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function getNpmStats() {
    const token = await getNpmToken();
    const settings = getSettings();
    const cleanUrl = settings.npm.url!.replace(/\/$/, '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const res = await fetch(`${cleanUrl}/reports/hosts`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch NPM stats');
        return await res.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function getNpmProxyHosts() {
    const token = await getNpmToken();
    const settings = getSettings();
    const cleanUrl = settings.npm.url!.replace(/\/$/, '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const res = await fetch(`${cleanUrl}/nginx/proxy-hosts?expand=owner,certificate`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch NPM proxy hosts');
        return await res.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function getNpmRedirectionHosts() {
    const token = await getNpmToken();
    const settings = getSettings();
    const cleanUrl = settings.npm.url!.replace(/\/$/, '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const res = await fetch(`${cleanUrl}/nginx/redirection-hosts`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch NPM redirection hosts');
        return await res.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

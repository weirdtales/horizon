import { getSettings, saveSettings } from './settings';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function getGoogleAuthUrl(clientId: string, redirectUri: string) {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks.readonly',
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true'
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        })
    });

    if (!res.ok) {
        let errorMsg = 'Failed to exchange code';
        try {
            const err = await res.json();
            errorMsg = err.error_description || err.error || errorMsg;
        } catch (e) {
            try {
                errorMsg = await res.text();
            } catch (te) {}
        }
        throw new Error(`${errorMsg} (${res.status} ${res.statusText})`);
    }

    return await res.json();
}

export async function refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })
    });

    if (!res.ok) {
        let errorMsg = 'Failed to refresh token';
        try {
            const err = await res.json();
            errorMsg = err.error_description || err.error || errorMsg;
        } catch (e) {
            try {
                errorMsg = await res.text();
            } catch (te) {}
        }
        throw new Error(`${errorMsg} (${res.status} ${res.statusText})`);
    }

    return await res.json();
}

// Module-level lock to prevent concurrent refreshes
let tokenRefreshPromise: Promise<string> | null = null;

export async function getValidToken() {
    const settings = getSettings();
    const workspace = (settings as any).workspace;

    if (!workspace || !workspace.accessToken) {
        throw new Error('Google Workspace not configured');
    }

    // Check if expired (with 1 min buffer)
    if (workspace.expiryDate && Date.now() < workspace.expiryDate - 60000) {
        return workspace.accessToken;
    }

    if (!workspace.refreshToken) {
        throw new Error('No refresh token available');
    }

    if (!workspace.clientId || !workspace.clientSecret) {
        throw new Error('Missing Google Client ID or Client Secret');
    }

    // If a refresh is already in progress, wait for it
    if (tokenRefreshPromise) {
        return tokenRefreshPromise;
    }

    tokenRefreshPromise = (async () => {
        try {
            const tokens = await refreshAccessToken(workspace.clientId!, workspace.clientSecret!, workspace.refreshToken!);
            
            if (!tokens || !tokens.access_token || typeof tokens.access_token !== 'string') {
                throw new Error('Invalid refresh response from Google');
            }

            // Update settings with new token
            const updatedWorkspace = {
                ...workspace,
                accessToken: tokens.access_token,
                expiryDate: Date.now() + (Number(tokens.expires_in || 3600) * 1000)
            };

            saveSettings({ ...settings, workspace: updatedWorkspace });
            return tokens.access_token;
        } finally {
            // Clear the lock so future refreshes can proceed
            tokenRefreshPromise = null;
        }
    })();

    return tokenRefreshPromise;
}

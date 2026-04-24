import { getSettings, saveSettings } from '@/lib/settings';
import { exchangeCodeForToken } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/settings?error=' + encodeURIComponent(error), request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/settings?error=no_code', request.url));
    }

    const settings = getSettings();
    const workspace = (settings as any).workspace;

    if (!workspace || !workspace.clientId || !workspace.clientSecret) {
        return NextResponse.redirect(new URL('/settings?error=missing_config', request.url));
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/workspace/callback`;

    try {
        const tokens = await exchangeCodeForToken(code, workspace.clientId, workspace.clientSecret, redirectUri);
        
        const updatedWorkspace = {
            ...workspace,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || workspace.refreshToken, // Google only sends refresh_token on first consent
            expiryDate: Date.now() + (Number(tokens.expires_in || 3600) * 1000)
        };

        saveSettings({ ...settings, workspace: updatedWorkspace });

        return NextResponse.redirect(new URL('/settings?success=google_linked', request.url));
    } catch (err: any) {
        console.error('Google Auth Error:', err);
        const errorMessage = err?.message || String(err) || 'Unknown error';
        return NextResponse.redirect(new URL('/settings?error=' + encodeURIComponent(errorMessage), request.url));
    }
}

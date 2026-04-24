import { getSettings } from '@/lib/settings';
import { getGoogleAuthUrl } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET() {
    const settings = getSettings();
    const workspace = (settings as any).workspace;

    if (!workspace || !workspace.clientId || !workspace.clientSecret) {
        return NextResponse.json({ error: 'Client ID and Secret must be configured in settings first.' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/workspace/callback`;

    try {
        const url = getGoogleAuthUrl(workspace.clientId, redirectUri);
        return NextResponse.redirect(url);
    } catch (err) {
        console.error('[Google Auth Error]:', err);
        return NextResponse.json({ error: 'Failed to generate authentication URL.' }, { status: 500 });
    }
}

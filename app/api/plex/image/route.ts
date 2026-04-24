import { NextResponse } from 'next/server';
import { getPlexConnection } from '@/lib/plex';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        if (!path) {
            return new Response('Path is required', { status: 400 });
        }

        // SSRF Protection: Ensure path is relative and doesn't contain a protocol
        if (path.includes('://') || path.startsWith('//')) {
            return new Response('Invalid path', { status: 400 });
        }

        // SSRF Hardening: Allow only known Plex image prefixes
        const allowedPrefixes = ['/photo/:/transcode', '/library/metadata', '/library/sections'];
        const isAllowed = allowedPrefixes.some(prefix => path.startsWith(prefix));
        
        if (!isAllowed) {
            console.warn(`Blocked potentially malicious Plex image path: ${path}`);
            return new Response('Forbidden path', { status: 403 });
        }

        const { url, headers } = await getPlexConnection();

        // Construct the full Plex URL safely
        const plexUrl = new URL(path.startsWith('/') ? path : `/${path}`, url).toString();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const res = await fetch(plexUrl, {
                headers,
                cache: 'force-cache',
                signal: controller.signal,
                next: { revalidate: 3600 }
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                return new Response('Failed to fetch image from Plex', { status: res.status });
            }

            const contentType = res.headers.get('Content-Type') || 'image/jpeg';
            if (!contentType.startsWith('image/')) {
                console.warn(`Plex Image Proxy: Blocked non-image MIME type: ${contentType}`);
                return new Response('Invalid image content', { status: 415 });
            }

            const blob = await res.blob();
            const responseHeaders = new Headers();
            
            // Pass through essential metadata - using validated contentType
            responseHeaders.set('Content-Type', contentType);
            responseHeaders.set('Cache-Control', 'public, max-age=3600');

            return new Response(blob, {
                headers: responseHeaders
            });
        } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                return new Response('Plex image fetch timed out', { status: 504 });
            }
            throw fetchErr;
        }

    } catch (err: any) {
        console.error('Plex Image Proxy Error:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}

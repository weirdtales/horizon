import { NextResponse } from 'next/server';
import { getPlexConnection, cachedPlexFetch } from '@/lib/plex';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Validate ID (allow digits, letters, underscores, hyphens)
        if (!/^[A-Za-z0-9_-]+$/.test(id)) {
            return NextResponse.json({ error: 'Invalid Library ID format' }, { status: 400 });
        }

        const sanitizedId = encodeURIComponent(id);
        
        // Use shared logic to ensure we have a WORKING connection (Healed if necessary)
        const { url, token, headers } = await getPlexConnection();

        // Fetch section contents with caching (100 recent items)
        const data = await cachedPlexFetch(
            `${url}/library/sections/${sanitizedId}/all?X-Plex-Container-Start=0&X-Plex-Container-Size=100`, 
            headers
        );

        const items = data.MediaContainer?.Metadata?.map((m: any) => ({
            id: m.ratingKey,
            title: m.title,
            year: m.year,
            type: m.type,
            summary: m.summary,
            rating: m.contentRating,
            studio: m.studio,
            genres: m.Genre?.map((g: any) => g.tag) || [],
            thumb: m.thumb ? `/api/plex/image?path=${encodeURIComponent(m.thumb)}` : null,
            art: m.art ? `/api/plex/image?path=${encodeURIComponent(m.art)}` : null,
            addedAt: m.addedAt
        })) || [];

        return NextResponse.json({
            libraryTitle: data.MediaContainer?.title1 || 'Library',
            totalSize: data.MediaContainer?.totalSize || items.length,
            items
        });

    } catch (err: any) {
        console.error('Plex Library Fetch Error:', err);
        return NextResponse.json({ 
            error: 'Failed to fetch library content'
        }, { status: 500 });
    }
}

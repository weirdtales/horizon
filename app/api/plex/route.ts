import { NextResponse } from 'next/server';
import { getPlexConnection, cachedPlexFetch } from '@/lib/plex';

export const dynamic = 'force-dynamic';

interface PlexDirectory {
    key: string;
    title: string;
    type: string;
    updatedAt: number;
}

interface PlexMediaContainer {
    MediaContainer: {
        Directory?: PlexDirectory[];
        Metadata?: PlexMetadata[];
        totalSize?: string;
    };
}

interface PlexMetadata {
    title: string;
    parentTitle?: string;
    grandparentTitle?: string;
    User?: { title: string };
    Player?: { title: string; state: string };
    type: string;
    viewOffset?: number;
    duration?: number;
    thumb?: string;
    art?: string;
}

export async function GET() {
    try {
        // Use shared logic for discovery and healing
        const { url, headers, identity, healed } = await getPlexConnection();

        // Fetch Data using cached helper (60s TTL)
        const [sessionsDataRaw, libraryDataRaw] = await Promise.all([
            cachedPlexFetch(`${url}/status/sessions`, headers),
            cachedPlexFetch(`${url}/library/sections`, headers),
        ]);

        const sessionsData = sessionsDataRaw as unknown as PlexMediaContainer;
        const libraryData = libraryDataRaw as unknown as PlexMediaContainer;

        const directories = libraryData.MediaContainer?.Directory || [];

        // Fetch counts for libraries (Cache individual library responses too)
        const detailedLibraries = await Promise.all(
            directories.slice(0, 5).map(async (d: PlexDirectory) => {
                try {
                    const data = (await cachedPlexFetch(
                        `${url}/library/sections/${d.key}/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0`,
                        headers
                    )) as unknown as PlexMediaContainer;
                    return {
                        id: d.key,
                        title: d.title,
                        type: d.type,
                        count: parseInt(data.MediaContainer?.totalSize || '0'),
                        updatedAt: d.updatedAt,
                    };
                } catch (err) {
                    console.error(`Failed to fetch count for Plex library ${d.title} (${d.key}):`, err);
                    return { id: d.key, title: d.title, type: d.type, count: 0, updatedAt: d.updatedAt };
                }
            })
        );

        return NextResponse.json({
            status: 'online',
            healed,
            url,
            server: {
                name: identity?.friendlyName || identity?.machineIdentifier || 'Plex Media Server',
                version: identity?.version || '0.0.0',
                platform: identity?.platform || 'Unknown',
                machineId: identity?.machineIdentifier || 'unknown-id',
            },
            sessions:
                sessionsData.MediaContainer?.Metadata?.map((m: PlexMetadata) => ({
                    title: m.title,
                    parentTitle: m.parentTitle || m.grandparentTitle,
                    user: m.User?.title,
                    player: m.Player?.title,
                    state: m.Player?.state,
                    type: m.type,
                    viewOffset: m.viewOffset,
                    duration: m.duration,
                    thumb: m.thumb ? `/api/plex/image?path=${encodeURIComponent(m.thumb)}` : null,
                    art: m.art ? `/api/plex/image?path=${encodeURIComponent(m.art)}` : null,
                })) || [],
            libraries: detailedLibraries,
        });
    } catch (err) {
        console.error('Plex connection API error:', err);
        return NextResponse.json(
            {
                status: 'offline',
                error: 'Connection Failed',
            },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

interface RadarrMovie {
    id: number;
    title: string;
    hasFile: boolean;
    monitored: boolean;
    sizeOnDisk?: number;
    added?: string;
    year: number;
    images?: { coverType: string; remoteUrl: string }[];
}

interface RadarrQueueItem {
    id: number;
    title: string;
    size: number;
    sizeleft: number;
    status: string;
    trackedDownloadStatus: string;
    timeleft?: string;
    estimatedCompletionTime?: string;
}

export async function GET() {
    const settings = await getSettings();
    const config = settings.radarr;

    if (!config || !config.url || !config.apiKey) {
        return NextResponse.json({ error: 'Radarr not configured' }, { status: 400 });
    }

    let timeoutId: NodeJS.Timeout | undefined;
    try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);

        const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
        const headers = { 'X-Api-Key': config.apiKey };

        // 1. Fetch Movies
        const moviesRes = await fetch(`${baseUrl}/api/v3/movie`, {
            headers,
            cache: 'no-store',
            signal: controller.signal,
        });
        if (!moviesRes.ok) throw new Error(`Radarr Movies API error: ${moviesRes.status}`);
        const movies: RadarrMovie[] = await moviesRes.json();

        // 2. Fetch Queue (Active Downloads)
        let queue: RadarrQueueItem[] = [];
        try {
            const queueRes = await fetch(`${baseUrl}/api/v3/queue?includeUnknownMovieMovieItems=true`, {
                headers,
                cache: 'no-store',
                signal: controller.signal,
            });

            if (queueRes.ok) {
                const queueData = await queueRes.json();
                queue = queueData.records || [];
            } else {
                console.warn(`Radarr Queue API returned status: ${queueRes.status}`);
            }
        } catch (queueErr) {
            console.error('Failed to fetch Radarr queue:', queueErr);
        }

        clearTimeout(timeoutId);

        // 3. Process Stats
        const totalMovies = movies.length;
        const downloadedMovies = movies.filter(m => m.hasFile).length;
        const missingMovies = movies.filter(m => !m.hasFile && m.monitored).length;
        const totalSize = movies.reduce((acc, m) => acc + (m.sizeOnDisk || 0), 0);

        // 4. Process Active Downloads
        const activeDownloads = queue.map(item => ({
            id: item.id,
            title: item.title,
            size: item.size || 0,
            sizeleft: item.sizeleft || 0,
            status: item.status,
            trackedDownloadStatus: item.trackedDownloadStatus,
            timeleft: item.timeleft,
            estimatedCompletionTime: item.estimatedCompletionTime,
            progress: (() => {
                const size = item.size || 0;
                const sizeleft = item.sizeleft || 0;
                return size > 0 ? Math.max(0, Math.min(100, ((size - sizeleft) / size) * 100)) : 0;
            })(),
        }));

        return NextResponse.json({
            status: 'online',
            stats: {
                total: totalMovies,
                downloaded: downloadedMovies,
                missing: missingMovies,
                totalSize,
            },
            queue: activeDownloads,
            recent: movies
                .filter(m => m.hasFile)
                .sort((a, b) => {
                    const timeA = new Date(a.added || 0).getTime() || 0;
                    const timeB = new Date(b.added || 0).getTime() || 0;
                    return timeB - timeA;
                })
                .slice(0, 30)
                .map(m => ({
                    id: m.id,
                    title: m.title,
                    year: m.year,
                    poster: Array.isArray(m.images)
                        ? m.images.find(img => img.coverType === 'poster')?.remoteUrl || m.images[0]?.remoteUrl
                        : null,
                })),
        });
    } catch (err: unknown) {
        console.error('Radarr API Error:', err);
        return NextResponse.json(
            {
                status: 'offline',
                error: 'Failed to connect to Radarr',
            },
            { status: 502 }
        );
    } finally {
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
    }
}

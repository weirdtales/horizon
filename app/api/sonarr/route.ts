import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

interface SonarrSeries {
    id: number;
    title: string;
    year: number;
    added?: string;
    statistics?: {
        episodeCount: number;
        episodeFileCount: number;
        sizeOnDisk: number;
    };
    images?: { coverType: string; remoteUrl: string }[];
}

interface SonarrQueueItem {
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
    const config = settings.sonarr;

    if (!config || !config.url || !config.apiKey) {
        return NextResponse.json({ error: 'Sonarr not configured' }, { status: 400 });
    }

    let timeoutId: NodeJS.Timeout | undefined;
    try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);

        const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
        const headers = { 'X-Api-Key': config.apiKey };

        // 1. Fetch Series
        const seriesRes = await fetch(`${baseUrl}/api/v3/series`, {
            headers,
            cache: 'no-store',
            signal: controller.signal,
        });
        if (!seriesRes.ok) throw new Error(`Sonarr Series API error: ${seriesRes.status}`);
        const series: SonarrSeries[] = await seriesRes.json();

        // 2. Fetch Queue (Active Downloads)
        let queue: SonarrQueueItem[] = [];
        try {
            const queueRes = await fetch(`${baseUrl}/api/v3/queue?includeUnknownSeriesItems=true`, {
                headers,
                cache: 'no-store',
                signal: controller.signal,
            });

            if (queueRes.ok) {
                const queueData = await queueRes.json();
                queue = queueData.records || [];
            } else {
                console.warn(`Sonarr Queue API returned status: ${queueRes.status}`);
            }
        } catch (queueErr) {
            console.error('Failed to fetch Sonarr queue:', queueErr);
        }

        clearTimeout(timeoutId);

        // 3. Process Stats
        const totalSeries = series.length;
        const downloadedSeries = series.filter(s => s.statistics && (s.statistics.episodeFileCount || 0) > 0).length;
        const missingEpisodes = series.reduce((acc, s) => {
            const stats = s.statistics || { episodeCount: 0, episodeFileCount: 0, sizeOnDisk: 0 };
            return acc + (stats.episodeCount || 0) - (stats.episodeFileCount || 0);
        }, 0);
        const totalSize = series.reduce((acc, s) => acc + (s.statistics?.sizeOnDisk || 0), 0);

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
                total: totalSeries,
                downloaded: downloadedSeries,
                missing: missingEpisodes,
                totalSize,
            },
            queue: activeDownloads,
            recent: series
                .sort((a, b) => {
                    const timeA = new Date(a.added || 0).getTime() || 0;
                    const timeB = new Date(b.added || 0).getTime() || 0;
                    return timeB - timeA;
                })
                .slice(0, 30)
                .map(s => ({
                    id: s.id,
                    title: s.title,
                    year: s.year,
                    poster: Array.isArray(s.images)
                        ? s.images.find(img => img.coverType === 'poster')?.remoteUrl || s.images[0]?.remoteUrl
                        : null,
                })),
        });
    } catch (err: unknown) {
        console.error('Sonarr API Error:', err);
        return NextResponse.json(
            {
                status: 'offline',
                error: 'Failed to connect to Sonarr',
            },
            { status: 502 }
        );
    } finally {
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
    }
}

import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

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
            signal: controller.signal
        });
        if (!moviesRes.ok) throw new Error(`Radarr Movies API error: ${moviesRes.status}`);
        const movies = await moviesRes.json();

        // 2. Fetch Queue (Active Downloads)
        let queue = [];
        try {
            const queueRes = await fetch(`${baseUrl}/api/v3/queue?includeUnknownMovieMovieItems=true`, { 
                headers, 
                cache: 'no-store',
                signal: controller.signal
            });
            
            if (queueRes.ok) {
                const queueData = await queueRes.json();
                queue = queueData.records || [];
            } else {
                console.warn(`Radarr Queue API returned status: ${queueRes.status}`);
            }
        } catch (queueErr) {
            console.error('Failed to fetch Radarr queue:', queueErr);
            // Non-blocking: continue with empty queue if only queue fails
        }
        
        clearTimeout(timeoutId);

        // 3. Process Stats
        const totalMovies = movies.length;
        const downloadedMovies = movies.filter((m: any) => m.hasFile).length;
        const missingMovies = movies.filter((m: any) => !m.hasFile && m.monitored).length;
        const totalSize = movies.reduce((acc: number, m: any) => acc + (m.sizeOnDisk || 0), 0);

        // 4. Process Active Downloads
        const activeDownloads = queue.map((item: any) => ({
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
                return size > 0 ? Math.max(0, Math.min(100, (((size - sizeleft) / size) * 100))) : 0;
            })()
        }));

        return NextResponse.json({
            status: 'online',
            stats: {
                total: totalMovies,
                downloaded: downloadedMovies,
                missing: missingMovies,
                totalSize
            },
            queue: activeDownloads,
            // Return a few recent movies for the widget
            recent: movies
                .filter((m: any) => m.hasFile)
                .sort((a: any, b: any) => {
                    const timeA = new Date(a.added || 0).getTime() || 0;
                    const timeB = new Date(b.added || 0).getTime() || 0;
                    return timeB - timeA;
                })
                .slice(0, 30)
                .map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    year: m.year,
                    poster: Array.isArray(m.images)
                        ? (m.images.find((img: any) => img.coverType === 'poster')?.remoteUrl || m.images[0]?.remoteUrl)
                        : null
                }))
        });

    } catch (err: any) {
        console.error('Radarr API Error:', err);
        return NextResponse.json({ 
            status: 'offline',
            error: 'Failed to connect to Radarr',
            details: err.message
        }, { status: 502 });
    } finally {
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
    }
}

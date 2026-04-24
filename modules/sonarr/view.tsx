"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Video, Download, Database, 
    Loader2, AlertCircle, RefreshCw, Clock
} from 'lucide-react';
import { BackButton } from '@/app/components/BackButton';
import { useMobile } from '@/app/hooks/useMobile';
import { sanitizeUrl } from '@/lib/url';

const formatBytes = (bytes: number) => {
    if (bytes === 0 || isNaN(bytes)) return '0 B';
    const sign = bytes < 0 ? '-' : '';
    const bytesAbs = Math.abs(bytes);
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytesAbs) / Math.log(k)), sizes.length - 1);
    return sign + parseFloat((bytesAbs / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function SonarrView() {
    const [data, setData] = useState<any>(null);
    const isMobile = useMobile(1024);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sonarrFetchControllerRef = React.useRef<AbortController | null>(null);

    const fetchData = React.useCallback(async () => {
        // Abort previous request
        if (sonarrFetchControllerRef.current) {
            sonarrFetchControllerRef.current.abort();
        }
        sonarrFetchControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/sonarr', { signal: sonarrFetchControllerRef.current.signal });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || `System Offline: ${res.status}`);
            }
            
            let result;
            try {
                result = await res.json();
            } catch (e) {
                throw new Error('Failed to parse series data');
            }

            if (result.error) setError(result.error);
            else setData(result);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message || 'Failed to load Sonarr data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        return () => {
            if (sonarrFetchControllerRef.current) {
                sonarrFetchControllerRef.current.abort();
            }
        };
    }, [fetchData]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--md-sys-color-surface)' }}>
                <Loader2 className="animate-spin" size={48} color="#3c9bdc" />
                <div style={{ marginTop: '20px', fontSize: '14px', fontWeight: 900, color: '#3c9bdc', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Scanning Series Database...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-on-surface)' }}>
                <AlertCircle size={48} color="#ef4444" />
                <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 700 }}>Sonarr Offline</div>
                <div style={{ opacity: 0.5, marginTop: '8px' }}>{error || 'Could not connect to the Sonarr API service.'}</div>
                <Link href="/" style={{ marginTop: '24px', color: '#3c9bdc', textDecoration: 'none', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="md3-master-detail-grid">
            {/* Master Sidebar (Stats & Transfers) */}
            <aside className="md3-sidebar">
                <div style={{ marginBottom: isMobile ? '0' : '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <BackButton />
                    <div>
                        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: 'var(--md-sys-color-on-surface)' }}>Sonarr</h1>
                        <div style={{ fontSize: isMobile ? '12px' : '13px', opacity: 0.5, fontWeight: 700, marginTop: '4px' }}>TV Series Management</div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { label: 'Series', value: data?.stats?.total || 0, icon: Video, color: '#3c9bdc', bgColor: 'rgba(60, 155, 220, 0.15)' },
                        { label: 'Missing', value: data?.stats?.missing || 0, icon: AlertCircle, color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.15)' },
                        { label: 'Storage', value: formatBytes(data?.stats?.totalSize || 0), icon: Database, color: 'var(--md-sys-color-primary)', bgColor: 'var(--md-sys-color-primary-container)' }
                    ].map(stat => (
                        <div key={stat.label} style={{ background: 'var(--md-sys-color-surface-container)', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                             <div style={{ background: stat.bgColor, color: stat.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 900 }}>{stat.value}</div>
                                <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 800, textTransform: 'uppercase' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Active Transfers */}
                <div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Download size={16} color="#3c9bdc" />
                        <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Downloads</h3>
                    </div>

                    {(data?.queue || []).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(data?.queue || []).map((item: any) => (
                                <div key={item.id} style={{ background: 'var(--md-sys-color-surface-container-high)', borderRadius: '16px', padding: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                    <div style={{ width: '100%', height: '4px', background: 'var(--md-sys-color-surface-container-highest)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                                        <div style={{ width: `${Math.min(100, Math.max(0, item.progress))}%`, height: '100%', background: '#3c9bdc', borderRadius: '2px' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, opacity: 0.6 }}>
                                        <span>{Math.round(item.progress)}%</span>
                                        <span>{item.timeleft || 'ETA...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '24px', textAlign: 'center', background: 'var(--md-sys-color-surface-container)', borderRadius: '16px', border: '1px dashed var(--md-sys-color-outline-variant)', opacity: 0.4 }}>
                            <div style={{ fontSize: '11px', fontWeight: 700 }}>Signals Nominal</div>
                        </div>
                    )}
                </div>

                 <div style={{ marginTop: 'auto' }}>
                      <button onClick={() => fetchData()} className="m3-press-effect" style={{ width: '100%', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', padding: '14px', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Sync Database
                    </button>
                </div>
            </aside>

            {/* Detail Content (Series Gallery) */}
            <main style={{ padding: isMobile ? '24px 16px' : '48px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={isMobile ? 20 : 24} color="#3c9bdc" />
                        <h2 style={{ fontSize: isMobile ? '20px' : '32px', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>Recently Added</h2>
                    </div>
                </div>

                <div className="md3-poster-grid">
                    {Array.isArray(data?.recent) ? (data?.recent || []).map((series: any, i: number) => (
                        <div key={series.id} className="md3-poster-card m3-press-effect" style={{ 
                            animation: `fadeIn 0.5s ease ${i * 0.01}s both`,
                            border: 'none',
                            padding: 0
                        }}>
                             <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <Image 
                                    src={sanitizeUrl(series.poster)}
                                    alt={series.title} 
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://raw.githubusercontent.com/Sonarr/Sonarr/develop/src/Sonarr.GUI/Content/Images/logo.png';
                                    }}
                                    unoptimized
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{series.title}</div>
                                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{series.year}</div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5, padding: '40px' }}>
                            No recent series found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

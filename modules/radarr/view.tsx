'use client';

import { useEffect, useState } from 'react';
import { Film, Loader2, Activity, RefreshCw, HardDrive } from 'lucide-react';
import { BackButton } from '@/app/components/BackButton';
import { MD3Toast, ToastType } from '@/app/components/MD3Toast';
import { useMobile } from '@/app/hooks/useMobile';

interface RadarrQueueItem {
    title: string;
    progress: number;
    status: string;
    timeleft?: string;
}

interface RadarrData {
    stats: {
        total: number;
        totalSize: number;
    };
    queue: RadarrQueueItem[];
}

export default function RadarrView() {
    const [data, setData] = useState<RadarrData | null>(null);
    const isMobile = useMobile(1024);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const apiRes = await fetch('/api/radarr', { signal: controller.signal });
                if (!apiRes.ok) throw new Error(`Status: ${apiRes.status}`);
                const apiData = await apiRes.json();
                setData(apiData);
                setError(null);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError(err instanceof Error ? err.message : 'Failed to reach Radarr');
                setToast({ message: 'Communication severed with Radarr Hub.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--md-sys-color-surface)',
                }}
            >
                <Loader2 className="animate-spin" size={48} color="#ffc107" />
                <div
                    style={{
                        marginTop: '20px',
                        fontSize: '14px',
                        fontWeight: 900,
                        color: '#ffc107',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                    }}
                >
                    Scanning Film Archives...
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                padding: isMobile ? '24px 16px 120px 16px' : '48px',
                backgroundColor: 'var(--md-sys-color-surface)',
                overflowX: 'hidden',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.5s ease' }}>
                <header>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <BackButton />
                        <div
                            style={{
                                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                color: '#ffc107',
                                padding: '6px 14px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 900,
                                border: '1px solid rgba(255, 193, 7, 0.2)',
                            }}
                        >
                            RADARR CORE
                        </div>
                    </div>
                    <h1
                        style={{
                            fontSize: isMobile ? '36px' : '48px',
                            fontWeight: 900,
                            margin: 0,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        Cinema Collection
                    </h1>
                    <p
                        style={{
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontSize: '18px',
                            margin: '8px 0 0 0',
                            opacity: 0.7,
                        }}
                    >
                        Managing your private high-definition film estate.
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                    }}
                >
                    <div
                        className="md3-card-elevated"
                        style={{
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(16px)',
                            borderRadius: '28px',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                        }}
                    >
                        <div
                            style={{
                                padding: '12px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                color: '#ffc107',
                                width: 'fit-content',
                            }}
                        >
                            <Film size={24} />
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    color: 'var(--md-sys-color-on-surface-variant)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                }}
                            >
                                Library Size
                            </div>
                            <div
                                style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', margin: '4px 0' }}
                            >
                                {data?.stats?.total || 0}
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.5 }}>Managed Titles</div>
                        </div>
                    </div>
                    <div
                        className="md3-card-elevated"
                        style={{
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(16px)',
                            borderRadius: '28px',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                        }}
                    >
                        <div
                            style={{
                                padding: '12px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                color: '#4ade80',
                                width: 'fit-content',
                            }}
                        >
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    color: 'var(--md-sys-color-on-surface-variant)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                }}
                            >
                                Storage Used
                            </div>
                            <div
                                style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', margin: '4px 0' }}
                            >
                                {((data?.stats?.totalSize || 0) / 1024 ** 4).toFixed(1)}
                                <span style={{ fontSize: '18px', opacity: 0.5, marginLeft: '4px' }}>TB</span>
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.5 }}>Physical Footprint</div>
                        </div>
                    </div>
                </div>

                <section>
                    <h2
                        style={{
                            fontSize: '24px',
                            fontWeight: 900,
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <Activity size={20} color="#ffc107" />
                        Active Transfers
                    </h2>
                    {data?.queue?.length === 0 ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '60px',
                                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                                borderRadius: '32px',
                                border: '1.5px dashed var(--md-sys-color-outline-variant)',
                                opacity: 0.4,
                            }}
                        >
                            <RefreshCw size={48} style={{ marginBottom: '16px' }} />
                            <div>All transfers completed. Library is synchronized.</div>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                                gap: '20px',
                            }}
                        >
                            {data?.queue?.map((item: RadarrQueueItem, i: number) => (
                                <div
                                    key={i}
                                    className="md3-card-elevated"
                                    style={{
                                        padding: '24px',
                                        borderRadius: '32px',
                                        background: 'var(--md-sys-color-surface-container-low)',
                                        border: '1px solid var(--md-sys-color-outline-variant)',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '16px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 900,
                                                maxWidth: '70%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {item.title}
                                        </div>
                                        <div style={{ color: '#ffc107', fontWeight: 900, fontSize: '14px' }}>
                                            {Math.round(item.progress)}%
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: 'var(--md-sys-color-surface-variant)',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${item.progress}%`,
                                                height: '100%',
                                                backgroundColor: '#ffc107',
                                                transition: 'width 0.5s ease',
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '12px',
                                            opacity: 0.6,
                                            fontWeight: 600,
                                        }}
                                    >
                                        <span>{item.status}</span>
                                        <span>{item.timeleft || 'Finalizing...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            {toast && <MD3Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

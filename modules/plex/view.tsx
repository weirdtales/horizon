"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
    PlaySquare, Database, Loader2, Monitor, 
    Activity, RefreshCw, Film, Video, Music, 
    Layers, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { BackButton } from '@/app/components/BackButton';
import { MD3Toast, ToastType } from '@/app/components/MD3Toast';
import { useMobile } from '@/app/hooks/useMobile';
import { sanitizeUrl, sanitizeText } from '@/lib/url';

interface PlexSession {
    sessionKey: string;
    title: string;
    parentTitle?: string;
    user: string;
    player: string;
    state: string;
    type: string;
    thumb: string | null;
    art: string | null;
}

interface PlexLibrary {
    key: string;
    type: string;
    title: string;
    count: number;
}

interface PlexData {
    sessions: PlexSession[];
    libraries: PlexLibrary[];
}

interface StatCardProps {
    title: string;
    value: string | number;
    sub: string;
    icon: React.ElementType;
    color: string;
    delay?: number;
}

export default function PlexView() {
    const [data, setData] = useState<PlexData | null>(null);
    const isMobile = useMobile(1024);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    const fetchData = async () => {
        try {
            const apiRes = await fetch('/api/plex');
            if (!apiRes.ok) {
                const errorText = await apiRes.text();
                throw new Error(errorText || `Status: ${apiRes.status}`);
            }
            const apiData = await apiRes.json();

            if (apiData.error) {
                setError(apiData.details || apiData.error);
                setToast({ message: apiData.details || apiData.error, type: 'error' });
            } else {
                setData(apiData);
                setError(null);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to reach Plex Media Server';
            setError(message);
            setToast({ message: 'Communication severed with Plex Hub.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ title, value, sub, icon: Icon, color, delay = 0 }: StatCardProps) => (
        <div 
            className="md3-card-elevated" 
            style={{ 
                padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', 
                border: '1px solid var(--md-sys-color-outline-variant)', background: 'var(--glass-bg)', 
                backdropFilter: 'blur(16px)', borderRadius: '28px',
                animation: `slideUpScale 0.6s cubic-bezier(0.2, 0, 0, 1) ${delay}s both`
            }}
        >
            <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: `${color}15`, color: color, width: 'fit-content', border: `1px solid ${color}30` }}>
                <Icon size={24} />
            </div>
            <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{title}</div>
                <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', margin: '6px 0', color: 'var(--md-sys-color-on-surface)' }}>{value}</div>
                <div style={{ fontSize: '13px', opacity: 0.5, fontWeight: 500 }}>{sub}</div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--md-sys-color-surface)' }}>
                <Loader2 className="animate-spin" size={48} color="#eab308" />
                <div style={{ marginTop: '20px', fontSize: '14px', fontWeight: 900, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Initializing Plex Link...</div>
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.5s ease' }}>
                {error && (
                    <div style={{ 
                        padding: '16px 24px', 
                        backgroundColor: 'var(--md-sys-color-error-container)', 
                        color: 'var(--md-sys-color-on-error-container)', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        border: '1px solid var(--md-sys-color-error)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <RefreshCw size={20} className="animate-spin" style={{ opacity: 0.5 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communication severed</div>
                            <div style={{ fontSize: '13px', opacity: 0.8 }}>{error}</div>
                        </div>
                        <button 
                            onClick={() => fetchData()}
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        >
                            Reconnect
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <StatCard title="Active Streams" value={data?.sessions?.length || 0} sub="Real-time playback" icon={Activity} color="#4ade80" delay={0.1} />
                    <StatCard title="Library Capacity" value={data?.libraries?.reduce((acc: number, l: PlexLibrary) => acc + (Number(l.count) || 0), 0) || 0} sub="Managed items" icon={Database} color="#eab308" delay={0.2} />
                    <StatCard title="Storage Nodes" value={data?.libraries?.length || 0} sub="Active directories" icon={Layers} color="#60a5fa" delay={0.3} />
                    <StatCard title="Server Status" value={error ? "OFFLINE" : "ONLINE"} sub={error ? "Link severed" : "Low-latency link"} icon={ShieldCheck} color={error ? "var(--md-sys-color-error)" : "#4ade80"} delay={0.4} />
                </div>

                <section>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Monitor size={20} color="#eab308" />
                        Now Playing Hub
                    </h2>
                    {!data?.sessions || data.sessions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--md-sys-color-surface-container-high)', borderRadius: '32px', border: '1.5px dashed var(--md-sys-color-outline-variant)', opacity: 0.4 }}>
                            <PlaySquare size={48} style={{ marginBottom: '16px' }} />
                            <span style={{ fontWeight: 600, color: 'var(--md-sys-color-primary)' }}>Plex Hub</span>
                            <div style={{ fontSize: '13px' }}>Currently no active Plex sessions detected.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                            {data.sessions.map((session: PlexSession, i: number) => (
                                <div key={session.sessionKey || `session-${i}`} className="md3-card-elevated" style={{ 
                                    position: 'relative', overflow: 'hidden', padding: '24px', borderRadius: '32px', border: '1px solid var(--md-sys-color-outline-variant)',
                                    background: 'var(--md-sys-color-surface-container-low)',
                                    animation: `slideUpScale 0.6s cubic-bezier(0.2, 0, 0, 1) ${i * 0.1}s both`
                                }}>
                                    {session.art && (
                                        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                                            <Image 
                                                src={sanitizeUrl(session.art)} 
                                                alt="" 
                                                fill
                                                style={{ objectFit: 'cover', filter: 'blur(10px)' }}
                                                unoptimized
                                            />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--md-sys-color-surface-container-low), transparent, var(--md-sys-color-surface-container-low))' }} />
                                        </div>
                                    )}
                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '80px', height: '120px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--md-sys-elevation-2)', position: 'relative' }}>
                                            <Image 
                                                src={sanitizeUrl(session.thumb || '')} 
                                                alt="" 
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                unoptimized
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: 900, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{session.user} is watching</div>
                                            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', letterSpacing: '-0.02em' }}>{session.title}</div>
                                            <div style={{ fontSize: '13px', opacity: 0.6, fontWeight: 700, marginTop: '4px' }}>{session.player}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            {toast && <MD3Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

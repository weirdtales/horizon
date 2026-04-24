"use client";

import React from 'react';
import Link from 'next/link';
import { Video, Loader2, Database, ChevronRight, Activity } from 'lucide-react';
import { useService } from '@/app/hooks/useService';

export default function SonarrWidget() {
    const { data, loading, error } = useService('sonarr');

    if (loading) return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.5 }}>
            <Loader2 className="animate-spin" size={32} color="#3c9bdc" />
            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scanning Series...</div>
        </div>
    );

    if (error || !data) return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <Video size={48} strokeWidth={1} />
            <div style={{ fontSize: '10px', fontWeight: 900, marginTop: '12px' }}>OFFLINE</div>
        </div>
    );

    const hasQueue = data.queue && data.queue.length > 0;

    return (
        <Link href="/sonarr" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px', textDecoration: 'none', color: 'inherit', position: 'relative', overflow: 'hidden' }} className="m3-press-effect">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(60, 155, 220, 0.08), transparent)', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: 'color-mix(in srgb, #3c9bdc 15%, transparent)', color: '#3c9bdc', padding: '10px', borderRadius: '14px', border: '1px solid color-mix(in srgb, #3c9bdc 30%, transparent)' }}>
                        <Video size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', color: 'var(--md-sys-color-on-surface)' }}>Sonarr</h3>
                        <div style={{ fontSize: '10px', color: '#3c9bdc', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                            {hasQueue ? 'Processing Series' : 'Library Stable'}
                        </div>
                    </div>
                </div>
                <div style={{ color: '#3c9bdc', opacity: 0.8 }}>
                    <Activity size={18} />
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                {hasQueue ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.queue.slice(0, 2).map((item: { id: string | number; title: string; progress: number | string }) => {
                            const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
                            return (
                                <div key={item.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{item.title}</span>
                                        <span style={{ fontSize: '11px', fontWeight: 900, opacity: 0.6 }}>{Math.round(progress)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'var(--md-sys-color-surface-container-highest)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: '#3c9bdc', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: 'var(--md-sys-color-surface-container-high)', padding: '16px', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--md-sys-color-on-surface)' }}>{data.stats?.total ?? 0}</div>
                            <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-variant)' }}>Series</div>
                        </div>
                        <div style={{ background: 'var(--md-sys-color-surface-container-high)', padding: '16px', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.05em', color: (data.stats?.missing ?? 0) > 0 ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface)' }}>{data.stats?.missing ?? 0}</div>
                            <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-variant)' }}>Missing</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800 }}>
                    <Database size={14} />
                    <span>{((data.stats?.totalSize ?? 0) / (1000 ** 4)).toFixed(1)} TB Indexed</span>
                </div>
                <ChevronRight size={16} />
            </div>
        </Link>
    );
}

"use client";

import React from 'react';
import { PlaySquare, Loader2, Film, Video, Activity } from 'lucide-react';
import { useService } from '@/app/hooks/useService';
import { sanitizeUrl, sanitizeText } from '@/lib/url';

export default function PlexWidget() {
    const { data, loading, error } = useService('plex');
    
    if (loading) return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.5 }}>
            <Loader2 className="animate-spin" size={32} />
            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Syncing Media...</div>
        </div>
    );
    
    if (error || !data) return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <PlaySquare size={48} strokeWidth={1} />
            <div style={{ fontSize: '10px', fontWeight: 900, marginTop: '12px' }}>SERVICE OFFLINE</div>
        </div>
    );

    const activeSession = data.sessions?.[0];
    const isOnline = data.status === 'online';

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Premium Ambient Aura */}
            <div style={{ 
                position: 'absolute', 
                inset: -20, 
                zIndex: 0, 
                opacity: (activeSession?.art && sanitizeUrl(activeSession.art)) ? 0.4 : 0.15,
                transition: 'opacity 1s ease',
                background: (activeSession?.art && sanitizeUrl(activeSession.art))
                    ? `url(${sanitizeUrl(activeSession.art)}) center/cover no-repeat` 
                    : `radial-gradient(circle at 20% 20%, var(--md-sys-color-primary) 0%, transparent 60%), radial-gradient(circle at 80% 80%, #eab308 0%, transparent 60%)`,
                filter: 'blur(40px) saturate(2)'
            }} />
            
            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                
                {/* Header (Integrated) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '10px', borderRadius: '14px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                                <PlaySquare size={20} />
                            </div>
                            <div style={{ 
                                position: 'absolute', bottom: -2, right: -2, width: '10px', height: '10px', 
                                backgroundColor: isOnline ? '#4ade80' : '#ef4444', 
                                borderRadius: '50%', border: '2px solid var(--md-sys-color-surface)',
                                boxShadow: isOnline ? '0 0 10px rgba(74, 222, 128, 0.5)' : 'none',
                                animation: isOnline ? 'protectionPulse 4s infinite' : 'none'
                            }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', color: 'var(--md-sys-color-on-surface)' }}>Plex</h3>
                                <div style={{ fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '6px', background: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-primary)', border: '1px solid var(--md-sys-color-outline-variant)' }}>{sanitizeText(data.server?.name || '', 'Media Center')}</div>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px', opacity: 0.6 }}>v{sanitizeText(data.server?.version?.split('-')[0] || '', 'Unknown')}</div>
                        </div>
                    </div>
                </div>

                {/* Primary Section (Now Playing or Stats) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '4px' }}>
                  {activeSession ? (
                        <div style={{ width: '100%', background: 'var(--md-sys-color-surface-container-highest)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '14px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', gap: '16px', alignItems: 'center', animation: 'fadeIn 0.6s var(--md-sys-motion-easing-emphasized)', transition: 'background-color 0.3s ease' }}>
                              <div style={{ width: '60px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                                <img src={sanitizeUrl(activeSession.thumb, '')} alt={activeSession.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '9px', fontWeight: 900, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>LIVE STREAMING</div>
                                <div style={{ fontSize: '18px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em', color: 'var(--md-sys-color-on-surface)' }}>{activeSession.title}</div>
                                <div style={{ fontSize: '12px', opacity: 0.6, fontWeight: 700, marginTop: '2px', color: 'var(--md-sys-color-on-surface-variant)' }}>{activeSession.player} • {activeSession.user}</div>
                                <div style={{ marginTop: '8px', width: '100%', height: '4px', backgroundColor: 'var(--md-sys-color-surface-variant)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ 
                                         width: `${Math.max(0, Math.min(100, (activeSession.duration > 0 ? (activeSession.viewOffset / activeSession.duration) * 100 : 0)))}%`, 
                                         height: '100%', 
                                         backgroundColor: '#eab308' 
                                     }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: '100%', padding: '20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px' }}>System Insight</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                                    <span style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.05em' }}>{data.sessions?.length || 0}</span>
                                    <span style={{ fontSize: '16px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' }}>Active Streams</span>
                                </div>
                            </div>
                            <div style={{ opacity: 0.08 }}>
                                <PlaySquare size={80} strokeWidth={1} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Library Grid (Premium Pills) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '4px' }}>
                    {(data.libraries || []).map((lib: { id: string; count: number; title: string }, idx: number) => {
                        const colors = [
                            { main: '#ffc107', bg: 'rgba(255, 193, 7, 0.08)', icon: Film },
                            { main: '#3c9bdc', bg: 'rgba(60, 155, 220, 0.08)', icon: Video },
                            { main: '#a8c7fa', bg: 'rgba(168, 199, 250, 0.08)', icon: Activity }
                        ];
                        const style = colors[idx] || colors[0];
                        return (
                            <div key={lib.id} style={{ 
                                display: 'flex', flexDirection: 'column', gap: '4px',
                                backgroundColor: 'var(--md-sys-color-surface-container-low)', 
                                padding: '14px 8px', borderRadius: '22px', 
                                border: '1px solid var(--md-sys-color-outline-variant)',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                            }} className="m3-press-effect">
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                    <style.icon size={14} color={style.main} opacity={0.6} />
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em' }}>{(Number(lib.count) || 0).toLocaleString()}</div>
                                <div style={{ fontSize: '8px', fontWeight: 900, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lib.title}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

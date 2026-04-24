"use client";

import { useEffect, useState } from 'react';
import { Box, Globe, Loader2, ShieldAlert, LayoutDashboard, ExternalLink, Activity, Layers } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useMobile } from '../hooks/useMobile';
import { sanitizeUrl } from '../../lib/url';

export default function DockgePage() {
    const isMobile = useMobile(1024);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'dashboard' | 'interface'>('interface');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setSettings(data.settings);
                
                // For Dockge, we usually want the interface if URL is present
                if (data.settings?.dockge?.url) {
                    setViewMode('interface');
                } else {
                    setViewMode('dashboard');
                }
            } catch (err) {
                console.error('Dockge Page Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px', backgroundColor: 'var(--md-sys-color-surface)' }}>
                <Loader2 size={48} className="animate-spin" color="var(--md-sys-color-primary)" />
                <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>Connecting to Dockge...</div>
            </div>
        );
    }

    const hostUrl = sanitizeUrl(settings?.dockge?.url, '');

    if (viewMode === 'interface' && hostUrl) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--md-sys-color-surface)' }}>
                <div style={{ 
                    padding: isMobile ? '8px 16px' : '8px 24px', 
                    height: isMobile ? 'auto' : '64px',
                    backgroundColor: 'var(--md-sys-color-surface-container)', 
                    borderBottom: '1px solid var(--md-sys-color-outline-variant)', 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row', 
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    justifyContent: 'space-between', 
                    gap: isMobile ? '16px' : '0',
                    boxShadow: 'var(--md-sys-elevation-1)',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                        <BackButton />
                        {!isMobile && <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)', opacity: 0.5 }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ backgroundColor: 'rgba(185, 244, 66, 0.15)', padding: '8px', borderRadius: '10px' }}>
                                <Box size={18} color="#b9f442" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>Dockge Manager</span>
                                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.5 }}>Docker Compose Management</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '4px' : '0' }}>
                        <button onClick={() => setViewMode('dashboard')} className="md3-button-text" style={{ padding: '8px 16px', gap: '8px', borderRadius: '12px', flex: isMobile ? 1 : 'none', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                            <LayoutDashboard size={18} />
                            Status Overview
                        </button>
                        {/* snyk-ignore: javascript/DOMXSS, javascript/OpenRedirect */}
                        <a href={sanitizeUrl(hostUrl)} target="_blank" rel="noopener noreferrer" className="md3-button-filled" style={{ padding: '8px 16px', gap: '8px', borderRadius: '12px', fontSize: '13px', backgroundColor: '#b9f442', color: '#000', flex: isMobile ? 1 : 'none', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                            <ExternalLink size={16} />
                            Open Full
                        </a>
                    </div>
                </div>
                {/* snyk-ignore: javascript/DOMXSS */}
                <iframe src={sanitizeUrl(hostUrl)} style={{ flex: 1, border: 'none', backgroundColor: '#fff' }} title="Dockge Interface" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            </div>
        );
    }

    return (
        <main className="page-container" style={{ paddingBottom: isMobile ? '120px' : '40px' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                justifyContent: 'space-between', 
                marginBottom: isMobile ? '32px' : '24px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '24px' : '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '20px' }}>
                    <BackButton />
                    <div style={{
                        backgroundColor: 'rgba(185, 244, 66, 0.15)',
                        color: '#b9f442',
                        padding: isMobile ? '12px' : '16px',
                        borderRadius: 'var(--md-sys-shape-corner-extra-large)'
                    }}>
                        <Box size={isMobile ? 32 : 48} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="md3-display-large" style={{ margin: 0, fontSize: isMobile ? '24px' : undefined }}>Dockge Stacks</h1>
                        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: isMobile ? '13px' : '16px', margin: 0 }}>
                            Self-hosted Docker Compose stack manager.
                        </p>
                    </div>
                </div>

                {hostUrl && (
                    <button onClick={() => setViewMode('interface')} className="md3-button-tonal" style={{ gap: '8px', padding: '12px 24px', borderRadius: '20px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                        <Globe size={18} />
                        Open Original Interface
                    </button>
                )}
            </div>

            {!hostUrl && (
                <div className="md3-card-filled" style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-on-surface)', marginBottom: '32px', display: 'flex', gap: '24px', alignItems: 'center', padding: '32px' }}>
                    <ShieldAlert size={48} opacity={0.5} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: '4px' }}>Dockge URL Not Configured</div>
                        <div style={{ fontSize: '16px', opacity: 0.7 }}>Please provide your Dockge instance URL in Global Settings to enable the integrated view.</div>
                    </div>
                </div>
            )}

            <div className="bento-grid" style={{ gridAutoRows: "auto" }}>
                <div className="md3-card-elevated col-span-12 md-col-span-12" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Layers size={28} color="#b9f442" />
                            <h2 style={{ fontSize: '24px', margin: 0 }}>Active Monitoring</h2>
                        </div>
                        <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}>Backend via WebSocket</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', padding: isMobile ? '40px 0' : '60px 0', opacity: 0.8 }}>
                        <Activity size={isMobile ? 48 : 64} color="var(--md-sys-color-primary)" className="animate-pulse" />
                        <div style={{ textAlign: 'center', padding: isMobile ? '0 16px' : '0' }}>
                            <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 500, margin: '0 0 8px 0' }}>Data integration for Dockge is handled via the full interface.</p>
                            <p style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>Dockge uses real-time WebSockets which are best experienced through the native UI.</p>
                        </div>
                        {hostUrl && (
                            <button onClick={() => setViewMode('interface')} className="md3-button-filled" style={{ padding: '12px 32px', borderRadius: '24px', backgroundColor: '#b9f442', color: '#000', width: isMobile ? '100%' : 'auto' }}>
                                Launch Interface
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { Cpu, ExternalLink, Loader2, ShieldAlert } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useMobile } from '../hooks/useMobile';
import { sanitizeUrl } from '../../lib/url';

export default function GlancesPage() {
    const isMobile = useMobile(1024);
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const getHostname = (urlString: string | null) => {
        if (!urlString) return '...';
        try {
            return new URL(urlString).hostname;
        } catch {
            return '...';
        }
    };

    useEffect(() => {
        const fetchUrl = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.settings?.glances?.url) {
                    setUrl(sanitizeUrl(data.settings.glances.url));
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch Glances URL:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchUrl();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    gap: '20px',
                    backgroundColor: 'var(--md-sys-color-surface)',
                }}
            >
                <Loader2 size={48} className="animate-spin" color="var(--md-sys-color-primary)" />
                <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>
                    Connecting to Glances...
                </div>
            </div>
        );
    }

    if (error || !url) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    gap: '24px',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    padding: '40px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        backgroundColor: 'var(--md-sys-color-error-container)',
                        color: 'var(--md-sys-color-on-error-container)',
                        padding: '24px',
                        borderRadius: '32px',
                    }}
                >
                    <ShieldAlert size={64} />
                </div>
                <div>
                    <h1 className="md3-headline-large" style={{ marginBottom: '8px' }}>
                        View Not Configured
                    </h1>
                    <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '18px', maxWidth: '400px' }}>
                        Please provide your Glances URL in{' '}
                        <strong>Global Settings &gt; Monitoring &amp; Management</strong>.
                    </p>
                </div>
                <button
                    onClick={() => (window.location.href = '/settings')}
                    className="md3-button-filled"
                    style={{ padding: '12px 24px', borderRadius: '20px' }}
                >
                    Go to Settings
                </button>
            </div>
        );
    }

    return (
        <main
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: 'var(--md-sys-color-surface)',
            }}
        >
            {/* MD3 Premium Header */}
            <div
                style={{
                    padding: isMobile ? '8px 16px' : '8px 24px',
                    height: isMobile ? 'auto' : '64px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '16px' : '0',
                    zIndex: 10,
                    boxShadow: 'var(--md-sys-elevation-1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                    <BackButton />
                    {!isMobile && (
                        <div
                            style={{
                                height: '24px',
                                width: '1px',
                                backgroundColor: 'var(--md-sys-color-outline-variant)',
                                opacity: 0.5,
                            }}
                        />
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                            style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                padding: '8px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Cpu size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <h1
                                style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    margin: 0,
                                    color: 'var(--md-sys-color-on-surface)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                Glances Monitoring
                            </h1>
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    color: 'var(--md-sys-color-on-surface-variant)',
                                    opacity: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                <div
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: '#4ade80',
                                    }}
                                ></div>
                                <span>Connected to {getHostname(url)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                    {/* snyk-ignore: javascript/DOMXSS, javascript/OR */}
                    <a
                        href={url.startsWith('http') ? url : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md3-button-text"
                        style={{
                            padding: '10px 16px',
                            fontSize: '14px',
                            gap: '8px',
                            borderRadius: '12px',
                            flex: isMobile ? 1 : 'none',
                            justifyContent: 'center',
                            background: 'var(--md-sys-color-surface-container-high)',
                        }}
                    >
                        <ExternalLink size={18} />
                        Open Original
                    </a>
                </div>
            </div>

            {/* Frame Container */}
            <div style={{ flex: 1, position: 'relative', backgroundColor: '#fff' }}>
                {/* snyk-ignore: javascript/DOMXSS */}
                <iframe
                    src={url.startsWith('http') ? url : 'about:blank'}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        visibility: 'visible',
                    }}
                    title="Glances System Monitoring"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </main>
    );
}

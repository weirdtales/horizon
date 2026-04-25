'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useRef } from 'react';
import { ExternalLink, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { MODULE_MANIFESTS } from '@/lib/registry';
import { DashboardIcon } from '../components/DashboardIcon';

function ViewContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isValidUrl = (url: string) => {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    };

    const startLoadingTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsLoading(false);
        }, 10000); // 10s fallback
    };

    const clearLoadingTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    if (!url) {
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
                }}
            >
                <div
                    style={{
                        backgroundColor: 'var(--md-sys-color-error-container)',
                        color: 'var(--md-sys-color-error)',
                        padding: '24px',
                        borderRadius: '32px',
                    }}
                >
                    <ShieldAlert size={48} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0' }}>Access Denied</h2>
                    <p style={{ opacity: 0.6, fontSize: '14px' }}>
                        No valid destination URL was provided to the view engine.
                    </p>
                </div>
                <BackButton />
            </div>
        );
    }

    // Try to find a friendly name from the registry or URL
    const findManifest = () => {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            const pathSegments = urlObj.pathname.toLowerCase().split('/').filter(Boolean);

            // Check for exact hostname match or path segment match
            const match = MODULE_MANIFESTS.find(m => {
                const id = m.id.toLowerCase();
                return hostname === id || hostname.startsWith(`${id}.`) || pathSegments.includes(id);
            });

            if (match) return match;
        } catch {
            // Silently fail for invalid URLs or non-matches
        }
        return null;
    };

    const manifest = findManifest();
    const displayTitle = manifest ? `${manifest.name} Interface` : 'External Service';

    const handleRefresh = () => {
        if (iframeRef.current) {
            setIsLoading(true);
            startLoadingTimeout();
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    if (!url || !isValidUrl(url)) {
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
                }}
            >
                <div
                    style={{
                        backgroundColor: 'var(--md-sys-color-error-container)',
                        color: 'var(--md-sys-color-error)',
                        padding: '24px',
                        borderRadius: '32px',
                    }}
                >
                    <ShieldAlert size={48} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0' }}>Security Block</h2>
                    <p style={{ opacity: 0.6, fontSize: '14px' }}>
                        The provided URL is invalid or uses an unauthorized protocol.
                    </p>
                </div>
                <BackButton />
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: 'var(--md-sys-color-surface)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    padding: '8px 24px',
                    height: '64px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    zIndex: 10,
                    boxShadow: 'var(--md-sys-elevation-1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0, flex: 1 }}>
                    <BackButton />

                    <div
                        style={{
                            height: '24px',
                            width: '1px',
                            backgroundColor: 'var(--md-sys-color-outline-variant)',
                            opacity: 0.5,
                        }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                            style={{
                                backgroundColor: manifest
                                    ? `color-mix(in srgb, ${manifest.color} 15%, transparent)`
                                    : 'var(--md-sys-color-surface-container-high)',
                                padding: '8px',
                                borderRadius: '10px',
                                color: manifest?.color || 'var(--md-sys-color-primary)',
                            }}
                        >
                            <DashboardIcon icon={manifest?.icon || 'Globe'} size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span
                                style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--md-sys-color-on-surface)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {displayTitle}
                            </span>
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    color: 'var(--md-sys-color-on-surface-variant)',
                                    opacity: 0.5,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '300px',
                                }}
                            >
                                {url}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={handleRefresh}
                        className="m3-press-effect"
                        style={{
                            background: 'var(--md-sys-color-surface-container-high)',
                            border: 'none',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                        }}
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m3-press-effect"
                        style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            gap: '8px',
                            backgroundColor: 'var(--md-sys-color-primary)',
                            color: 'var(--md-sys-color-on-primary)',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 700,
                        }}
                    >
                        <ExternalLink size={16} />
                        Launch
                    </a>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', backgroundColor: '#fff' }}>
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 5,
                            backgroundColor: 'var(--md-sys-color-surface)',
                            gap: '16px',
                        }}
                    >
                        <Loader2 size={40} className="animate-spin" color="var(--md-sys-color-primary)" />
                        <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>
                            ESTABLISHING SECURE LINK...
                        </div>
                    </div>
                )}
                <iframe
                    ref={iframeRef}
                    src={url}
                    onLoad={() => {
                        setIsLoading(false);
                        clearLoadingTimeout();
                    }}
                    onError={() => {
                        setIsLoading(false);
                        clearLoadingTimeout();
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        visibility: isLoading ? 'hidden' : 'visible',
                    }}
                    title={displayTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

export default function ViewPage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        backgroundColor: 'var(--md-sys-color-surface)',
                    }}
                >
                    <Loader2 size={48} className="animate-spin" color="var(--md-sys-color-primary)" />
                </div>
            }
        >
            <ViewContent />
        </Suspense>
    );
}

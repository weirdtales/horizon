'use client';

import React from 'react';
import { Globe, Fingerprint, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { useService } from '@/app/hooks/useService';

export default function LoopiaWidget() {
    const { data, loading, error, refetch } = useService<{
        totals: {
            count: number;
            active_zones: number;
            cluster_health: string;
        };
    }>('loopia/domains', 300000);
    const [isRefetching, setIsRefetching] = React.useState(false);

    const handleRefetch = async () => {
        setIsRefetching(true);
        try {
            await refetch();
        } finally {
            setIsRefetching(false);
        }
    };

    if (loading) {
        return (
            <div
                className="loopia-theme"
                style={{
                    height: '100%',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px',
                }}
            >
                <Loader2 className="animate-spin" color="#3b82f6" size={32} />
                <div style={{ fontSize: '13px', opacity: 0.5 }}>Syncing Domain Estates...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div
                className="loopia-theme"
                style={{
                    height: '100%',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: 0.6,
                }}
            >
                <Globe size={32} color="var(--md-sys-color-error)" />
                <div style={{ fontSize: '13px', textAlign: 'center' }}>Cluster Connection Error</div>
            </div>
        );
    }

    const health = data.totals?.cluster_health;
    const healthLabel =
        health === 'stable'
            ? 'Infrastructure Stable'
            : health === 'degraded'
              ? 'Infrastructure Degraded'
              : health === 'down'
                ? 'Infrastructure Down'
                : 'Infrastructure Unknown';
    const healthColor =
        health === 'stable'
            ? 'var(--md-color-service-status-ok)'
            : health === 'degraded'
              ? 'var(--md-sys-color-warning)'
              : 'var(--md-sys-color-error)';

    return (
        <div
            className="loopia-theme"
            style={{
                height: '100%',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes protectionPulse {
                    0% { box-shadow: 0 0 0 0 color-mix(in srgb, ${healthColor} 40%, transparent); }
                    70% { box-shadow: 0 0 0 6px color-mix(in srgb, ${healthColor} 0%, transparent); }
                    100% { box-shadow: 0 0 0 0 color-mix(in srgb, ${healthColor} 0%, transparent); }
                }
            `,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '30%',
                    background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.05), transparent)',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <div
                            style={{
                                backgroundColor: 'color-mix(in srgb, #3b82f6 15%, transparent)',
                                color: '#3b82f6',
                                padding: '10px',
                                borderRadius: '14px',
                                border: '1px solid color-mix(in srgb, #3b82f6 30%, transparent)',
                            }}
                        >
                            <Fingerprint size={20} />
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                width: '10px',
                                height: '10px',
                                backgroundColor: healthColor,
                                borderRadius: '50%',
                                border: '2px solid var(--md-sys-color-surface)',
                                animation: 'protectionPulse 4s infinite',
                            }}
                        />
                    </div>
                    <div>
                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: 900,
                                margin: 0,
                                letterSpacing: '-0.02em',
                                color: 'var(--md-sys-color-on-surface)',
                            }}
                        >
                            Loopia
                        </h3>
                        <div
                            style={{
                                fontSize: '10px',
                                color: '#3b82f6',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Cluster v4 Active
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleRefetch}
                    className="m3-press-effect"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        cursor: 'pointer',
                    }}
                    disabled={isRefetching}
                    aria-label={isRefetching ? 'Refreshing Domains' : 'Refresh Domains'}
                    title="Refresh"
                >
                    <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
                </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: 'var(--md-sys-color-surface-container-high)',
                        padding: '16px',
                        borderRadius: '24px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.05em' }}>
                        {data.totals?.count || 0}
                    </div>
                    <div
                        style={{
                            fontSize: '9px',
                            fontWeight: 900,
                            color: 'var(--md-sys-color-on-surface-variant)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        Estates
                    </div>
                </div>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: 'var(--md-sys-color-surface-container-high)',
                        padding: '16px',
                        borderRadius: '24px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.05em', color: '#4ade80' }}>
                        {data.totals?.active_zones || 0}
                    </div>
                    <div
                        style={{
                            fontSize: '9px',
                            fontWeight: 900,
                            color: 'var(--md-sys-color-on-surface-variant)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        Zones
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderRadius: '16px',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--md-sys-color-on-surface)',
                    }}
                >
                    <ShieldCheck size={14} color={healthColor} />
                    <span>{healthLabel}</span>
                </div>
            </div>
        </div>
    );
}

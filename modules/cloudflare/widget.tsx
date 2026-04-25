'use client';

import React from 'react';
import { Cloud, Loader2 } from 'lucide-react';
import { useService } from '@/app/hooks/useService';

export default function CloudflareWidget() {
    const { data, loading, error } = useService<{
        totals: {
            threats: number;
            bandwidth: number;
            cacheRatio: number;
        };
        domains: unknown[];
    }>('cloudflare', 60000);

    const formatBytes = (bytes: number) => {
        if (!bytes || !isFinite(bytes)) return '0 B';
        const sign = bytes < 0 ? '-' : '';
        const bytesAbs = Math.abs(bytes);
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.max(0, Math.min(Math.floor(Math.log(bytesAbs) / Math.log(k)), sizes.length - 1));
        return sign + parseFloat((bytesAbs / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div
                className="cloudflare-theme"
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
                <Loader2 className="animate-spin" color="#f38020" size={32} />
                <div style={{ fontSize: '13px', opacity: 0.5 }}>Synchronizing Edge...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div
                className="cloudflare-theme"
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
                <Cloud size={32} color="var(--md-sys-color-error)" />
                <div style={{ fontSize: '13px', textAlign: 'center' }}>Edge Connection Error</div>
            </div>
        );
    }

    return (
        <div
            className="cloudflare-theme"
            style={{
                height: '100%',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            backgroundColor: 'rgba(243, 128, 32, 0.1)',
                            color: '#f38020',
                            padding: '10px',
                            borderRadius: '14px',
                            border: '1px solid rgba(243, 128, 32, 0.2)',
                        }}
                    >
                        <Cloud size={20} />
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
                            Cloudflare
                        </h3>
                        <div
                            style={{
                                fontSize: '10px',
                                color: '#f38020',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Edge Active
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div
                        style={{
                            fontSize: '10px',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                        }}
                    >
                        Network
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--md-color-service-status-ok)', fontWeight: 800 }}>
                        Online
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                <div
                    style={{
                        backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                        padding: '16px 20px',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: '10px',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '2px',
                        }}
                    >
                        Blocked Requests / 24H
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900 }}>
                            {(data.totals?.threats || 0).toLocaleString()}
                        </span>
                        <span
                            style={{
                                fontSize: '12px',
                                color:
                                    (data.totals?.threats || 0) > 0
                                        ? 'var(--md-color-service-status-error)'
                                        : 'var(--md-color-service-status-ok)',
                                fontWeight: 800,
                            }}
                        >
                            {(data.totals?.threats || 0) > 0 ? 'Detected' : 'Clean'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                        {
                            label: 'Cache',
                            value: `${data.totals?.cacheRatio || 0}%`,
                            color: 'var(--md-sys-color-primary)',
                        },
                        { label: 'Domains', value: data.domains?.length || 0, color: 'var(--md-sys-color-secondary)' },
                        {
                            label: 'Bandwidth',
                            value: formatBytes(data.totals?.bandwidth || 0),
                            color: 'var(--md-color-service-status-ok)',
                        },
                    ].map(stat => (
                        <div
                            key={stat.label}
                            style={{
                                textAlign: 'center',
                                backgroundColor: 'var(--md-sys-color-surface-container)',
                                padding: '10px 4px',
                                borderRadius: '16px',
                                border: '1px solid var(--md-sys-color-outline-variant)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '8px',
                                    fontWeight: 900,
                                    color: 'var(--md-sys-color-on-surface-variant)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {stat.label}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

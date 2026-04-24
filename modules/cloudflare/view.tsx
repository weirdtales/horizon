"use client";

import React from 'react';
import { 
    Cloud, Shield, Lock, Globe, ArrowLeft, RefreshCw, BarChart3, 
    Activity, ShieldCheck, Zap, ExternalLink, Loader2, AlertCircle,
    ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/app/components/BackButton';
import { useService } from '@/app/hooks/useService';
import { useMobile } from '@/app/hooks/useMobile';

export default function CloudflareView() {
    const isMobile = useMobile(1024);
    const { data, loading, error, refetch } = useService('cloudflare', 60000);

    const formatBytes = (bytes: number) => {
        if (!bytes || !isFinite(bytes)) return '0 B';
        const sign = bytes < 0 ? '-' : '';
        const bytesAbs = Math.abs(bytes);
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = bytesAbs > 0 ? Math.max(0, Math.min(Math.floor(Math.log(bytesAbs) / Math.log(k)), sizes.length - 1)) : 0;
        return sign + parseFloat((bytesAbs / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatNumber = (num?: number | null) => {
        if (num == null || isNaN(num)) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-surface)', gap: '20px' }}>
                <Loader2 className="animate-spin" size={48} color="#f38020" />
                <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Syncing Global Edge...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-surface)', textAlign: 'center', padding: '40px' }}>
                <AlertCircle size={64} color="var(--md-sys-color-error)" />
                <h2 style={{ marginTop: '24px', fontSize: '24px', fontWeight: 900 }}>Connection Failed</h2>
                <p style={{ opacity: 0.6, maxWidth: '400px' }}>Unable to reach Cloudflare Edge servers. Please verify your API token in settings.</p>
                <button onClick={() => refetch()} style={{ marginTop: '24px', padding: '12px 32px', borderRadius: '24px', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', fontWeight: 700 }}>Retry Connection</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '0px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '16px' : '24px', marginBottom: isMobile ? '24px' : '40px' }}>
                {[
                    { label: 'Requests', value: formatNumber(data.totals?.requests || 0), icon: Zap, color: '#f38020' },
                    { label: 'Threats', value: formatNumber(data.totals?.threats || 0), icon: Shield, color: '#f87171' },
                    { label: 'Cache Ratio', value: `${data.totals?.cacheRatio || 0}%`, icon: Zap, color: '#4ade80' },
                    { label: 'Active Zones', value: data.domains?.length || 0, icon: Globe, color: 'var(--md-sys-color-primary)' }
                ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--md-sys-color-surface-container-low)', borderRadius: isMobile ? '24px' : '28px', padding: isMobile ? '16px' : '24px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                         <div style={{ background: `color-mix(in srgb, ${stat.color} 10%, transparent)`, color: stat.color, width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '12px' : '20px' }}>
                            <stat.icon size={isMobile ? 18 : 24} />
                        </div>
                        <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 900 }}>{stat.value}</div>
                        <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '24px' : '40px' }}>
                <div style={{ background: 'var(--md-sys-color-surface-container-low)', borderRadius: '32px', padding: isMobile ? '24px' : '32px', border: '1px solid var(--md-sys-color-outline-variant)', flex: 2 }}>
                    <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: '32px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0' }}>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Domain Infrastructure</h3>
                            <p style={{ fontSize: '13px', opacity: 0.5, margin: 0 }}>Active network zones and edge configuration</p>
                        </div>
                        <span style={{ padding: '6px 16px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', borderRadius: '24px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>
                            {data.domains?.length || 0} Zones Managed
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(data.domains || []).map((domain: any) => (
                            <div 
                                key={domain.id} 
                                style={{ 
                                    display: 'grid', gridTemplateColumns: isMobile ? '1fr 40px' : '2fr 1fr 1fr 1fr 40px', alignItems: 'center',
                                    padding: isMobile ? '12px 14px' : '16px 20px', background: 'var(--md-sys-color-surface-container)', 
                                    borderRadius: '20px', border: '1px solid var(--md-sys-color-outline-variant)',
                                    gap: isMobile ? '8px' : '0'
                                }} 
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: domain.status === 'active' ? '#4ade80' : '#f38020', boxShadow: domain.status === 'active' ? '0 0 10px #4ade80' : 'none', flexShrink: 0 }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 800, fontSize: isMobile ? '14px' : '15px' }}>{domain.name}</span>
                                        {isMobile && (
                                            <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>{domain.plan} Plan • {formatNumber(domain.metrics?.requests || 0)} reqs</span>
                                        )}
                                    </div>
                                </div>
                                
                                {!isMobile && (
                                    <>
                                        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.6 }}>
                                            {domain.plan} Plan
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase' }}>Traffic</span>
                                            <span style={{ fontSize: '13px', fontWeight: 700 }}>{formatNumber(domain.metrics?.requests || 0)} reqs</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase' }}>Bandwidth</span>
                                            <span style={{ fontSize: '13px', fontWeight: 700 }}>{formatBytes(domain.metrics?.bandwidth || 0)}</span>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.3 }}>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                    <div style={{ background: 'var(--md-sys-color-surface-container-high)', borderRadius: '32px', padding: '32px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <Zap size={20} color="#f38020" />
                            <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Performance Metrics</h4>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { 
                                    label: 'Cached Bandwidth', 
                                    value: (() => {
                                        const bw = Number(data.totals?.bandwidth || 0);
                                        const ratio = Number(data.totals?.cacheRatio ?? 0) / 100;
                                        const result = bw * ratio;
                                        return formatBytes(isNaN(result) ? 0 : result);
                                    })(),
                                    icon: CheckCircle2, color: '#4ade80' 
                                },
                                { label: 'Security Threats', value: formatNumber(data.totals?.threats || 0), icon: Shield, color: '#f87171' },
                                { label: 'Unique Visitors', value: formatNumber(data.totals?.uniques || 0), icon: Globe, color: 'var(--md-sys-color-primary)' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--md-sys-color-surface-container)', borderRadius: '16px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <item.icon size={18} color={item.color} />
                                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{item.label}</div>
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 900 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(243, 128, 32, 0.05)', borderRadius: '20px', border: '1px solid rgba(243, 128, 32, 0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <ShieldCheck size={18} color="#f38020" />
                                <span style={{ fontSize: '13px', fontWeight: 900 }}>Edge Firewall Active</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.6, lineHeight: 1.4 }}>Global WAF is monitoring all traffic for SQL injection, bot patterns, and cross-site scripting attacks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

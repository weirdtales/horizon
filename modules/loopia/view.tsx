"use client";

import React from 'react';
import { 
    Globe, Fingerprint, ShieldCheck, RefreshCw, Loader2, 
    Server, Activity, Shield, ArrowLeft, ChevronRight, Search, 
    ExternalLink, AlertCircle 
} from 'lucide-react';
import { BackButton } from '@/app/components/BackButton';
import { useService } from '@/app/hooks/useService';
import { useMobile } from '@/app/hooks/useMobile';

export default function LoopiaView() {
    const isMobile = useMobile(1024);
    const { data, loading, error, refetch } = useService('loopia/domains', 300000);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--md-sys-color-surface)' }}>
                <Loader2 className="animate-spin" size={48} color="#3b82f6" />
                <div style={{ marginTop: '20px', fontSize: '14px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Accessing Domain Cluster...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-surface)', textAlign: 'center', padding: '40px' }}>
                <AlertCircle size={64} color="var(--md-sys-color-error)" />
                <h2 style={{ marginTop: '24px', fontSize: '24px', fontWeight: 900 }}>Connection Lost</h2>
                <p style={{ opacity: 0.6, maxWidth: '400px' }}>Unable to reach Loopia API cluster. Please verify your credentials in settings.</p>
                <button onClick={() => refetch()} style={{ marginTop: '24px', padding: '12px 32px', borderRadius: '24px', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', fontWeight: 700 }}>Retry Connection</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '0px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="md3-card-elevated" style={{ padding: '24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: '32px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', marginBottom: '12px' }}>Total Domains</div>
                    <div style={{ fontSize: '36px', fontWeight: 900 }}>{data.totals?.count || 0}</div>
                </div>
                <div className="md3-card-elevated" style={{ padding: '24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: '32px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', marginBottom: '12px' }}>Active Zones</div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#4ade80' }}>{data.totals?.active_zones || 0}</div>
                </div>
                <div className="md3-card-elevated" style={{ padding: '24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: '32px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', marginBottom: '12px' }}>Cluster Health</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80' }}>
                        <ShieldCheck size={24} /> Stable
                    </div>
                </div>
            </div>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Registered Estates</h2>
                    <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.5 }}>{data.domains?.length || 0} records</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {data.domains?.map((domain: any, idx: number) => (
                        <div key={`${domain.name}-${idx}`} className="m3-press-effect" style={{ padding: '20px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '10px', borderRadius: '12px' }}>
                                    <Globe size={18} />
                                </div>
                                <div style={{ fontWeight: 800 }}>{domain.name}</div>
                            </div>
                            <ChevronRight size={18} opacity={0.3} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

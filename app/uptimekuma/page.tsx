"use client";

import { Activity, ShieldCheck, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useMobile } from '../hooks/useMobile';

export default function UptimeKumaPage() {
    const isMobile = useMobile(1024);
    return (
        <main className="page-container" style={{ paddingBottom: isMobile ? '120px' : '40px' }}>
            <div style={{ 
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
                position: 'relative',
                boxShadow: 'var(--md-sys-elevation-1)',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                    <BackButton />
                    {!isMobile && <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)', opacity: 0.5 }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{ 
                            backgroundColor: 'rgba(34, 197, 94, 0.15)', 
                            color: '#22c55e', 
                            padding: '8px', 
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Activity size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <h1 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--md-sys-color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Uptime Kuma</h1>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Service Availability Monitoring
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bento-grid" style={{ gridAutoRows: "auto" }}>
                <div className="md3-card-elevated col-span-3 md-col-span-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <ShieldCheck size={20} color="#22c55e" />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Global Uptime</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700 }}>99.98%</div>
                    <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px', marginTop: '8px' }}>Average across 24 monitors</div>
                </div>

                <div className="md3-card-elevated col-span-3 md-col-span-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Clock size={20} color="var(--md-sys-color-primary)" />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Avg Response</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700 }}>42ms</div>
                    <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px', marginTop: '8px' }}>Global latency average</div>
                </div>

                <div className="md3-card-elevated col-span-3 md-col-span-12">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <RefreshCw size={20} color="#eab308" />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Incidents</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700 }}>0 Active</div>
                    <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px', marginTop: '8px' }}>Last incident: 12 days ago</div>
                </div>

                <div className="md3-card-filled col-span-12" style={{ padding: isMobile ? '20px' : '32px' }}>
                    <h2 style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '24px' }}>Monitor Status</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
                        {[
                            { name: 'Cloudflare Edge', status: 'Online', resp: '12ms' },
                            { name: 'Proxmox Node 01', status: 'Online', resp: '2ms' },
                            { name: 'Home Assistant', status: 'Online', resp: '5ms' },
                            { name: 'External Web App', status: 'Online', resp: '124ms' },
                            { name: 'Database Cluster', status: 'Online', resp: '8ms' },
                        ].map((m, i) => (
                            <div key={i} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '16px', 
                                padding: isMobile ? '14px 12px' : '16px', 
                                backgroundColor: 'var(--md-sys-color-surface-container)', 
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <CheckCircle2 size={isMobile ? 20 : 24} color="#22c55e" />
                                <div style={{ flex: 1, fontWeight: 600, fontSize: isMobile ? '14px' : '16px' }}>{m.name}</div>
                                {!isMobile && <div style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>{m.resp}</div>}
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    {[...Array(isMobile ? 12 : 20)].map((_, j) => (
                                        <div key={j} style={{ width: '4px', height: '16px', backgroundColor: '#22c55e', borderRadius: '2px', opacity: 0.3 + (j / (isMobile ? 12 : 20)) }}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

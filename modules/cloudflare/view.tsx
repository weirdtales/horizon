"use client";

import React, { useState } from 'react';
import { 
    Shield, Globe, ShieldCheck, Zap, Loader2, AlertCircle,
    ChevronRight, CheckCircle2, ChevronLeft, Pencil, Plus, Save, X,
    Trash2
} from 'lucide-react';
import { useService } from '@/app/hooks/useService';
import { useMobile } from '@/app/hooks/useMobile';

interface CFRecord {
    id?: string;
    type: string;
    name: string;
    content: string;
    proxied: boolean;
    ttl: number;
}

interface CFDomain {
    id: string;
    name: string;
    status: string;
    plan: string;
    metrics?: {
        requests: number;
        bandwidth: number;
    };
}

export default function CloudflareView() {
    const isMobile = useMobile(1024);
    const [selectedZone, setSelectedZone] = useState<CFDomain | null>(null);
    
    // CRUD state
    const [editingRecord, setEditingRecord] = useState<CFRecord | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { data, loading, error: globalError, refetch } = useService('cloudflare', 60000);
    
    // DNS Records fetcher
    const { data: dnsData, loading: dnsLoading, refetch: refetchDNS } = useService(
        selectedZone ? `cloudflare/zones/${selectedZone.id}/dns` : 'cloudflare',
        selectedZone ? 60000 : 9999999
    );

    const handleSaveRecord = async (record: CFRecord) => {
        if (!selectedZone) return;
        setSaving(true);
        setLocalError(null);
        try {
            const method = record.id ? 'PATCH' : 'POST';
            const body = record.id ? { record_id: record.id, ...record } : record;
            const res = await fetch(`/api/cloudflare/zones/${selectedZone.id}/dns`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || (resData.errors && resData.errors[0]?.message) || 'Failed to save record');
            
            await refetchDNS();
            setEditingRecord(null);
            setIsAdding(false);
        } catch (err: unknown) {
            setLocalError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        if (!selectedZone) return;
        if (!confirm('Are you sure you want to delete this Cloudflare record?')) return;
        
        setSaving(true);
        setLocalError(null);
        try {
            const res = await fetch(`/api/cloudflare/zones/${selectedZone.id}/dns`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ record_id: recordId })
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || 'Failed to delete record');
            
            await refetchDNS();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setSaving(false);
        }
    };

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

    if (loading && !selectedZone) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <Loader2 className="animate-spin" size={48} color="#f38020" />
                <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Syncing Global Edge...</div>
            </div>
        );
    }

    if (globalError && !selectedZone) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
                <AlertCircle size={64} color="var(--md-sys-color-error)" />
                <h2 style={{ marginTop: '24px', fontSize: '24px', fontWeight: 900 }}>Connection Failed</h2>
                <p style={{ opacity: 0.6, maxWidth: '400px' }}>Unable to reach Cloudflare Edge servers. Please verify your API token in settings.</p>
                <button onClick={() => refetch()} style={{ marginTop: '24px', padding: '12px 32px', borderRadius: '24px', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', fontWeight: 700 }}>Retry Connection</button>
            </div>
        );
    }

    const renderRecordDialog = () => {
        if (!selectedZone) return null;
        const record = editingRecord || { type: 'A', name: selectedZone.name, content: '', proxied: true, ttl: 1 };
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="md3-card-elevated" style={{ width: '100%', maxWidth: '400px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '32px', padding: '32px', boxShadow: 'var(--md-sys-elevation-5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{isAdding ? 'Add CF Record' : 'Edit CF Record'}</h3>
                        <button onClick={() => { setEditingRecord(null); setIsAdding(false); setLocalError(null); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                    </div>

                    {localError && (
                        <div style={{ padding: '12px', background: 'var(--md-sys-color-error-container)', color: 'var(--md-sys-color-on-error-container)', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} /> {localError}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>Type</label>
                            <select 
                                value={record.type} 
                                onChange={e => setEditingRecord({ ...record, type: e.target.value })}
                                style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '14px', color: 'inherit' }}
                            >
                                {['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'SRV', 'NS'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>Name (Host)</label>
                            <input 
                                type="text" 
                                value={record.name} 
                                onChange={e => setEditingRecord({ ...record, name: e.target.value })}
                                placeholder="example.com"
                                style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '14px', color: 'inherit' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>Content (Value)</label>
                            <input 
                                type="text" 
                                value={record.content} 
                                onChange={e => setEditingRecord({ ...record, content: e.target.value })}
                                placeholder="IPv4 address or hostname"
                                style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '14px', color: 'inherit' }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', borderRadius: '14px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Shield size={18} color="#f38020" />
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>Proxy Traffic</span>
                             </div>
                             <input 
                                type="checkbox" 
                                checked={record.proxied} 
                                onChange={e => setEditingRecord({ ...record, proxied: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                             />
                        </div>

                        <button 
                            onClick={() => handleSaveRecord(record)}
                            disabled={saving}
                            className="md3-button-filled m3-press-effect"
                            style={{ marginTop: '12px', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f38020', color: 'white' }}
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isAdding ? 'Deploy to Edge' : 'Update Record'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- DNS RECORDS VIEW ---
    if (selectedZone) {
        return (
            <div style={{ padding: '0px' }}>
                {(editingRecord || isAdding) && renderRecordDialog()}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            onClick={() => setSelectedZone(null)}
                            style={{ background: 'var(--md-sys-color-surface-container-high)', border: 'none', color: 'inherit', padding: '12px', borderRadius: '50%', cursor: 'pointer' }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{selectedZone.name}</h2>
                            <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Cloudflare DNS Management</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setIsAdding(true); setEditingRecord(null); }}
                        className="md3-button-tonal m3-press-effect"
                        style={{ padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                        <Plus size={18} /> Add Record
                    </button>
                </div>

                {dnsLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} color="#f38020" style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '16px', opacity: 0.6 }}>Fetching edge records...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(dnsData?.records || []).map((record: CFRecord) => (
                            <div key={record.id} style={{ padding: '20px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                                    <div style={{ 
                                        backgroundColor: record.proxied ? 'rgba(243, 128, 32, 0.1)' : 'var(--md-sys-color-secondary-container)', 
                                        color: record.proxied ? '#f38020' : 'var(--md-sys-color-on-secondary-container)', 
                                        padding: '10px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, width: '48px', textAlign: 'center', flexShrink: 0 
                                    }}>
                                        {record.type}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.name}</div>
                                        <div style={{ fontSize: '13px', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.content}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                    {record.proxied && (
                                        <div title="Proxied by Cloudflare" style={{ backgroundColor: 'rgba(243, 128, 32, 0.1)', color: '#f38020', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Shield size={12} />
                                            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>Proxied</span>
                                        </div>
                                    )}
                                    <div style={{ fontSize: '11px', opacity: 0.4, fontWeight: 700 }}>TTL: {record.ttl === 1 ? 'Auto' : record.ttl}</div>
                                    <div style={{ width: '1px', height: '24px', background: 'var(--md-sys-color-outline-variant)', margin: '0 4px' }} />
                                    <button 
                                        onClick={() => { setEditingRecord(record); setIsAdding(false); }}
                                        className="m3-press-effect"
                                        style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.5, cursor: 'pointer' }}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => { if (record.id) handleDeleteRecord(record.id); }}
                                        className="m3-press-effect"
                                        style={{ background: 'none', border: 'none', color: 'var(--md-sys-color-error)', opacity: 0.5, cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- OVERVIEW VIEW ---
    return (
        <div style={{ padding: '0px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '16px' : '24px', marginBottom: isMobile ? '24px' : '40px' }}>
                {[
                    { label: 'Requests', value: formatNumber(data?.totals?.requests || 0), icon: Zap, color: '#f38020' },
                    { label: 'Threats', value: formatNumber(data?.totals?.threats || 0), icon: Shield, color: '#f87171' },
                    { label: 'Cache Ratio', value: `${data?.totals?.cacheRatio || 0}%`, icon: Zap, color: '#4ade80' },
                    { label: 'Active Zones', value: data?.domains?.length || 0, icon: Globe, color: 'var(--md-sys-color-primary)' }
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
                            {data?.domains?.length || 0} Zones Managed
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(data?.domains || []).map((domain: CFDomain) => (
                            <button 
                                key={domain.id} 
                                onClick={() => setSelectedZone(domain)}
                                className="m3-press-effect"
                                style={{ 
                                    display: 'grid', gridTemplateColumns: isMobile ? '1fr 40px' : '2fr 1fr 1fr 1fr 40px', alignItems: 'center',
                                    padding: isMobile ? '12px 14px' : '16px 20px', background: 'var(--md-sys-color-surface-container)', 
                                    borderRadius: '20px', border: '1px solid var(--md-sys-color-outline-variant)',
                                    gap: isMobile ? '8px' : '0', textAlign: 'left', width: '100%', color: 'inherit', cursor: 'pointer'
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
                            </button>
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
                                        const bw = Number(data?.totals?.bandwidth || 0);
                                        const ratio = Number(data?.totals?.cacheRatio ?? 0) / 100;
                                        const result = bw * ratio;
                                        return formatBytes(isNaN(result) ? 0 : result);
                                    })(),
                                    icon: CheckCircle2, color: '#4ade80' 
                                },
                                { label: 'Security Threats', value: formatNumber(data?.totals?.threats || 0), icon: Shield, color: '#f87171' },
                                { label: 'Unique Visitors', value: formatNumber(data?.totals?.uniques || 0), icon: Globe, color: 'var(--md-sys-color-primary)' }
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

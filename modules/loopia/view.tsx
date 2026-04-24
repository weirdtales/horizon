"use client";

import React, { useState } from 'react';
import { 
    Globe, Fingerprint, ShieldCheck, RefreshCw, Loader2, 
    Server, Activity, Shield, ArrowLeft, ChevronRight, Search, 
    ExternalLink, AlertCircle, ChevronLeft, Layers, Settings, HardDrive,
    Trash2, Plus, Info, Pencil, Check, X, Save
} from 'lucide-react';
import { BackButton } from '@/app/components/BackButton';
import { useService } from '@/app/hooks/useService';
import { useMobile } from '@/app/hooks/useMobile';

interface DNSRecord {
    record_id?: number;
    type: string;
    rdata: string;
    ttl: number;
    priority?: number;
}

export default function LoopiaView() {
    const isMobile = useMobile(1024);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [selectedSubdomain, setSelectedSubdomain] = useState<string | null>(null);
    
    // Dialog state
    const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: domainsData, loading: domainsLoading, error: domainsError, refetch: refetchDomains } = useService('loopia/domains', 300000);
    
    const { data: subsData, loading: subsLoading, error: subsError } = useService(
        selectedDomain ? `loopia/subdomains?domain=${selectedDomain}` : 'loopia/domains',
        selectedDomain ? 300000 : 9999999
    );

    const { data: recordsData, loading: recordsLoading, error: recordsError, refetch: refetchRecords } = useService(
        (selectedDomain && selectedSubdomain) ? `loopia/records?domain=${selectedDomain}&subdomain=${selectedSubdomain}` : 'loopia/domains',
        (selectedDomain && selectedSubdomain) ? 300000 : 9999999
    );

    const handleSaveRecord = async (record: DNSRecord) => {
        if (!selectedDomain || !selectedSubdomain) return;
        setSaving(true);
        setError(null);
        try {
            const method = record.record_id ? 'PUT' : 'POST';
            const res = await fetch('/api/loopia/records', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: selectedDomain,
                    subdomain: selectedSubdomain,
                    record
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save record');
            
            await refetchRecords();
            setEditingRecord(null);
            setIsAdding(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRecord = async (recordId: number) => {
        if (!selectedDomain || !selectedSubdomain) return;
        if (!confirm('Are you sure you want to delete this DNS record?')) return;
        
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/loopia/records', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: selectedDomain,
                    subdomain: selectedSubdomain,
                    record_id: recordId
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete record');
            
            await refetchRecords();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (domainsLoading && !selectedDomain) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#3b82f6" />
                <div style={{ marginTop: '20px', fontSize: '14px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Accessing Domain Cluster...</div>
            </div>
        );
    }

    // --- Record Edit Dialog ---
    const renderRecordDialog = () => {
        const record = editingRecord || { type: 'A', rdata: '', ttl: 3600 };
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="md3-card-elevated" style={{ width: '100%', maxWidth: '400px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '32px', padding: '32px', boxShadow: 'var(--md-sys-elevation-5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{isAdding ? 'Add DNS Record' : 'Edit DNS Record'}</h3>
                        <button onClick={() => { setEditingRecord(null); setIsAdding(false); setError(null); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: 'var(--md-sys-color-error-container)', color: 'var(--md-sys-color-on-error-container)', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} /> {error}
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
                            <label style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>Value (RData)</label>
                            <input 
                                type="text" 
                                value={record.rdata} 
                                onChange={e => setEditingRecord({ ...record, rdata: e.target.value })}
                                placeholder="e.g. 1.2.3.4 or target.com"
                                style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '14px', color: 'inherit' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>TTL</label>
                                <input 
                                    type="number" 
                                    value={record.ttl} 
                                    onChange={e => setEditingRecord({ ...record, ttl: parseInt(e.target.value) || 3600 })}
                                    style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '14px', color: 'inherit' }}
                                />
                            </div>
                            {record.type === 'MX' || record.type === 'SRV' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>Priority</label>
                                    <input 
                                        type="number" 
                                        value={record.priority || 10} 
                                        onChange={e => setEditingRecord({ ...record, priority: parseInt(e.target.value) || 0 })}
                                        style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '14px', color: 'inherit' }}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <button 
                            onClick={() => handleSaveRecord(record)}
                            disabled={saving}
                            className="md3-button-filled m3-press-effect"
                            style={{ marginTop: '12px', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isAdding ? 'Create Record' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- RENDER LEVEL 2: Record List ---
    if (selectedDomain && selectedSubdomain) {
        return (
            <div style={{ padding: '0px' }}>
                {(editingRecord || isAdding) && renderRecordDialog()}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            onClick={() => setSelectedSubdomain(null)}
                            style={{ background: 'var(--md-sys-color-surface-container-high)', border: 'none', color: 'inherit', padding: '12px', borderRadius: '50%', cursor: 'pointer' }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{selectedSubdomain}.{selectedDomain}</h2>
                            <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>DNS Zone Records</div>
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

                {recordsLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} color="#3b82f6" style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '16px', opacity: 0.6 }}>Fetching DNS records...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(recordsData?.records || []).map((record: any) => (
                            <div key={record.record_id} style={{ padding: '20px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ backgroundColor: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', padding: '10px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, width: '40px', textAlign: 'center' }}>
                                        {record.type}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontWeight: 800, fontSize: '15px' }}>{record.rdata}</div>
                                        <div style={{ fontSize: '11px', opacity: 0.5, fontWeight: 700 }}>TTL: {record.ttl} • ID: {record.record_id} {record.priority ? `• Priority: ${record.priority}` : ''}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                        onClick={() => { setEditingRecord(record); setIsAdding(false); }}
                                        className="m3-press-effect"
                                        style={{ background: 'none', border: 'none', color: 'var(--md-sys-color-on-surface-variant)', cursor: 'pointer', padding: '8px' }}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRecord(record.record_id)}
                                        className="m3-press-effect"
                                        style={{ background: 'none', border: 'none', color: 'var(--md-sys-color-error)', cursor: 'pointer', padding: '8px' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!recordsData?.records || recordsData.records.length === 0) && (
                            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.4, background: 'var(--md-sys-color-surface-container)', borderRadius: '32px', border: '1px dashed var(--md-sys-color-outline-variant)' }}>
                                <Info size={32} style={{ margin: '0 auto 16px' }} />
                                <div style={{ fontWeight: 800 }}>No Records Found</div>
                                <div style={{ fontSize: '12px' }}>This subdomain currently has no DNS records defined.</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER LEVEL 1: Subdomain List ---
    if (selectedDomain) {
        return (
            <div style={{ padding: '0px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button 
                        onClick={() => setSelectedDomain(null)}
                        style={{ background: 'var(--md-sys-color-surface-container-high)', border: 'none', color: 'inherit', padding: '12px', borderRadius: '50%', cursor: 'pointer' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{selectedDomain}</h2>
                        <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Subdomain Management</div>
                    </div>
                </div>

                {subsLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} color="#3b82f6" style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '16px', opacity: 0.6 }}>Polling subdomains...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {(subsData?.subdomains || []).map((sub: string) => (
                            <button 
                                key={sub} 
                                onClick={() => setSelectedSubdomain(sub)}
                                className="m3-press-effect" 
                                style={{ 
                                    padding: '20px', background: 'var(--md-sys-color-surface-container-high)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '24px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', width: '100%', color: 'inherit', cursor: 'pointer' 
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '10px', borderRadius: '12px' }}>
                                        <Layers size={18} />
                                    </div>
                                    <div style={{ fontWeight: 800 }}>{sub === '@' ? '(root)' : sub}</div>
                                </div>
                                <ChevronRight size={18} opacity={0.3} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER LEVEL 0: Domain List ---
    return (
        <div style={{ padding: '0px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="md3-card-elevated" style={{ padding: '24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: '32px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', marginBottom: '12px' }}>Total Domains</div>
                    <div style={{ fontSize: '36px', fontWeight: 900 }}>{domainsData?.totals?.count || 0}</div>
                </div>
                <div className="md3-card-elevated" style={{ padding: '24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: '32px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', marginBottom: '12px' }}>Active Zones</div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#4ade80' }}>{domainsData?.totals?.active_zones || 0}</div>
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
                    <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.5 }}>{domainsData?.domains?.length || 0} records</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {(domainsData?.domains || []).map((domain: any, idx: number) => (
                        <button 
                            key={`${domain.domain}-${idx}`} 
                            onClick={() => setSelectedDomain(domain.domain)}
                            className="m3-press-effect" 
                            style={{ 
                                padding: '20px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', width: '100%', color: 'inherit', cursor: 'pointer' 
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '10px', borderRadius: '12px' }}>
                                    <Globe size={18} />
                                </div>
                                <div style={{ fontWeight: 800 }}>{domain.domain}</div>
                            </div>
                            <ChevronRight size={18} opacity={0.3} />
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}

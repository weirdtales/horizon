"use client";

import React from 'react';
import { Shield, Lock, Activity, Loader2 } from 'lucide-react';
import { useService } from '@/app/hooks/useService';

export default function NpmWidget() {
    const { data, loading, error } = useService('npm/stats', 60000);

    if (loading) {
        return (
            <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                <Loader2 className="animate-spin" color="#34d399" size={32} />
                <div style={{ fontSize: '13px', opacity: 0.5 }}>Syncing Proxy Rules...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', opacity: 0.6 }}>
                <Shield size={32} color="var(--md-sys-color-error)" />
                <div style={{ fontSize: '13px', textAlign: 'center' }}>NPM Connection Error</div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '12px', borderRadius: '16px' }}><Shield size={24} /></div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>NPM Proxy</h3>
                        <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>Firewall Active</div>
                    </div>
                </div>
                <Lock size={20} color="#34d399" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', flex: 1 }}>
                <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)', padding: '16px', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{data.proxy_hosts || 0}</div>
                    <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>Proxy Hosts</div>
                </div>
                <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)', padding: '16px', borderRadius: '24px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#34d399' }}>{data.certificates || 0}</div>
                    <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>SSL Certs</div>
                </div>
            </div>

            <div style={{ marginTop: '20px', padding: '10px 16px', backgroundColor: 'var(--md-sys-color-surface-container)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
                <Activity size={14} color="#34d399" />
                <span>Connected to NPM Proxy</span>
            </div>
        </div>
    );
}

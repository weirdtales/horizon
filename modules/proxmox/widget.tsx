"use client";

import React from 'react';
import { Server, Monitor, Box } from 'lucide-react';

export default function ProxmoxWidget() {
    return (
        <div className="proxmox-theme" style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'rgba(229, 112, 0, 0.1)', color: '#e57000', padding: '12px', borderRadius: '16px' }}><Server size={24} /></div>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Proxmox Node</h3>
                    <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>pve-cluster-primary</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                {[
                    { label: 'CPU Load', value: 14.2, color: '#e57000' },
                    { label: 'Memory', value: 42.8, color: '#e57000' }
                ].map(resource => (
                    <div key={resource.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                            <span>{resource.label}</span>
                            <span>{resource.value}%</span>
                        </div>
                        <div 
                            role="progressbar" 
                            aria-valuenow={resource.value} 
                            aria-valuemin={0} 
                            aria-valuemax={100} 
                            aria-label={resource.label}
                            style={{ width: '100%', height: '12px', backgroundColor: 'var(--md-sys-color-surface-container-highest)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--md-sys-color-outline-variant)' }}
                        >
                            <div style={{ width: `${resource.value}%`, height: '100%', backgroundColor: resource.color, borderRadius: '6px', transition: 'width 1s ease' }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, opacity: 0.8 }}><Monitor size={12} color="var(--md-color-service-status-ok)" /> 14 VMs</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, opacity: 0.8 }}><Box size={12} color="var(--md-color-service-status-ok)" /> 8 CTs</div>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { Server, Monitor, Box, Activity, Loader2 } from 'lucide-react';
import { useService } from '@/app/hooks/useService';
import ModuleModeBadge from '@/components/ModuleModeBadge';
import { PROXMOX_SAMPLE_DATA, type ProxmoxSampleData, type SampleModuleResponse } from '@/lib/sample-data';

export default function ProxmoxWidget() {
    const { data, loading, error } = useService<
        SampleModuleResponse<ProxmoxSampleData> & { connectorConfigured?: boolean }
    >('proxmox', 60000);
    const payload = data || PROXMOX_SAMPLE_DATA;
    const proxmox = payload.data;
    const isSample = payload.mode === 'sample' || Boolean(error);

    if (loading && !data) {
        return (
            <div
                className="proxmox-theme"
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
                <Loader2 className="animate-spin" color="#e57000" size={32} />
                <div style={{ fontSize: '13px', opacity: 0.5 }}>Loading cluster sample...</div>
            </div>
        );
    }

    return (
        <div
            className="proxmox-theme"
            style={{
                height: '100%',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        style={{
                            backgroundColor: 'rgba(229, 112, 0, 0.1)',
                            color: '#e57000',
                            padding: '12px',
                            borderRadius: '16px',
                        }}
                    >
                        <Server size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Proxmox Node</h3>
                        <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                            {proxmox.nodeName}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isSample && (
                        <ModuleModeBadge mode="sample" accentColor="#e57000" backgroundColor="rgba(229, 112, 0, 0.1)" />
                    )}
                    <Activity size={20} color="#e57000" />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                {[
                    { label: 'CPU Load', value: proxmox.cpuLoadPercent, color: '#e57000' },
                    { label: 'Memory', value: proxmox.memoryPercent, color: '#e57000' },
                ].map(resource => (
                    <div key={resource.label}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                            }}
                        >
                            <span>{resource.label}</span>
                            <span>{resource.value}%</span>
                        </div>
                        <div
                            role="progressbar"
                            aria-valuenow={resource.value}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={resource.label}
                            style={{
                                width: '100%',
                                height: '12px',
                                backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid var(--md-sys-color-outline-variant)',
                            }}
                        >
                            <div
                                style={{
                                    width: `${resource.value}%`,
                                    height: '100%',
                                    backgroundColor: resource.color,
                                    borderRadius: '6px',
                                    transition: 'width 1s ease',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        opacity: 0.8,
                    }}
                >
                    <Monitor size={12} color="var(--md-color-service-status-ok)" /> {proxmox.vmCount} VMs
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        opacity: 0.8,
                    }}
                >
                    <Box size={12} color="var(--md-color-service-status-ok)" /> {proxmox.containerCount} CTs
                </div>
            </div>
        </div>
    );
}

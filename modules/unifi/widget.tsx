'use client';

import React from 'react';
import { Wifi, Activity, Download, Loader2 } from 'lucide-react';
import { useService } from '@/app/hooks/useService';
import { UNIFI_SAMPLE_DATA, type SampleModuleResponse, type UniFiSampleData } from '@/lib/sample-data';

export default function UniFiWidget() {
    const { data, loading, error } = useService<
        SampleModuleResponse<UniFiSampleData> & { connectorConfigured?: boolean }
    >('unifi', 60000);
    const payload = data || UNIFI_SAMPLE_DATA;
    const unifi = payload.data;
    const isSample = payload.mode === 'sample' || Boolean(error);

    if (loading && !data) {
        return (
            <div
                className="unifi-theme"
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
                <Loader2 className="animate-spin" color="#0559C9" size={32} />
                <div style={{ fontSize: '13px', opacity: 0.5 }}>Loading network sample...</div>
            </div>
        );
    }

    return (
        <div
            className="unifi-theme"
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
                            backgroundColor: 'rgba(5, 89, 201, 0.1)',
                            color: '#0559C9',
                            padding: '12px',
                            borderRadius: '16px',
                            boxShadow: '0 0 20px rgba(5, 89, 201, 0.1)',
                        }}
                    >
                        <Wifi size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{unifi.controllerName}</h3>
                        <div style={{ fontSize: '12px', color: '#0559C9', fontWeight: 600 }}>
                            Uptime: {unifi.uptimeDays} Days
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isSample && (
                        <span
                            style={{
                                padding: '4px 8px',
                                borderRadius: '999px',
                                background: 'rgba(5, 89, 201, 0.1)',
                                color: '#0559C9',
                                fontSize: '10px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                            }}
                        >
                            Sample
                        </span>
                    )}
                    <Activity size={20} color="#0559C9" />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: 'var(--md-sys-color-surface-container-high)',
                        padding: '16px',
                        borderRadius: '24px',
                        textAlign: 'center',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                    }}
                >
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                        {unifi.clients}
                    </div>
                    <div
                        style={{
                            fontSize: '10px',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                        }}
                    >
                        Clients
                    </div>
                </div>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: 'var(--md-sys-color-surface-container-high)',
                        padding: '16px',
                        borderRadius: '24px',
                        textAlign: 'center',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                    }}
                >
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                        {unifi.devices}
                    </div>
                    <div
                        style={{
                            fontSize: '10px',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                        }}
                    >
                        Devices
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                    }}
                >
                    <span>Traffic Speed</span>
                    <span style={{ color: 'var(--md-color-service-status-ok)' }}>
                        <Download size={14} style={{ display: 'inline', marginRight: 4 }} /> {unifi.trafficMbps} Mbps
                    </span>
                </div>
                <div
                    style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${unifi.trafficPercent}%`,
                            height: '100%',
                            backgroundColor: '#0559C9',
                            borderRadius: '4px',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

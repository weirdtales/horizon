"use client";

import React, { use } from 'react';
import { MODULE_VIEWS, getModuleManifest } from '@/lib/registry';
import { BackButton } from '@/app/components/BackButton';
import { DashboardIcon } from '@/app/components/DashboardIcon';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ModularViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const View = MODULE_VIEWS[id];
    const manifest = getModuleManifest(id);

    if (!View) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
                <ShieldAlert size={48} color="var(--md-sys-color-error)" />
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Module View Not Found</h2>
                <p style={{ opacity: 0.6 }}>The plugin '{id}' does not provide a full-page view.</p>
                <BackButton />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--md-sys-color-surface)' }}>
            <div style={{ 
                padding: '8px 24px', 
                height: '64px',
                backgroundColor: 'var(--md-sys-color-surface-container)', 
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                zIndex: 10,
                boxShadow: 'var(--md-sys-elevation-1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0, flex: 1 }}>
                    <BackButton />
                    
                    <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)', opacity: 0.5 }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{ 
                            backgroundColor: manifest ? `color-mix(in srgb, ${manifest.color} 15%, transparent)` : 'var(--md-sys-color-surface-container-high)', 
                            padding: '8px', 
                            borderRadius: '10px',
                            color: manifest?.color || 'var(--md-sys-color-primary)'
                        }}>
                            <DashboardIcon icon={manifest?.icon || 'Zap'} size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{ 
                                fontSize: '15px', 
                                fontWeight: 700, 
                                color: 'var(--md-sys-color-on-surface)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {manifest?.name || id}
                            </span>
                            <span style={{ 
                                fontSize: '11px', 
                                fontWeight: 500, 
                                color: 'var(--md-sys-color-on-surface-variant)',
                                opacity: 0.5,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                Native Module /view/{id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
                <React.Suspense fallback={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Loader2 size={48} className="animate-spin" color="var(--md-sys-color-primary)" />
                    </div>
                }>
                    <View />
                </React.Suspense>
            </div>
        </div>
    );
}

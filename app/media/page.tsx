"use client";

import { Film, Play, Download, Search, Tv } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export default function MediaPage() {
    return (
        <main className="page-container">
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
                position: 'relative',
                boxShadow: 'var(--md-sys-elevation-1)',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                    <BackButton />
                    <div aria-hidden="true" style={{ height: '24px', width: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)', opacity: 0.5 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{ 
                            backgroundColor: 'var(--md-color-service-media-movies-bg)', 
                            color: 'var(--md-color-service-media-movies)', 
                            padding: '8px', 
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Film size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <h1 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--md-sys-color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Media Engine</h1>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Entertainment & Automation Hub
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '48px', fontSize: '20px', maxWidth: '650px', lineHeight: '1.5' }}>
                Your personal entertainment ecosystem. Managed, automated, and shared.
            </p>

            <div className="bento-grid" style={{ gridAutoRows: "auto" }}>
                <div className="md3-card-elevated col-span-4 md-col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Tv size={24} color="#FFC107" /> Recently Added
                        </h2>
                        <button className="md3-button-text">View All</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ 
                                    aspectRatio: '2/3', 
                                    backgroundColor: 'var(--md-sys-color-surface-container-highest)', 
                                    borderRadius: '12px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div className="md3-skeleton" style={{ width: '100%', height: '100%' }}></div>
                                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '50%' }}>
                                        <Play size={16} color="white" fill="white" />
                                    </div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Movie Title {i + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md3-card-elevated col-span-4 md-col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h2 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Download size={24} color="#4ade80" /> Active Downloads
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { name: 'Dune: Part Two (2024)', progress: '72%', speed: '12.4 MB/s' },
                            { name: 'Shogun S01E08', progress: '45%', speed: '4.8 MB/s' },
                            { name: 'Civil War (2024)', progress: '12%', speed: '8.2 MB/s' },
                        ].map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{d.name}</span>
                                    <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{d.speed}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--md-sys-color-surface-container-highest)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: d.progress, height: '100%', backgroundColor: '#FFC107' }}></div>
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, width: '32px' }}>{d.progress}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="md3-button-filled" style={{ marginTop: 'auto', gap: '12px' }}>
                        <Search size={18} /> Search New Media
                    </button>
                </div>
            </div>
        </main>
    );
}

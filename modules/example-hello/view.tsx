'use client';

import React from 'react';
import { BackButton } from '@/app/components/BackButton';
import { Code, Layout, Sparkles } from 'lucide-react';

export default function HelloView() {
    return (
        <div style={{ minHeight: '100vh', padding: '48px', backgroundColor: 'var(--md-sys-color-surface)' }}>
            <header style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <BackButton />
                    <div
                        style={{
                            backgroundColor: 'rgba(129, 140, 248, 0.1)',
                            color: '#818cf8',
                            padding: '6px 14px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 900,
                            border: '1px solid rgba(129, 140, 248, 0.2)',
                        }}
                    >
                        DEVELOPER TEMPLATE
                    </div>
                </div>
                <h1 style={{ fontSize: '48px', fontWeight: 900, margin: 0, letterSpacing: '-0.04em' }}>
                    Module Blueprint
                </h1>
                <p
                    style={{
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontSize: '18px',
                        margin: '8px 0 0 0',
                        opacity: 0.7,
                    }}
                >
                    This is a reference implementation for building modular Horizon plugins.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div
                    className="md3-card-elevated"
                    style={{
                        padding: '32px',
                        borderRadius: '32px',
                        background: 'var(--md-sys-color-surface-container-low)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                    }}
                >
                    <Code size={32} color="#818cf8" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px 0' }}>Clean Architecture</h3>
                    <p style={{ fontSize: '14px', opacity: 0.6, lineHeight: 1.6, margin: 0 }}>
                        Modules are self-contained within their own directories, including manifests, widgets, and
                        full-page views.
                    </p>
                </div>
                <div
                    className="md3-card-elevated"
                    style={{
                        padding: '32px',
                        borderRadius: '32px',
                        background: 'var(--md-sys-color-surface-container-low)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                    }}
                >
                    <Layout size={32} color="#818cf8" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px 0' }}>Responsive Grid</h3>
                    <p style={{ fontSize: '14px', opacity: 0.6, lineHeight: 1.6, margin: 0 }}>
                        Widgets automatically adapt to the dashboard grid while views provide a premium, desktop-class
                        experience.
                    </p>
                </div>
                <div
                    className="md3-card-elevated"
                    style={{
                        padding: '32px',
                        borderRadius: '32px',
                        background: 'var(--md-sys-color-surface-container-low)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                    }}
                >
                    <Sparkles size={32} color="#818cf8" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px 0' }}>Design Tokens</h3>
                    <p style={{ fontSize: '14px', opacity: 0.6, lineHeight: 1.6, margin: 0 }}>
                        All modules leverage the Material Design 3 (MD3) design system for consistent styling and
                        theming.
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Registry of available modules
// In a future update, this can be auto-generated or fetched from an API
const MODULE_VIEWS: Record<string, React.ComponentType> = {
    'sonarr': dynamic(() => import('@/modules/sonarr/view'), { loading: () => <ModuleLoading /> }),
    'radarr': dynamic(() => import('@/modules/radarr/view'), { loading: () => <ModuleLoading /> }),
    'plex': dynamic(() => import('@/modules/plex/view'), { loading: () => <ModuleLoading /> }),
    'example-hello': dynamic(() => import('@/modules/example-hello/view'), { loading: () => <ModuleLoading /> }),
};

function ModuleLoading() {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--md-sys-color-surface)' }}>
            <Loader2 className="animate-spin" size={48} color="var(--md-sys-color-primary)" />
            <div style={{ marginTop: '20px', fontSize: '14px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Initializing Module...</div>
        </div>
    );
}

export default function DynamicHubPage() {
    const params = useParams();
    const hubId = params.hub as string;
    
    const View = MODULE_VIEWS[hubId];

    if (!View) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-on-surface)', textAlign: 'center', padding: '24px' }}>
                <AlertCircle size={64} color="var(--md-sys-color-error)" strokeWidth={1.5} />
                <h1 style={{ fontSize: '32px', fontWeight: 900, marginTop: '24px', letterSpacing: '-0.02em' }}>Module Not Found</h1>
                <p style={{ opacity: 0.6, maxWidth: '440px', fontSize: '16px', lineHeight: 1.6 }}>
                    The module <strong>&quot;{hubId}&quot;</strong> is not installed or does not have a registered full view.
                </p>
                <Link href="/" style={{ marginTop: '32px', padding: '12px 32px', borderRadius: '24px', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return <View />;
}

"use client";

import React from 'react';
import { DashboardIcon } from '@/app/components/DashboardIcon';

export default function DockgeWidget() {
    return (
        <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
            <DashboardIcon icon="Layers" size={48} color="#3c9bdc" />
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Dockge</div>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>Module placeholder</div>
        </div>
    );
}

'use client';

import React from 'react';
import { DashboardIcon } from '@/app/components/DashboardIcon';

export default function AdguardWidget() {
    return (
        <div
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
            <DashboardIcon icon="Shield" size={48} color="#4ade80" />
            <div style={{ fontSize: '18px', fontWeight: 800 }}>AdGuard Home</div>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>Module placeholder</div>
        </div>
    );
}

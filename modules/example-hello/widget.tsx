"use client";

import React from 'react';
import { Zap } from 'lucide-react';

export default function HelloWidget({ config }: { config?: any }) {
    return (
        <div style={{ 
            padding: '24px', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center'
        }}>
            <div style={{ 
                backgroundColor: 'rgba(129, 140, 248, 0.1)', 
                color: '#818cf8', 
                padding: '12px', 
                borderRadius: '16px' 
            }}>
                <Zap size={24} />
            </div>
            <div>
                <div style={{ fontWeight: 800, fontSize: '18px' }}>{config?.greeting || 'Hello, Horizon!'}</div>
                <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>Template Module Active</div>
            </div>
        </div>
    );
}

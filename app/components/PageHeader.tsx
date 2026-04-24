"use client";

import React from 'react';
import { BackButton } from './BackButton';
import { useMobile } from '../hooks/useMobile';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
    title, 
    subtitle, 
    showBack = true,
    actions 
}) => {
    const isMobile = useMobile(1024);

    return (
        <header style={{ 
            marginBottom: isMobile ? '32px' : '48px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '20px'
        }}>
            <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                justifyContent: 'space-between',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '20px' : '0'
            }}>
                <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '16px' : '20px', flexDirection: isMobile ? 'column' : 'row' }}>
                    {showBack && <BackButton />}
                    <div>
                        <h1 style={{ 
                            fontSize: isMobile ? '28px' : '48px', 
                            fontWeight: 900, 
                            margin: 0, 
                            letterSpacing: '-0.04em', 
                            color: 'var(--md-sys-color-on-surface)',
                            lineHeight: 1
                        }}>
                            {title}
                        </h1>
                        {subtitle && (
                            <p style={{ 
                                color: 'var(--md-sys-color-on-surface-variant)', 
                                fontSize: isMobile ? '14px' : '18px', 
                                margin: '8px 0 0 0', 
                                opacity: 0.7,
                                fontWeight: 500
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
};

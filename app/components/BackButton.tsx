"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackButtonProps {
    href?: string;
    label?: string;
    style?: React.CSSProperties;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
    href = "/", 
    label,
    style
}) => {
    const isCircular = !label;
    
    return (
        <Link 
            href={href} 
            className="m3-press-effect" 
            aria-label={label || "Back"}
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: label ? '12px' : '0', 
                textDecoration: 'none', 
                color: 'var(--md-sys-color-on-surface)', 
                background: 'var(--md-sys-color-surface-container)', 
                width: isCircular ? '40px' : 'auto',
                height: isCircular ? '40px' : 'auto',
                padding: isCircular ? '0' : '12px 24px', 
                borderRadius: 'var(--md-sys-shape-corner-full)', 
                border: '1px solid var(--md-sys-color-outline-variant)', 
                fontSize: '13px', 
                fontWeight: 900,
                letterSpacing: '0.08em',
                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                boxShadow: 'var(--md-sys-elevation-1)',
                ...style
            }}
        >
            <ArrowLeft size={20} strokeWidth={2} />
            {label && <span>{label}</span>}
        </Link>
    );
};

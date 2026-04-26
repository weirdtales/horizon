import React from 'react';

type ModuleModeBadgeProps = {
    mode: 'sample' | 'connected';
    accentColor: string;
    backgroundColor?: string;
};

export default function ModuleModeBadge({ mode, accentColor, backgroundColor }: ModuleModeBadgeProps) {
    return (
        <span
            style={{
                padding: '4px 8px',
                borderRadius: '999px',
                background: backgroundColor ?? 'var(--md-sys-color-surface-container-high)',
                color: accentColor,
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
            }}
        >
            {mode}
        </span>
    );
}

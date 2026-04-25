'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'loading';

interface MD3ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const MD3Toast = ({ message, type, onClose, duration = 4000 }: MD3ToastProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Note: Parents should memoize onClose (e.g., with useCallback) to prevent
    // unnecessary re-runs of this dismissal effect.
    useEffect(() => {
        if (type !== 'loading') {
            const timer = setTimeout(() => {
                setIsVisible(false);
                closeTimerRef.current = setTimeout(onClose, 300); // Wait for exit animation
            }, duration);

            return () => {
                clearTimeout(timer);
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            };
        }
    }, [type, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} color="var(--md-sys-color-primary)" />;
            case 'error':
                return <AlertCircle size={20} color="var(--md-sys-color-error)" />;
            case 'loading':
                return <RefreshCw size={20} className="spinning" />;
            default:
                return null;
        }
    };

    return (
        <div
            role="alert"
            style={{
                position: 'fixed',
                bottom: '40px',
                left: '50%',
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '100px'})`,
                opacity: isVisible ? 1 : 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px 12px 20px',
                background: 'var(--md-sys-color-inverse-surface)',
                color: 'var(--md-sys-color-inverse-on-surface)',
                borderRadius: '16px',
                boxShadow: 'var(--md-sys-elevation-3)',
                transition: 'all 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)',
                minWidth: '280px',
                maxWidth: '90vw',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon()}</div>

            <span
                style={{
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                }}
            >
                {message}
            </span>

            {type !== 'loading' && (
                <button
                    onClick={() => {
                        setIsVisible(false);
                        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                        closeTimerRef.current = setTimeout(onClose, 300);
                    }}
                    aria-label="Dismiss notification"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--md-sys-color-inverse-on-surface)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.6,
                    }}
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

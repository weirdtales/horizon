"use client";

import React, { useState } from 'react';
import { X, Save, Info, Loader2, AlertCircle } from 'lucide-react';
import { DashboardIcon } from './DashboardIcon';
import { ModuleManifest } from '@/lib/types';

interface ModuleSettingsDialogProps {
    module: ModuleManifest;
    initialSettings: Record<string, unknown>;
    onSave: (newSettings: Record<string, unknown>) => Promise<void>;
    onClose: () => void;
    extraActions?: React.ReactNode;
}

export function ModuleSettingsDialog({ module, initialSettings, onSave, onClose, extraActions }: ModuleSettingsDialogProps) {
    const [settings, setSettings] = useState(initialSettings || {});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await onSave(settings);
            onClose();
        } catch (err: unknown) {
            console.error('Failed to save module settings:', err);
            setError((err as Error).message || String(err) || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const isHex = (module.color || '').startsWith('#');
    const iconBgColor = isHex ? (module.color + '20') : `color-mix(in srgb, ${module.color || 'var(--md-sys-color-primary)'} 12%, transparent)`;

    return (
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                animation: 'fadeIn 0.2s ease'
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div 
                className="md3-card-elevated"
                role="dialog"
                aria-modal="true"
                aria-labelledby="module-settings-title"
                style={{
                    width: '90%',
                    maxWidth: '500px',
                    background: 'var(--md-sys-color-surface-container-high)',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--md-sys-elevation-5)',
                    animation: 'slideUpScale 0.3s cubic-bezier(0.2, 0, 0, 1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--md-sys-color-outline-variant)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            backgroundColor: iconBgColor,
                            color: module.color || 'var(--md-sys-color-primary)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DashboardIcon icon={module.icon} size={24} />
                        </div>
                        <div>
                            <div id="module-settings-title" style={{ fontWeight: 800, fontSize: '20px' }}>{module.name} Settings</div>
                            <div style={{ fontSize: '12px', opacity: 0.6, fontWeight: 500 }}>Contextual Service Configuration</div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="m3-press-effect"
                        aria-label="Close"
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'var(--md-sys-color-on-surface-variant)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {error && (
                        <div style={{ 
                            padding: '12px 16px', 
                            borderRadius: '12px', 
                            backgroundColor: 'var(--md-sys-color-error-container)', 
                            color: 'var(--md-sys-color-on-error-container)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                    {(module.configFields || []).map(field => {
                        const fieldId = `module-setting-${module.id}-${field.key}`;
                        return (
                            <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label 
                                    htmlFor={fieldId}
                                    style={{ fontSize: '11px', fontWeight: 900, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                >
                                    {field.label}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        id={fieldId}
                                        value={(settings[field.key] as string | number | undefined) || ''}
                                        onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                                        style={{
                                            backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                            border: '1px solid var(--md-sys-color-outline)',
                                            borderRadius: '16px',
                                            padding: '12px 16px',
                                            color: 'var(--md-sys-color-on-surface)',
                                            fontSize: '14px',
                                            outline: 'none',
                                            appearance: 'none',
                                            width: '100%'
                                        }}
                                    >
                                        <option value="" disabled>Select an option</option>
                                        {field.options?.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        id={fieldId}
                                        type={field.type === 'password' ? 'password' : 'text'}
                                        value={(settings[field.key] as string | number | undefined) || ''}
                                        onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        style={{
                                            backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                            border: '1px solid var(--md-sys-color-outline)',
                                            borderRadius: '16px',
                                            padding: '12px 16px',
                                            color: 'var(--md-sys-color-on-surface)',
                                            fontSize: '14px',
                                            outline: 'none',
                                            width: '100%'
                                        }}
                                    />
                                )}
                                {field.helpText && (
                                    <div style={{ fontSize: '11px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Info size={12} />
                                        {field.helpText}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {extraActions && (
                        <div style={{ marginTop: '16px', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '24px' }}>
                            {extraActions}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '24px 32px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                    borderTop: '1px solid var(--md-sys-color-outline-variant)'
                }}>
                    <button 
                        onClick={onClose}
                        className="md3-button-text m3-press-effect"
                        type="button"
                        style={{ padding: '12px 24px', borderRadius: '20px' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="md3-button-filled m3-press-effect"
                        type="button"
                        disabled={saving}
                        style={{ 
                            padding: '12px 24px', 
                            borderRadius: '20px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            backgroundColor: 'var(--md-sys-color-primary)',
                            color: 'var(--md-sys-color-on-primary)'
                        }}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

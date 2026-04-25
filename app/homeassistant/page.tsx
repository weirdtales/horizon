'use client';

import { Home, Lightbulb, Thermometer, ShieldCheck, Power } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useMobile } from '../hooks/useMobile';

export default function HomeAssistantPage() {
    const isMobile = useMobile(1024);
    return (
        <main className="page-container" style={{ paddingBottom: isMobile ? '120px' : '40px' }}>
            <div
                style={{
                    padding: isMobile ? '8px 16px' : '8px 24px',
                    height: isMobile ? 'auto' : '64px',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '16px' : '0',
                    zIndex: 10,
                    position: 'relative',
                    boxShadow: 'var(--md-sys-elevation-1)',
                    marginBottom: '32px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                    <BackButton />
                    {!isMobile && (
                        <div
                            style={{
                                height: '24px',
                                width: '1px',
                                backgroundColor: 'var(--md-sys-color-outline-variant)',
                                opacity: 0.5,
                            }}
                        />
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                            style={{
                                backgroundColor: 'rgba(3, 169, 244, 0.15)',
                                color: '#03A9F4',
                                padding: '8px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Home size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <h1
                                style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    margin: 0,
                                    color: 'var(--md-sys-color-on-surface)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                Home Assistant
                            </h1>
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    color: 'var(--md-sys-color-on-surface-variant)',
                                    opacity: 0.5,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                Smart Home Automation Engine
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bento-grid" style={{ gridAutoRows: 'auto' }}>
                <div
                    className="md3-card-elevated col-span-4 md-col-span-6"
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                            style={{
                                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                                color: '#eab308',
                                padding: '10px',
                                borderRadius: '12px',
                            }}
                        >
                            <Lightbulb size={24} />
                        </div>
                        <div
                            className="md3-skeleton"
                            style={{ width: '40px', height: '24px', borderRadius: '12px' }}
                        ></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 600 }}>Living Room Lights</div>
                        <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px' }}>
                            Brightness: 80%
                        </div>
                    </div>
                </div>

                <div
                    className="md3-card-elevated col-span-4 md-col-span-6"
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                padding: '10px',
                                borderRadius: '12px',
                            }}
                        >
                            <Thermometer size={24} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 600 }}>Temperature</div>
                        <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px' }}>
                            Currently 22.5°C
                        </div>
                    </div>
                </div>

                <div
                    className="md3-card-elevated col-span-4 md-col-span-12"
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                            style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                color: '#22c55e',
                                padding: '10px',
                                borderRadius: '12px',
                            }}
                        >
                            <ShieldCheck size={24} />
                        </div>
                        <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '14px' }}>Armed</span>
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 600 }}>Security System</div>
                        <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px' }}>
                            No issues detected
                        </div>
                    </div>
                </div>

                <div className="md3-card-filled col-span-12" style={{ padding: isMobile ? '20px' : '32px' }}>
                    <h2 style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '24px' }}>Recent Events</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '16px' }}>
                        {[
                            { time: '10:45 AM', event: 'Front Door opened', icon: Power, color: '#03A9F4' },
                            { time: '08:30 AM', event: 'Good Morning automation', icon: Zap, color: '#eab308' },
                            {
                                time: '02:00 AM',
                                event: 'Living room temp drop to 19°C',
                                icon: Thermometer,
                                color: '#ef4444',
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: isMobile ? '14px 8px' : '12px 16px',
                                    background: isMobile ? 'var(--md-sys-color-surface-container-low)' : 'transparent',
                                    borderRadius: isMobile ? '12px' : '0',
                                    borderBottom: isMobile ? 'none' : '1px solid var(--md-sys-color-outline-variant)',
                                }}
                            >
                                <div style={{ color: item.color, flexShrink: 0 }}>
                                    <item.icon size={20} />
                                </div>
                                <div style={{ flex: 1, fontSize: isMobile ? '14px' : '16px', fontWeight: 500 }}>
                                    {item.event}
                                </div>
                                <div
                                    style={{
                                        color: 'var(--md-sys-color-outline)',
                                        fontSize: isMobile ? '11px' : '14px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {item.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
const Zap = ({ size, color }: { size: number; color?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

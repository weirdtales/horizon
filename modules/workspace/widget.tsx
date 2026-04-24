"use client";

import React from 'react';
import { Mail, Calendar, ListTodo, Globe, Loader2, ExternalLink } from 'lucide-react';
import { useService } from '@/app/hooks/useService';

export default function WorkspaceWidget() {
    const { data, loading, error } = useService('workspace');

    if (error) {
        return (
            <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', color: 'var(--md-sys-color-error)' }}>
                <Globe size={32} opacity={0.5} />
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Connection Failed</div>
                <div style={{ fontSize: '11px', opacity: 0.6, textAlign: 'center' }}>{typeof error === 'string' ? error : 'Check Workspace settings'}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                <Loader2 className="animate-spin" color="#4285f4" size={32} />
                <div style={{ fontSize: '13px', opacity: 0.5 }}>Syncing Workspace...</div>
            </div>
        );
    }

    // Normalize data with safe defaults
    const workspaceData = {
        unread: Number(data?.unread) || 0,
        events: Array.isArray(data?.events) ? data.events : [],
        tasks: Number(data?.tasks) || 0
    };

    return (
        <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(66, 133, 244, 0.15)', color: '#4285f4', padding: '10px', borderRadius: '14px' }}>
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Google Workspace</h3>
                        <div style={{ fontSize: '11px', opacity: 0.6 }}>Connected</div>
                    </div>
                </div>
                <a 
                    href="https://workspace.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Open Google Workspace"
                    className="m3-press-effect"
                    style={{ color: 'inherit', opacity: 0.4, display: 'flex' }}
                >
                    <ExternalLink size={16} />
                </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', flex: 1 }}>
                <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)', padding: '16px', borderRadius: '20px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Mail size={20} color="#ea4335" />
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>{workspaceData.unread}</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>Unread</div>
                </div>
                <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)', padding: '16px', borderRadius: '20px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Calendar size={20} color="#4285f4" />
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>{workspaceData.events.length}</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>Events</div>
                </div>
                <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)', padding: '16px', borderRadius: '20px', border: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ListTodo size={20} color="#34a853" />
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>{workspaceData.tasks}</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>Tasks</div>
                </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: 'var(--md-sys-color-surface-container)', borderRadius: '16px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#4285f4', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Next Event</div>
                {workspaceData.events.length > 0 ? (() => {
                    const nextEvent = workspaceData.events[0];
                    const startTime = nextEvent?.start;
                    const isValidDate = startTime && !isNaN(Date.parse(startTime));
                    
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                                {nextEvent?.title ?? 'Untitled Event'}
                            </span>
                            <span style={{ fontSize: '11px', opacity: 0.6, flexShrink: 0 }}>
                                {nextEvent?.isAllDay 
                                    ? 'All day' 
                                    : isValidDate 
                                        ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : 'Time unknown'
                                }
                            </span>
                        </div>
                    );
                })() : (
                    <div style={{ fontSize: '13px', opacity: 0.4 }}>No upcoming events</div>
                )}
            </div>
        </div>
    );
}

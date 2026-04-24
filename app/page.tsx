"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
    Globe, Cloud, Film, Wifi, ArrowRight,
    CloudRain, ArrowUpCircle, X, Plus, Save, Box, 
    Shield, Image as ImageIcon, PlaySquare, Video, 
    Loader2, Home, Activity,
    Server, LayoutGrid, Zap, Clock, Trash, Settings2,
    Palette, Layers, ArrowRightLeft, Sun, GripVertical
} from 'lucide-react';
import { sanitizeUrl } from '../lib/url';
import { DashboardRow, DashboardSection, AppSettings, Bookmark, DashboardLayoutItem } from '../lib/types';

import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
const ResponsiveGridLayout = WidthProvider(Responsive);
import 'react-grid-layout/css/styles.css';

import { useWeather } from './hooks/useWeather';
import { DashboardIcon } from './components/DashboardIcon';
import { MD3Toast, ToastType } from './components/MD3Toast';
import { useMobile } from './hooks/useMobile';

// --- Constants & Grid Configuration ---

const WIDGET_SIZE_DEFAULTS: Record<string, string> = {
    'weather': 'large',
    'loopia': 'wide',
    'cloudflare': 'wide',
    'unifi': 'wide',
    'homeassistant': 'large',
    'radarr': 'wide',
    'sonarr': 'wide',
    'plex': 'large',
    'proxmox': 'wide',
    'npm': 'wide',
    'workspace': 'large',
    'media': 'large',
    'example-hello': 'small'
};

const WIDGET_DIMENSIONS: Record<string, { w: number, h: number }> = {
    compact: { w: 2, h: 1 },
    small:   { w: 3, h: 2 },
    wide:    { w: 6, h: 2 },
    tall:    { w: 3, h: 4 },
    large:   { w: 6, h: 4 },
    full:    { w: 12, h: 2 }
};

const V_THEMES = ['default', 'accent', 'tonal', 'glass'];
const V_OPACITIES = [1, 0.75, 0.4, 0.15];
const V_THEME_LABELS: Record<string, { label: string, desc: string }> = { 
    default: { label: 'Surface', desc: 'Neutral' }, 
    accent: { label: 'Accent', desc: 'Bold' }, 
    tonal: { label: 'Tonal', desc: 'Subtle' }, 
    glass: { label: 'Glass', desc: 'Transparent' } 
};


// --- Premium Widget Components ---

import { MODULE_WIDGETS } from '@/lib/registry';

const WIDGETS_DEF: Record<string, { name: string, icon: React.ElementType, color: string, render: (settings: AppSettings | null) => React.ReactNode }> = {
    'weather':       { name: 'Weather / Clock',      icon: CloudRain, color: '#a8c7fa', render: (settings) => { const W = MODULE_WIDGETS['weather']; return W ? <W settings={settings?.weather} /> : null; } },
    'loopia':        { name: 'Loopia',               icon: Globe,    color: '#3b82f6', render: () => { const W = MODULE_WIDGETS['loopia']; return W ? <W /> : null; } },
    'cloudflare':    { name: 'Cloudflare',           icon: Cloud,    color: '#f38020', render: () => { const W = MODULE_WIDGETS['cloudflare']; return W ? <W /> : null; } },
    'unifi':         { name: 'UniFi Network',        icon: Wifi,     color: '#0559C9', render: () => { const W = MODULE_WIDGETS['unifi']; return W ? <W /> : null; } },
    'proxmox':       { name: 'Proxmox',              icon: Server,   color: '#e57000', render: () => { const W = MODULE_WIDGETS['proxmox']; return W ? <W /> : null; } },
    'npm':           { name: 'Nginx Proxy Manager',  icon: Shield,   color: '#34d399', render: () => { const W = MODULE_WIDGETS['npm']; return W ? <W /> : null; } },
    'workspace':     { name: 'Google Workspace',     icon: Globe,    color: '#4285f4', render: () => { const W = MODULE_WIDGETS['workspace']; return W ? <W /> : null; } },
    
    // Media & Automation
    'plex':          { name: 'Plex',                 icon: PlaySquare, color: '#eab308', render: () => { const W = MODULE_WIDGETS['plex']; return W ? <W /> : null; } },
    'sonarr':        { name: 'Sonarr (TV)',          icon: Video,    color: '#3c9bdc', render: () => { const W = MODULE_WIDGETS['sonarr']; return W ? <W /> : null; } },
    'radarr':        { name: 'Radarr (Movies)',      icon: Film,     color: '#ffc107', render: () => { const W = MODULE_WIDGETS['radarr']; return W ? <W /> : null; } },
    
    // Placeholder / Built-in
    'homeassistant': { name: 'Home Assistant',       icon: Home,     color: '#03a9f4', render: () => { const W = MODULE_WIDGETS['homeassistant']; return W ? <W /> : null; } },
    'uptimekuma':    { name: 'Uptime Kuma',          icon: Activity, color: '#6ad3cb', render: () => { const W = MODULE_WIDGETS['uptimekuma']; return W ? <W /> : null; } },
    'media':         { name: 'Media Library',        icon: ImageIcon, color: '#eab308', render: () => { const W = MODULE_WIDGETS['plex']; return W ? <W /> : null; } },
    'example-hello': { name: 'Hello World',          icon: Zap,      color: '#9333ea', render: () => { const W = MODULE_WIDGETS['example-hello']; return W ? <W /> : null; } },
};

// --- Main Dashboard Component ---

export default function DashboardHub() {
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [rows, setRows] = useState<DashboardRow[]>([]);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Add Module UI Helper
    const hexToRgb = (hex: string) => {
        if (!hex) return '0, 0, 0';
        const cleaned = hex.replace('#', '');
        if (!/^[0-9A-Fa-f]{3,6}$/.test(cleaned)) return '0, 0, 0';
        let r, g, b;
        if (cleaned.length === 3) {
            r = parseInt(cleaned[0] + cleaned[0], 16);
            g = parseInt(cleaned[1] + cleaned[1], 16);
            b = parseInt(cleaned[2] + cleaned[2], 16);
        } else {
            r = parseInt(cleaned.substring(0, 2), 16);
            g = parseInt(cleaned.substring(2, 4), 16);
            b = parseInt(cleaned.substring(4, 6), 16);
        }
        return `${isNaN(r) ? 0 : r}, ${isNaN(g) ? 0 : g}, ${isNaN(b) ? 0 : b}`;
    };


    const [widgetSizes, setWidgetSizes] = useState<Record<string, string>>({});
    const [widgetVisuals, setWidgetVisuals] = useState<Record<string, { theme: string, opacity: number, customColor?: string | null }>>({});
    const [rowsBackup, setRowsBackup] = useState<DashboardRow[] | null>(null);
    const [sizesBackup, setSizesBackup] = useState<Record<string, string> | null>(null);
    const [visualsBackup, setVisualsBackup] = useState<Record<string, { theme: string, opacity: number, customColor?: string | null }> | null>(null);
    const [moveTarget, setMoveTarget] = useState<{rowIdx: number, sectionIdx: number, id: string} | null>(null);
    const editModeRef = useRef(false);
    
    useEffect(() => {
        editModeRef.current = editMode;
    }, [editMode]);
    
    const [editorState, setEditorState] = useState<{
        isOpen: boolean;
        type: 'row' | 'section';
        mode: 'add' | 'edit';
        name: string;
        hideTitle: boolean;
        rowIdx?: number;
        sectionIdx?: number;
        layout?: 'stacked' | 'split';
    }>({ isOpen: false, type: 'row', mode: 'add', name: '', hideTitle: false });
    const [addingToSection, setAddingToSection] = useState<{ rowIdx: number, sectionIdx: number } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'row' | 'section', rowIdx: number, sectionIdx?: number } | null>(null);

    const [activePicker, setActivePicker] = useState<string | null>(null);
    const [theme, setTheme] = useState('dark');
    const isMobile = useMobile(1024);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
    
    const weather = useWeather(settings?.weather);

    useEffect(() => {
        const fetchSettings = () => {
            fetch('/api/settings').then(r => r.json()).then(data => {
                if (data.settings) {
                    setSettings(data.settings);
                    const d = data.settings.dashboard;
                    if (d?.rows) setRows(d.rows);
                    else setRows([{ id: 'r-default', name: 'System Overview', sections: [{ id: 's-main', name: 'Network & Cluster', layout: ['weather', 'proxmox', 'unifi', 'cloudflare', 'radarr', 'workspace'] }] }]);
                    
                    if (d?.widgetSizes) setWidgetSizes(d.widgetSizes);
                    if (d?.widgetVisuals) setWidgetVisuals(d.widgetVisuals);
                    if (data.settings.bookmarks) setBookmarks(data.settings.bookmarks);
                    
                    // Sync Theme Mode
                    if (data.settings.appearance?.theme) {
                        if (data.settings.appearance.theme === 'time') {
                            const hour = new Date().getHours();
                            setTheme(hour >= 6 && hour < 18 ? 'light' : 'dark');
                        } else if (data.settings.appearance.theme === 'system') {
                            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                            setTheme(prefersDark ? 'dark' : 'light');
                        } else {
                            setTheme(data.settings.appearance.theme);
                        }
                    }
                }
            });
        };

        setMounted(true);
        fetchSettings();

        // Refresh on focus (returning from settings)
        const handleFocus = () => {
            if (!editModeRef.current) fetchSettings();
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('dashboard-settings-updated', fetchSettings);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('dashboard-settings-updated', fetchSettings);
        };
    }, []);



    const handleRemove = useCallback((rowIdx: number, sectionIdx: number, id: string) => {
        setRows(prev => prev.map((row: DashboardRow, rIdx: number) => {
            if (rIdx !== rowIdx) return row;
            return {
                ...row,
                sections: row.sections.map((sec: DashboardSection, sIdx: number) => {
                    if (sIdx !== sectionIdx) return sec;
                    return { 
                        ...sec, 
                        layout: sec.layout.filter((w: DashboardLayoutItem) => {
                            const itemId = typeof w === 'string' ? w : w.i;
                            return itemId !== id;
                        }) 
                    };
                })
            };
        }));
    }, []);

    const handlePublish = async () => {
        setSaving(true);
        setToast({ message: 'Syncing dashboard...', type: 'loading' });
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    settings: { 
                        dashboard: { 
                            rows, 
                            widgetSizes, 
                            widgetVisuals
                        }, 
                        bookmarks 
                    } 
                })
            });
            setRowsBackup(null);
            setSizesBackup(null);
            setVisualsBackup(null);
            setEditMode(false);
            setToast({ message: 'Dashboard updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Failed to publish layout:', error);
            setToast({ message: 'Failed to save layout. Please check your connection.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (rowsBackup) setRows(rowsBackup);
        if (sizesBackup) setWidgetSizes(sizesBackup);
        if (visualsBackup) setWidgetVisuals(visualsBackup);
        setRowsBackup(null);
        setSizesBackup(null);
        setVisualsBackup(null);
        setEditMode(false);
    };

    const ACCENT_PALETTE = [
        { name: 'Teal', color: '#4DB6AC' },
        { name: 'Blue', color: '#64B5F6' },
        { name: 'Indigo', color: '#7986CB' },
        { name: 'Purple', color: '#BA68C8' },
        { name: 'Pink', color: '#F06292' },
        { name: 'Red', color: '#E57373' },
        { name: 'Orange', color: '#FFB74D' },
        { name: 'Yellow', color: '#FFD54F' },
        { name: 'Green', color: '#81C784' },
        { name: 'Cyan', color: '#4DD0E1' }
    ];
    const handleMoveWidget = (fromRowIdx: number, fromSectionIdx: number, toSectionIdx: number, widgetId: string) => {
        setRows(prev => prev.map((row: DashboardRow, rIdx: number) => {
            if (rIdx !== fromRowIdx) return row;
            
            const fromSec = row.sections[fromSectionIdx];
            // const toSec = row.sections[toSectionIdx];
            
            const widget = fromSec.layout.find((w: DashboardLayoutItem) => (typeof w === 'string' ? w : (w as { i: string }).i) === widgetId);
            if (!widget) return row;

            return {
                ...row,
                sections: row.sections.map((sec: DashboardSection, sIdx: number) => {
                    if (sIdx === fromSectionIdx) {
                        return { ...sec, layout: sec.layout.filter((w: DashboardLayoutItem) => (typeof w === 'string' ? w : (w as { i: string }).i) !== widgetId) };
                    }
                    if (sIdx === toSectionIdx) {
                        return { ...sec, layout: [...sec.layout, widget] };
                    }
                    return sec;
                })
            };
        }));
        setMoveTarget(null);
    };

    const handleReorderWidget = (rowIdx: number, sectionIdx: number, widgetId: string, direction: 'up' | 'down') => {
        setRows(prev => prev.map((row: DashboardRow, rIdx: number) => {
            if (rIdx !== rowIdx) return row;
            return {
                ...row,
                sections: row.sections.map((sec: DashboardSection, sIdx: number) => {
                    if (sIdx !== sectionIdx) return sec;
                    const index = sec.layout.findIndex((w: DashboardLayoutItem) => (typeof w === 'string' ? w : (w as { i: string }).i) === widgetId);
                    if (index === -1) return sec;
                    
                    const newLayout = [...sec.layout];
                    const targetIndex = direction === 'up' ? index - 1 : index + 1;
                    
                    if (targetIndex >= 0 && targetIndex < newLayout.length) {
                        const [moved] = newLayout.splice(index, 1);
                        newLayout.splice(targetIndex, 0, moved);
                    }
                    
                    return { ...sec, layout: newLayout };
                })
            };
        }));
    };

    const handleExecuteDelete = () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === 'row') {
            setRows(prev => prev.filter((_: DashboardRow, i: number) => i !== confirmDelete.rowIdx));
        } else {
            setRows(prev => prev.map((r: DashboardRow, ri: number) => 
                ri === confirmDelete.rowIdx 
                    ? { ...r, sections: r.sections.filter((_: DashboardSection, si: number) => si !== confirmDelete.sectionIdx) } 
                    : r
            ));
        }
        setConfirmDelete(null);
    };

    // --- Grid Interaction Handlers ---


    const handleLayoutChange = useCallback((layout: readonly DashboardLayoutItem[], rowIdx: number, sectionIdx: number) => {
        if (!editMode) return;
        
        setRows(prev => prev.map((row: DashboardRow, rIdx: number) => {
            if (rIdx !== rowIdx) return row;
            return {
                ...row,
                sections: row.sections.map((sec: DashboardSection, sIdx: number) => {
                    if (sIdx !== sectionIdx) return sec;
                    // STORE FULL LAYOUT OBJECTS for persistence and zero shifts
                    return { ...sec, layout: layout as DashboardLayoutItem[] };
                })
            };
        }));
    }, [editMode]);


    const handleResizeStop = useCallback((layout: readonly DashboardLayoutItem[], oldItem: DashboardLayoutItem, newItem: DashboardLayoutItem) => {
        if (!editMode) return;
        setWidgetSizes(prev => ({
            ...prev,
            [newItem.i]: `custom-${newItem.w}-${newItem.h}`
        }));
    }, [editMode]);

    if (!mounted) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--md-sys-color-surface)' }}><Loader2 className="animate-spin" /></div>;

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';


    const appearance = settings?.appearance || {} as AppSettings['appearance'];
    const dashboardBgStyle: React.CSSProperties = appearance.bgType === 'image' && appearance.backgroundImage 
        ? { backgroundImage: `url(${appearance.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundColor: 'transparent' }
        : { backgroundColor: (appearance.backgroundColor && appearance.backgroundColor !== 'transparent' && appearance.backgroundColor !== '#111318' && appearance.backgroundColor !== '#1a1c22' && appearance.backgroundColor !== '#0f1117') ? appearance.backgroundColor : undefined, backgroundImage: 'none' };

    return (
        <main 
            className="app-layout"
            style={{ 
                maxWidth: '100%',
                minHeight: '100vh',
                ...dashboardBgStyle,
                '--md-sys-color-primary': appearance.accentColor || '#3b82f6',
                '--md-sys-color-primary-container': `${appearance.accentColor || '#3b82f6'}33`,
            } as React.CSSProperties}
        >
        <div className="page-container" style={{ 
                padding: isMobile ? (editMode ? '100px 16px 200px 16px' : '24px 16px 80px 16px') : '64px 48px',
                minHeight: '100vh',
                position: 'relative',
                transition: 'none',
                width: '100%',
                maxWidth: '1600px',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>
            
            <header style={{ 
                marginBottom: isMobile ? '40px' : '84px',
                position: isMobile && editMode ? 'fixed' : 'relative',
                top: isMobile && editMode ? 0 : 'auto',
                left: isMobile && editMode ? 0 : 'auto',
                right: isMobile && editMode ? 0 : 'auto',
                zIndex: isMobile && editMode ? 1000 : 'auto',
                background: isMobile && editMode ? 'rgba(var(--md-sys-color-surface-rgb), 0.8)' : 'transparent',
                backdropFilter: isMobile && editMode ? 'blur(20px)' : 'none',
                padding: isMobile && editMode ? '16px' : 0,
                boxShadow: isMobile && editMode ? 'var(--md-sys-elevation-1)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? '12px' : '40px' }}>
                    <div style={{ flex: isMobile ? '1 1 100%' : '1 1 500px', display: isMobile && editMode ? 'none' : 'block' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '8px' : '16px', opacity: 0.6 }}>
                            <Box size={14} color="var(--md-sys-color-primary)" />
                            <span style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Unified Control Center</span>
                        </div>
                        <h1 className="premium-header-title" style={{ fontSize: isMobile ? 'clamp(28px, 8vw, 36px)' : 'clamp(32px, 6vw, 56px)', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.1 }}>
                            {greeting}, <span style={{ color: 'var(--md-sys-color-primary-variant)', backgroundImage: 'linear-gradient(to bottom right, var(--md-sys-color-primary), var(--md-sys-color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{appearance.userName || 'Horizon'}</span>
                        </h1>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: isMobile ? '8px' : '24px', 
                        width: isMobile ? '100%' : 'auto', 
                        marginTop: isMobile ? '16px' : '0', 
                        justifyContent: isMobile ? 'flex-start' : 'flex-end',
                        flex: isMobile ? 'none' : 1 
                    }}>
                        {(!isMobile || (isMobile && !editMode)) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px', padding: isMobile ? '12px 16px' : '16px 32px', backgroundColor: 'var(--md-sys-color-surface-container-high)', borderRadius: 'var(--md-sys-shape-corner-extra-large)', border: '1px solid var(--md-sys-color-outline-variant)', boxShadow: 'var(--md-sys-elevation-1)', width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
                                <button 
                                    onClick={() => {
                                        const loc = settings?.weather?.location;
                                        if (loc) {
                                            // snyk-ignore: javascript/OpenRedirect
                                            window.open(sanitizeUrl(loc), '_blank');
                                        }
                                    }}
                                    className="m3-press-effect"
                                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.6, letterSpacing: '0.05em' }}>
                                            {(!settings?.weather?.location || settings?.weather?.location.toUpperCase() === 'ABOUT:BLANK') ? 'Stockholm' : settings.weather.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={isMobile ? 18 : 20} color="var(--md-sys-color-primary)" opacity={0.8} />
                                            <span style={{ fontWeight: 800, fontSize: isMobile ? '18px' : '22px', letterSpacing: '-0.02em', color: 'var(--md-sys-color-on-surface)' }}>
                                                {weather.time.getHours().toString().padStart(2, '0')}:{weather.time.getMinutes().toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                {weather.temp !== null && (
                                    <>
                                        <div style={{ height: '24px', width: '1px', background: 'var(--md-sys-color-outline-variant)', opacity: 0.3 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.6, letterSpacing: '0.05em' }}>{weather.description}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {(() => {
                                                    const desc = (weather.description || '').toLowerCase();
                                                    if (desc.includes('clear')) return <Sun size={20} color="var(--md-color-weather-sun)" opacity={0.9} />;
                                                    if (desc.includes('rain') || desc.includes('drizzle')) return <CloudRain size={20} color="var(--md-color-weather-rain)" opacity={0.9} />;
                                                    if (desc.includes('cloud')) return <Cloud size={20} color="var(--md-sys-color-primary)" opacity={0.8} />;
                                                    return <Cloud size={20} color="var(--md-sys-color-primary)" opacity={0.8} />;
                                                })()}
                                                <span style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em', color: 'var(--md-sys-color-on-surface)' }}>{weather.temp}°</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {!editMode ? (
                            <button
                                onClick={() => {
                                    setRowsBackup(structuredClone(rows));
                                    setSizesBackup(structuredClone(widgetSizes));
                                    setVisualsBackup(structuredClone(widgetVisuals));
                                    setEditMode(true);
                                }}
                                className="m3-press-effect"
                                style={{
                                    width: isMobile ? '56px' : '64px',
                                    height: isMobile ? '56px' : '64px',
                                    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                    backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                    color: 'var(--md-sys-color-on-surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                    boxShadow: 'var(--md-sys-elevation-1)',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                                aria-label="Customize Layout"
                            >
                                <LayoutGrid size={isMobile ? 24 : 28} />
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                                <button
                                    onClick={() => setEditorState({ isOpen: true, type: 'row', mode: 'add', name: '', hideTitle: false })}
                                    className="md3-button-tonal"
                                    style={{ flex: isMobile ? 1 : 'none', padding: isMobile ? '12px 16px' : '16px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    <Plus size={isMobile ? 18 : 20} /> Row
                                </button>
                                <button
                                    onClick={handlePublish}
                                    className="md3-button-filled"
                                    style={{ flex: isMobile ? 1 : 'none', padding: isMobile ? '12px 16px' : '16px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    <Save size={isMobile ? 18 : 20} /> {saving ? '...' : 'Publish'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="md3-button-outlined"
                                    style={{ flex: isMobile ? '1 1 100%' : 'none', padding: isMobile ? '12px 16px' : '16px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Premium Rows & Sections - Multi-Grid Restoration */}
            <div className="ha-rows-container" style={{ paddingBottom: isMobile ? '120px' : '48px' }}>
                {rows.map((row: DashboardRow, rIdx: number) => (
                    <div key={row.id} style={{ marginBottom: '84px', width: '100%' }}>
                        {/* GLOBAL ROW HEADER */}
                        <div className="global-row-header" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            gap: '24px', 
                            marginBottom: row.hideTitle && !editMode ? '0px' : '40px',
                            paddingBottom: !row.hideTitle ? '20px' : '0px',
                            borderBottom: !row.hideTitle ? '1px solid var(--md-sys-color-outline-variant)' : 'none',
                            opacity: 0.9,
                            minHeight: editMode ? '40px' : 'auto'
                        }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.1 }}>
                                {!row.hideTitle ? row.name : ''}
                            </h2>

                            {editMode && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => setEditorState({ isOpen: true, type: 'row', mode: 'edit', rowIdx: rIdx, name: row.name, hideTitle: !!row.hideTitle, layout: row.layout || 'stacked' })}
                                        className="m3-button-icon no-drag"
                                        style={{ width: '40px', height: '40px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', border: 'none', cursor: 'pointer' }}
                                        aria-label="Edit Row Settings"
                                        title="Edit Row Settings"
                                    >
                                        <Layers size={18} />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => setEditorState({ isOpen: true, type: 'section', mode: 'add', rowIdx: rIdx, name: '', hideTitle: false })}
                                        className="m3-button-icon no-drag"
                                        style={{ width: '40px', height: '40px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-on-tertiary-container)', border: 'none', cursor: 'pointer' }}
                                        aria-label="Add New Section to Row"
                                        title="Add New Section to Row"
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => setConfirmDelete({ type: 'row', rowIdx: rIdx })}
                                        className="m3-button-icon no-drag"
                                        style={{ width: '40px', height: '40px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-error-container)', color: 'var(--md-sys-color-on-error-container)', border: 'none', cursor: 'pointer' }}
                                        aria-label="Delete Entire Row"
                                        title="Delete Entire Row"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* SECTIONS CONTAINER */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: row.layout === 'split' && !isMobile ? 'row' : 'column', 
                            gap: '40px', 
                            alignItems: 'stretch', 
                            flexWrap: 'wrap',
                            width: '100%'
                        }}>
                        {row.sections.map((section: DashboardSection, sIdx: number) => (
                                <div key={section.id} style={{ 
                                    marginBottom: '48px',
                                    flex: row.layout === 'split' && !isMobile ? `1 1 0px` : 'none',
                                    width: row.layout === 'split' && !isMobile ? `calc(${100/row.sections.length}% - ${(32*(row.sections.length-1))/row.sections.length}px)` : '100%',
                                    minWidth: row.layout === 'split' && !isMobile ? (isMobile ? '100%' : '400px') : '100%'
                                }}>
                                    {/* Section Header */}
                                    <div className="grid-section-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--md-sys-color-primary)', opacity: 0.8 }}>
                                            {!section.hideTitle ? section.name : ''}
                                        </h3>

                                        <div style={{ flex: 1, height: '1px', background: 'var(--md-sys-color-outline-variant)', opacity: 0.1 }} />
                                        
                                        {editMode && (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {/* UNIFIED SECTION CONTROLS */}
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={() => setEditorState({ isOpen: true, type: 'section', mode: 'edit', rowIdx: rIdx, sectionIdx: sIdx, name: section.name, hideTitle: !!section.hideTitle })}
                                                    className="m3-button-icon no-drag"
                                                    style={{ width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', border: 'none', cursor: 'pointer' }}
                                                    title="Section Settings"
                                                >
                                                    <Settings2 size={14} />
                                                </button>
                                                
                                                {row.sections.length > 1 && (
                                                    <button
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onClick={() => setConfirmDelete({ type: 'section', rowIdx: rIdx, sectionIdx: sIdx })}
                                                        className="m3-button-icon no-drag"
                                                        style={{ width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-error-container)', color: 'var(--md-sys-color-on-error-container)', border: 'none', cursor: 'pointer', opacity: 0.7 }}
                                                        title="Remove Section"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                )}
                                                
                                                {/* ADD WIDGET TRIGGER - Restored Visibility */}
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={() => setAddingToSection({ rowIdx: rIdx, sectionIdx: sIdx })}
                                                    className="md3-button-tonal no-drag"
                                                    style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                                                >
                                                    <Plus size={16} /> Add Module
                                                </button>
                                            </div>
                                        )}

                                    </div>

                                    <div 
                                        className={editMode ? 'blueprint-active' : ''} 
                                        style={{ 
                                            position: 'relative', 
                                            borderRadius: 'var(--md-sys-shape-corner-extra-large)', 
                                            padding: '24px', 
                                            minHeight: '120px',
                                            width: '100%'
                                        }}
                                    >
                                        <ResponsiveGridLayout
                                            className="layout"
                                            layouts={{ lg: section.layout as any, md: section.layout as any, sm: section.layout as any }}
                                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                                            rowHeight={120}
                                            draggableHandle=".drag-handle"
                                            isDraggable={editMode}
                                            isResizable={editMode}
                                            margin={[isMobile ? 16 : 24, isMobile ? 16 : 24]}
                                            containerPadding={[0, 0]}
                                            draggableCancel=".no-drag"
                                            onLayoutChange={(l) => handleLayoutChange(l, rIdx, sIdx)}
                                            onResizeStop={handleResizeStop}
                                        >
                                            {section.layout.map((item: DashboardLayoutItem) => {
                                                const id = typeof item === 'string' ? item : (item as { i: string }).i;
                                                const isBookmark = id.startsWith('bookmark-');

                                                const bookmark = isBookmark ? bookmarks.find(b => b.id === id.replace('bookmark-', '')) : null;
                                                const wDef = isBookmark && bookmark ? { name: bookmark.name, icon: Globe, color: 'var(--md-sys-color-primary)', render: () => (
                                                    <div 
                                                        onClick={() => {
                                                            // snyk-ignore: javascript/OpenRedirect
                                                            if (!editMode) window.open(sanitizeUrl(bookmark.url), '_blank');
                                                        }}
                                                        style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }}
                                                    >
                                                        <div style={{ backgroundColor: (bookmark.color || 'var(--md-sys-color-primary)') + '20', color: bookmark.color || 'var(--md-sys-color-primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                                            <DashboardIcon icon={bookmark.icon} size={24} />
                                                        </div>
                                                        <div style={{ fontWeight: 800, fontSize: '18px' }}>{bookmark.name}</div>
                                                        <div style={{ fontSize: '11px', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bookmark.url}</div>
                                                    </div>
                                                )} : WIDGETS_DEF[id];

                                                if (!wDef) return <div key={id} style={{ height: '100%', background: 'var(--md-sys-color-error-container)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Widget Missing: {id}</div>;

                                                const visuals = (widgetVisuals[id] || { theme: 'default', opacity: 1 });
                                                const accentRgb = hexToRgb(appearance.accentColor || '#3b82f6');
                                                const customRgb = visuals.customColor ? hexToRgb(visuals.customColor) : null;
                                                
                                                const isLight = theme === 'light';
                                                const bgStyle = visuals.theme === 'glass' 
                                                    ? { 
                                                        background: isLight 
                                                            ? `rgba(255, 255, 255, ${visuals.opacity * 0.4})` 
                                                            : `rgba(40, 42, 49, ${visuals.opacity})`, 
                                                        backdropFilter: 'blur(20px)', 
                                                        border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)' 
                                                      }
                                                    : visuals.theme === 'accent'
                                                    ? { background: `rgba(${accentRgb}, ${visuals.opacity})`, color: '#fff' }
                                                    : visuals.theme === 'tonal'
                                                    ? { background: `rgba(${accentRgb}, ${visuals.opacity * 0.2})`, color: 'var(--md-sys-color-on-surface)' }
                                                    : visuals.customColor
                                                    ? { background: `rgba(${customRgb}, ${visuals.opacity})`, color: '#fff' }
                                                    : { background: 'var(--md-sys-color-surface-container)' };



                                                return (
                                                    <div key={id}>
                                                        <div 
                                                            className={`bento-widget ${visuals.theme === 'glass' ? 'glass-card' : ''}`}
                                                            style={{ 
                                                                width: '100%', 
                                                                height: '100%', 
                                                                ...bgStyle,
                                                                borderRadius: 'calc(var(--md-sys-shape-corner-extra-large) * 1.2)', 
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                boxShadow: editMode ? '0 8px 32px rgba(0,0,0,0.2)' : 'var(--md-sys-elevation-1)',
                                                                border: editMode ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
                                                                transition: 'all 0.4s cubic-bezier(0.3, 0, 0, 1)'
                                                            }}
                                                        >
                                                            {editMode && (
                                                                <div className="drag-handle" style={{ 
                                                                    position: 'absolute', 
                                                                    top: isMobile ? '8px' : '16px', 
                                                                    right: isMobile ? '8px' : '16px', 
                                                                    zIndex: 10, 
                                                                    cursor: 'grab',
                                                                    color: 'var(--md-sys-color-on-surface-variant)',
                                                                    opacity: 0.5
                                                                }}>
                                                                    <GripVertical size={20} />
                                                                </div>
                                                            )}
                                                            {wDef.render(settings)}
                                                            
                                                            {editMode && (
                                                                <div style={{ position: 'absolute', bottom: isMobile ? '12px' : '16px', right: isMobile ? '12px' : '16px', display: 'flex', gap: isMobile ? '8px' : '8px', zIndex: 60 }}>
                                                                    {isMobile && (
                                                                        <>
                                                                            <button 
                                                                                onClick={(e) => { e.stopPropagation(); handleReorderWidget(rIdx, sIdx, id, 'up'); }}
                                                                                className="no-drag m3-press-effect"
                                                                                style={{ background: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-primary)', border: 'none', padding: '12px', borderRadius: '14px', cursor: 'pointer' }}
                                                                                aria-label="Move widget up"
                                                                                title="Move Up"
                                                                            >
                                                                                <ArrowUpCircle size={24} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => { e.stopPropagation(); handleReorderWidget(rIdx, sIdx, id, 'down'); }}
                                                                                className="no-drag m3-press-effect"
                                                                                style={{ background: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-primary)', border: 'none', padding: '12px', borderRadius: '14px', cursor: 'pointer' }}
                                                                                aria-label="Move widget down"
                                                                                title="Move Down"
                                                                            >
                                                                                <ArrowRight size={24} style={{ transform: 'rotate(90deg)' }} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {row.sections.length > 1 && (
                                                                        <button 
                                                                            onClick={(e) => { e.stopPropagation(); setMoveTarget(moveTarget?.id === id ? null : { rowIdx: rIdx, sectionIdx: sIdx, id }); }} 
                                                                            className="no-drag m3-press-effect" 
                                                                            style={{ background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', border: 'none', padding: isMobile ? '12px' : '8px', borderRadius: isMobile ? '14px' : '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                            aria-label="Move to another section"
                                                                            title="Move to section"
                                                                        >
                                                                            <ArrowRightLeft size={isMobile ? 22 : 14} />
                                                                        </button>
                                                                    )}
                                                                    <button onClick={(e) => { e.stopPropagation(); setActivePicker(activePicker === id ? null : id); }} className="no-drag m3-press-effect" style={{ background: 'var(--md-sys-color-surface-container-highest)', color: 'var(--md-sys-color-on-surface)', border: 'none', padding: isMobile ? '12px' : '8px', borderRadius: isMobile ? '14px' : '8px', cursor: 'pointer' }} aria-label="Widget visual settings" title="Visual Settings">
                                                                        <Palette size={isMobile ? 22 : 14} />
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleRemove(rIdx, sIdx, id); }} className="no-drag m3-press-effect" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none', padding: isMobile ? '12px' : '8px', borderRadius: isMobile ? '14px' : '8px', cursor: 'pointer' }} aria-label="Remove Widget" title="Remove Widget">
                                                                        <Trash size={isMobile ? 22 : 14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Migration Menu */}
                                                        {moveTarget?.id === id && (
                                                            <div className="no-drag" style={{ position: 'absolute', bottom: '64px', right: '16px', width: '200px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '24px', padding: '16px', boxShadow: 'var(--md-sys-elevation-5)', zIndex: 110, border: '1px solid var(--md-sys-color-outline-variant)', animation: 'fadeInScale 0.2s cubic-bezier(0.2, 0.0, 0, 1.0)' }}>
                                                                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Move Module to...</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    {row.sections.map((targetSec: DashboardSection, tsIdx: number) => {
                                                                        if (tsIdx === sIdx) return null;
                                                                        return (
                                                                            <button 
                                                                                key={targetSec.id} 
                                                                                onClick={() => handleMoveWidget(rIdx, sIdx, tsIdx, id)}
                                                                                className="m3-press-effect"
                                                                                style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--md-sys-color-on-surface)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                                            >
                                                                                <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--md-sys-color-secondary)' }} />
                                                                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{targetSec.name || `Section ${tsIdx + 1}`}</span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {activePicker === id && (
                                                            <div className="no-drag" style={{ position: 'absolute', bottom: '70px', right: '16px', width: '240px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--md-sys-elevation-5)', zIndex: 100, border: '1px solid var(--md-sys-color-outline-variant)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                                    <div style={{ fontWeight: 800 }}>Widget Visuals</div>
                                                                    <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActivePicker(null)} />
                                                                </div>
                                                                
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                                                    {V_THEMES.map(t => (
                                                                        <button 
                                                                            key={t} 
                                                                            onClick={() => setWidgetVisuals(p => ({ ...p, [id]: { ...visuals, theme: t, customColor: null } }))} 
                                                                            style={{ 
                                                                                padding: '12px 8px', 
                                                                                borderRadius: '16px', 
                                                                                border: '1px solid var(--md-sys-color-outline-variant)', 
                                                                                background: visuals.theme === t && !visuals.customColor ? 'var(--md-sys-color-primary)' : 'transparent', 
                                                                                color: visuals.theme === t && !visuals.customColor ? 'var(--md-sys-color-on-primary)' : 'inherit', 
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center',
                                                                                gap: '2px'
                                                                            }}
                                                                        >
                                                                            <span style={{ fontSize: '13px', fontWeight: 800 }}>{V_THEME_LABELS[t].label}</span>
                                                                            <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 500 }}>{V_THEME_LABELS[t].desc}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>


                                                                <div style={{ marginBottom: '16px' }}>
                                                                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Custom Color</div>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                                                        {ACCENT_PALETTE.map(c => (
                                                                            <button 
                                                                                key={c.color} 
                                                                                onClick={() => setWidgetVisuals(p => ({ ...p, [id]: { ...visuals, customColor: c.color } }))}
                                                                                style={{ width: '28px', height: '28px', borderRadius: '14px', background: c.color, border: visuals.customColor === c.color ? '2px solid #fff' : 'none', cursor: 'pointer' }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <input 
                                                                        type="text"
                                                                        value={visuals.customColor || '#'}
                                                                        onChange={(e) => setWidgetVisuals(p => ({ ...p, [id]: { ...visuals, customColor: e.target.value } }))}
                                                                        style={{ width: '100%', padding: '10px', background: 'var(--md-sys-color-surface-container-highest)', border: '1px solid var(--md-sys-color-outline)', borderRadius: '8px', color: 'var(--md-sys-color-on-surface)', fontSize: '12px' }}
                                                                        placeholder="#hex color"
                                                                    />
                                                                </div>
                                                                
                                                                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Opacity / Transparency</div>
                                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                                    {V_OPACITIES.map(o => (
                                                                        <button key={o} onClick={() => setWidgetVisuals(p => ({ ...p, [id]: { ...visuals, opacity: o } }))} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: visuals.opacity === o ? 'var(--md-sys-color-secondary-container)' : 'transparent', border: '1px solid var(--md-sys-color-outline-variant)', fontSize: '10px', fontWeight: 800 }}>{Math.round(o*100)}%</button>
                                                                    ))}
                                                                </div>

                                                            </div>
                                                        )}

                                                    </div>
                                                );
                                            })}
                                        </ResponsiveGridLayout>
                                </div>
                                </div>
                            ))}
                        </div>
                        </div>
                ))}
            </div>
        </div>

        {/* MD3 Editor Dialog (Row/Section) */}
            {editorState.isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--md-sys-color-scrim-rgb), 0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setEditorState({ ...editorState, isOpen: false })} />
                    <div style={{ 
                        position: 'relative', 
                        width: isMobile ? 'calc(100% - 32px)' : '560px', 
                        maxWidth: '560px',
                        background: 'var(--md-sys-color-surface-container-high)', 
                        borderRadius: '28px', 
                        padding: isMobile ? '20px' : '24px', 
                        boxShadow: 'var(--md-sys-elevation-3)', 
                        border: '1px solid var(--md-sys-color-outline-variant)' 
                    }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 400, margin: 0, color: 'var(--md-sys-color-on-surface)' }}>
                                {editorState.mode === 'add' ? 'Add Section' : (editorState.type === 'row' ? 'Edit Row' : 'Edit Section')}
                            </h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--md-sys-color-primary)', marginBottom: '8px', marginLeft: '4px' }}>Name</div>
                                <input
                                    type="text"
                                    value={editorState.name || ''}
                                    onChange={(e) => setEditorState({ ...editorState, name: e.target.value })}
                                    style={{ width: '100%', padding: '16px', background: 'var(--md-sys-color-surface-container-highest)', border: '1px solid var(--md-sys-color-outline)', borderRadius: '12px', color: 'var(--md-sys-color-on-surface)', fontSize: '16px' }}
                                    placeholder="Enter title..."
                                />
                            </div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={editorState.hideTitle || false}
                                    onChange={(e) => setEditorState({ ...editorState, hideTitle: e.target.checked })}
                                    style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                                />
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>Hide title on dashboard</span>
                            </label>

                            {editorState.type === 'row' && (
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--md-sys-color-primary)', marginBottom: '12px', marginLeft: '4px' }}>Row Layout</div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {[
                                            { id: 'stacked', label: 'Stacked', desc: 'Sections under each other' },
                                            { id: 'split', label: 'Split', desc: 'Sections side-by-side' }
                                        ].map(l => (
                                            <button
                                                key={l.id}
                                                onClick={() => setEditorState({ ...editorState, layout: l.id as 'stacked' | 'split' })}
                                                style={{
                                                    flex: 1,
                                                    padding: '16px',
                                                    borderRadius: '16px',
                                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                                    background: editorState.layout === l.id ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                                    color: editorState.layout === l.id ? 'var(--md-sys-color-on-primary-container)' : 'inherit',
                                                    textAlign: 'left',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ fontWeight: 800, fontSize: '14px' }}>{l.label}</div>
                                                <div style={{ fontSize: '11px', opacity: 0.6 }}>{l.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <button
                                    onClick={() => setEditorState({ ...editorState, isOpen: false })}
                                    className="md3-button-text"
                                    style={{ padding: '10px 24px', fontWeight: 500, color: 'var(--md-sys-color-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const nr = [...rows];
                                        if (editorState.type === 'row') {
                                            if (editorState.mode === 'add') {
                                                const rowId = `row-${Date.now()}`;
                                                nr.push({ 
                                                    id: rowId, 
                                                    name: editorState.name, 
                                                    hideTitle: editorState.hideTitle, 
                                                    layout: editorState.layout || 'stacked', 
                                                    sections: [
                                                        { id: `sec-${Date.now()}`, name: editorState.name, hideTitle: true, layout: [] }
                                                    ] 
                                                });
                                            } else if (editorState.rowIdx !== undefined) {
                                                nr[editorState.rowIdx].name = editorState.name;
                                                nr[editorState.rowIdx].hideTitle = editorState.hideTitle;
                                                nr[editorState.rowIdx].layout = editorState.layout || 'stacked';
                                            }
                                        } else {
                                            if (editorState.rowIdx !== undefined) {
                                                if (editorState.mode === 'add') {
                                                    nr[editorState.rowIdx].sections.push({ id: `sec-${Date.now()}`, name: editorState.name, hideTitle: editorState.hideTitle, layout: [] });
                                                } else if (editorState.sectionIdx !== undefined) {
                                                    nr[editorState.rowIdx].sections[editorState.sectionIdx].name = editorState.name;
                                                    nr[editorState.rowIdx].sections[editorState.sectionIdx].hideTitle = editorState.hideTitle;
                                                }
                                            }
                                        }
                                        setRows(nr);
                                        setEditorState({ ...editorState, isOpen: false });
                                    }}
                                    className="md3-button-tonal"
                                    style={{ padding: '10px 24px', fontWeight: 500, borderRadius: '20px' }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MD3 Add Module Dialog (Premium Restoration) */}
            {addingToSection && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--md-sys-color-scrim-rgb), 0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setAddingToSection(null)} />
                    <div style={{ 
                        position: 'relative', 
                        width: isMobile ? 'calc(100% - 24px)' : '920px', 
                        background: 'var(--md-sys-color-surface-container-high)', 
                        borderRadius: '28px', 
                        padding: isMobile ? '24px' : '40px', 
                        boxShadow: 'var(--md-sys-elevation-3)', 
                        maxHeight: '85vh', 
                        overflowY: 'auto', 
                        border: '1px solid var(--md-sys-color-outline-variant)' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: 600, margin: 0, color: 'var(--md-sys-color-on-surface)' }}>Add Module</h3>
                            <button onClick={() => setAddingToSection(null)} className="md3-button-icon" style={{ width: '48px', height: '48px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
                        </div>

                        {/* Functional Group */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', marginLeft: '4px' }}>Functional Units</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                                {Object.keys(WIDGETS_DEF).filter(id => id !== 'example-hello').map(id => {
                                    const w = WIDGETS_DEF[id];
                                    const Icon = w.icon;
                                    return (
                                        <button 
                                            key={id} 
                                            onClick={() => {
                                                const nr = [...rows];
                                                const sec = nr[addingToSection.rowIdx].sections[addingToSection.sectionIdx];
                                                const maxY = sec.layout.reduce((max: number, item: DashboardLayoutItem) => {
                                                    const y = typeof item === 'string' ? 0 : (item.y || 0);
                                                    const h = typeof item === 'string' ? 2 : (item.h || 2);
                                                    return Math.max(max, y + h);
                                                }, 0);
                                                const sizeType = WIDGET_SIZE_DEFAULTS[id] || 'small';
                                                const dims = WIDGET_DIMENSIONS[sizeType] || WIDGET_DIMENSIONS.small;
                                                sec.layout.push({ i: id, x: 0, y: maxY, w: dims.w, h: dims.h });
                                                setRows(nr);
                                                setAddingToSection(null);
                                            }} 
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                gap: '16px',
                                                padding: '24px',
                                                background: 'var(--md-sys-color-surface-container-highest)',
                                                borderRadius: '24px',
                                                border: '1px solid var(--md-sys-color-outline-variant)',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s var(--md-sys-motion-easing-emphasized)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            className="m3-press-effect"
                                        >
                                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.04, color: w.color }}>
                                                <Icon size={110} />
                                            </div>
                                            <div style={{ background: `${w.color}20`, padding: '14px', borderRadius: '16px', color: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon size={24} />
                                            </div>
                                            <div style={{ position: 'relative', zIndex: 1 }}>
                                                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--md-sys-color-on-surface)' }}>{w.name}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.6, fontWeight: 500, marginTop: '4px' }}>Functional Module</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Shortcuts Group */}
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--md-sys-color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', marginLeft: '4px' }}>Custom Shortcuts</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                                {bookmarks.map(b => (
                                    <button 
                                        key={b.id} 
                                        onClick={() => {
                                            const nr = [...rows];
                                            const sec = nr[addingToSection.rowIdx].sections[addingToSection.sectionIdx];
                                            const mid = `bookmark-${b.id}`;
                                            const maxY = sec.layout.reduce((max: number, item: DashboardLayoutItem) => {
                                                const y = typeof item === 'string' ? 0 : (item.y || 0);
                                                const h = typeof item === 'string' ? 2 : (item.h || 2);
                                                return Math.max(max, y + h);
                                            }, 0);
                                            const dims = WIDGET_DIMENSIONS.small; // Shortcuts default to small (3x2)
                                            sec.layout.push({ i: mid, x: 0, y: maxY, w: dims.w, h: dims.h });
                                            setRows(nr);
                                            setAddingToSection(null);
                                        }} 
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            gap: '16px',
                                            padding: '24px',
                                            background: 'var(--md-sys-color-surface-container-highest)',
                                            borderRadius: '24px',
                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s var(--md-sys-motion-easing-emphasized)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        className="m3-press-effect"
                                    >
                                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.04 }}>
                                            <Globe size={110} />
                                        </div>
                                        <div style={{ background: 'var(--md-sys-color-primary-container)', padding: '14px', borderRadius: '16px', color: 'var(--md-sys-color-on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <DashboardIcon icon={b.icon || 'Globe'} size={24} />
                                        </div>
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--md-sys-color-on-surface)' }}>{b.name}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.6, fontWeight: 500, marginTop: '4px' }}>External Shortcut</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* MD3 Confirmation Dialog */}
            {confirmDelete && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--md-sys-color-scrim-rgb), 0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setConfirmDelete(null)} />
                    <div style={{ position: 'relative', width: '320px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '28px', padding: '24px', boxShadow: 'var(--md-sys-elevation-3)', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                        <div style={{ marginBottom: '16px', textAlign: 'center', color: 'var(--md-sys-color-error)' }}>
                            <Trash size={32} style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '24px', fontWeight: 400, margin: 0, color: 'var(--md-sys-color-on-surface)' }}>Delete {confirmDelete.type === 'row' ? 'Row' : 'Section'}?</h3>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: '20px', margin: '0 0 24px 0', textAlign: 'center' }}>
                            This will permanently remove this {confirmDelete.type === 'row' ? 'row and all its sections' : 'section and all its modules'}. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirmDelete(null)} className="md3-button-text" style={{ padding: '10px 16px', color: 'var(--md-sys-color-primary)', fontWeight: 500 }}>Cancel</button>
                            <button onClick={handleExecuteDelete} className="md3-button-text" style={{ padding: '10px 16px', color: 'var(--md-sys-color-error)', fontWeight: 700 }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <MD3Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Mobile Save FAB */}
            {editMode && isMobile && (
                <button
                    onClick={handlePublish}
                    disabled={saving}
                    className="m3-press-effect"
                    style={{
                        position: 'fixed',
                        bottom: '48px',
                        right: '24px',
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: 'var(--md-sys-color-primary)',
                        color: 'var(--md-sys-color-on-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--md-sys-elevation-4)',
                        zIndex: 1100,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease'
                    }}
                >
                    {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={28} />}
                </button>
            )}
        </main>
    );
}

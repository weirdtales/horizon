'use client';

import React, { useEffect, useState, Fragment } from 'react';
import {
    Save,
    Globe,
    Trash,
    Activity,
    RefreshCw,
    RefreshCcw,
    Link as LinkIcon,
    Eye,
    EyeOff,
    Download,
    Upload,
    Database,
    Server,
    PlaySquare,
    Pencil,
    ChevronUp,
    ChevronDown,
    Plus,
    ExternalLink,
    Palette,
    Monitor,
    Sun,
    Moon,
    Clock,
    ArrowLeft,
    Search,
    Mic,
    Check,
    Layers,
    Info,
    ChevronRight,
    Zap,
    Loader2,
    Settings as SettingsIcon,
} from 'lucide-react';

import {
    NavItem,
    AppSettings,
    ModuleManifest,
    Bookmark,
    DashboardRow,
    DashboardSection,
    DashboardLayoutItem,
} from '@/lib/types';
import { BackButton } from '../components/BackButton';
import { DashboardIcon, COMMON_ICONS } from '../components/DashboardIcon';
import { MD3Toast, ToastType } from '../components/MD3Toast';
import changelogData from '@/lib/changelog.json';
import { MODULE_MANIFESTS } from '@/lib/registry';
import { ModuleSettingsDialog } from '../components/ModuleSettingsDialog';

// Mapping of IDs to categories for consistent grouping
const MODULE_CATEGORIES: Record<string, string> = {
    weather: 'Personalization',
    loopia: 'Infrastructure & DNS',
    cloudflare: 'Infrastructure & DNS',
    npm: 'Infrastructure & DNS',
    unifi: 'Network & Security',
    adguard: 'Network & Security',
    pihole: 'Network & Security',
    proxmox: 'Virtualization & Hosting',
    dockge: 'Virtualization & Hosting',
    immich: 'Media & Photos',
    uptimekuma: 'Monitoring & Health',
    glances: 'Monitoring & Health',
    homeassistant: 'Home Automation',
    scrypted: 'Home Automation',
    plex: 'Media & Photos',
    sonarr: 'Media & Photos',
    radarr: 'Media & Photos',
};

const SETTINGS_MAP = (MODULE_MANIFESTS as ModuleManifest[])
    .filter(m => !m.hidden)
    .map(m => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        category: MODULE_CATEGORIES[m.id] || 'Modular Plugins',
        color: m.color,
        bg: `${m.color}15`,
        fields: m.configFields || [],
        hasView: m.hasView,
    }));

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [initialSettings, setInitialSettings] = useState<AppSettings | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [editingIconId, setEditingIconId] = useState<string | null>(null);
    const [iconSearch, setIconSearch] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItem, setNewItem] = useState<Partial<NavItem>>({
        label: '',
        path: '',
        icon: 'LinkIcon',
        visible: true,
        isIframe: false,
    });
    const [editingPlugin, setEditingPlugin] = useState<ModuleManifest | null>(null);

    // Bookmark State
    const [isAddingBookmark, setIsAddingBookmark] = useState(false);
    const [newBookmark, setNewBookmark] = useState({ name: '', url: '', icon: 'Globe', color: '#64B5F6' });
    const [isMobile, setIsMobile] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handlePluginUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setToast({ message: 'Installing modular extension...', type: 'loading' });

        const formData = new FormData();
        formData.append('plugin', file);

        try {
            const res = await fetch('/api/modules/upload', {
                method: 'POST',
                body: formData,
            });
            let data: { message?: string; error?: string } = {};
            try {
                data = await res.json();
            } catch {
                console.error('[Upload Parse Error]');
            }

            if (res.ok) {
                setToast({ message: data.message || 'Extension installed successfully.', type: 'success' });
                // We need to reload to pick up the new registry
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setToast({ message: data.error || `Upload failed (Status: ${res.status})`, type: 'error' });
            }
        } catch {
            setToast({ message: 'Network error during plugin installation.', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handlePluginDelete = async (id: string) => {
        if (!confirm(`Are you sure you want to uninstall '${id}'? All plugin files will be deleted.`)) return;

        setToast({ message: 'Uninstalling plugin...', type: 'loading' });

        try {
            const res = await fetch(`/api/modules/delete/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setToast({ message: 'Plugin uninstalled successfully.', type: 'success' });
                setTimeout(() => window.location.reload(), 1000);
            } else {
                let data: { error?: string } = {};
                try {
                    data = await res.json();
                } catch {}
                setToast({
                    message: data.error || `Failed to uninstall plugin (Status: ${res.status}).`,
                    type: 'error',
                });
            }
        } catch {
            setToast({ message: 'Network error during uninstallation.', type: 'error' });
        }
    };

    const toggleModule = async (id: string, enabled: boolean) => {
        if (!settings) return;
        const next = {
            ...settings,
            modules: {
                ...(settings.modules || {}),
                [id]: {
                    ...(settings.modules?.[id] || {}),
                    enabled,
                },
            },
        };
        setSettings(next);
        const success = await handleSave(next);
        if (success) {
            setToast({ message: `${enabled ? 'Activated' : 'Deactivated'} ${id} plugin.`, type: 'success' });
        }
    };
    const [activeTab, setActiveTab] = useState('appearance');
    const [showDirectory, setShowDirectory] = useState(true);
    const [settingsSearch, setSettingsSearch] = useState('');
    const [gallerySearch, setGallerySearch] = useState('');
    const [isChangelogExpanded, setIsChangelogExpanded] = useState(false);

    // Plex SSO State
    const [plexAuth, setPlexAuth] = useState<{ id: string; code: string; expires_at: string } | null>(null);
    const [plexAuthStatus, setPlexAuthStatus] = useState<'idle' | 'linking' | 'success' | 'error' | 'discovery'>(
        'idle'
    );
    const [plexPolling, setPlexPolling] = useState(false);
    const [, setCurrentTheme] = useState('dark');
    const [discoveredServers, setDiscoveredServers] = useState<
        Array<{ id: string; name: string; url: string; machineId: string; token: string }>
    >([]);

    const handleSave = React.useCallback(
        async (explicitSettings?: AppSettings) => {
            // Defensive check: if the first argument is a React Event, ignore it
            const settingsToSave =
                explicitSettings && !(explicitSettings as unknown as { nativeEvent?: unknown }).nativeEvent
                    ? explicitSettings
                    : settings;

            if (!settingsToSave) {
                setToast({ message: 'Engine still initializing. Please wait.', type: 'error' });
                return;
            }

            setSaving(true);
            setToast({ message: 'Syncing settings...', type: 'loading' });
            try {
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ settings: settingsToSave }),
                });
                if (res.ok) {
                    setToast({ message: 'Settings saved successfully!', type: 'success' });
                    setInitialSettings(JSON.parse(JSON.stringify(settingsToSave)));

                    // Dispatch event for other components to sync instantly
                    window.dispatchEvent(new CustomEvent('dashboard-settings-updated'));
                } else {
                    throw new Error('Server returned an error');
                }
            } catch (err) {
                console.error('Save Error:', err);
                setToast({
                    message: `Failed to save: ${err instanceof Error ? err.message : 'Unknown Error'}`,
                    type: 'error',
                });
                return false;
            } finally {
                setSaving(false);
            }
            return true;
        },
        [settings]
    );

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;
        if (plexPolling && plexAuth?.id) {
            pollInterval = setInterval(async () => {
                try {
                    const headers = {
                        Accept: 'application/json',
                        'X-Plex-Product': 'Horizon Dashboard',
                        'X-Plex-Client-Identifier': 'horizon-dashboard-v1',
                        'X-Plex-Device': 'Web Dashboard',
                    };
                    const res = await fetch(`https://plex.tv/api/v2/pins/${plexAuth.id}`, { headers });
                    if (!res.ok) throw new Error(`Plex API Error: ${res.status}`);
                    const data = await res.json();

                    if (data.authToken) {
                        setPlexPolling(false);
                        setPlexAuthStatus('discovery');
                        setToast({ message: 'Searching for your Plex servers...', type: 'loading' });

                        try {
                            const discRes = await fetch(`/api/plex?token=${data.authToken}`);
                            if (!discRes.ok) throw new Error(`Discovery API Error: ${discRes.status}`);
                            const discData = await discRes.json();
                            const servers = discData.servers || [];

                            if (servers.length === 0) {
                                setToast({ message: 'No Plex servers found on this account.', type: 'error' });
                                setPlexAuthStatus('error');
                            } else if (servers.length === 1) {
                                // Auto-select the only server
                                const srv = servers[0];
                                setSettings(prev => {
                                    if (!prev) return prev;
                                    const next = {
                                        ...prev,
                                        plex: {
                                            ...prev.plex,
                                            token: data.authToken,
                                            url: srv.url,
                                            serverName: srv.name,
                                            machineId: srv.machineId,
                                            authMethod: 'plex_login' as const,
                                        },
                                    };
                                    handleSave(next);
                                    return next;
                                });
                                setPlexAuthStatus('success');
                                setToast({ message: `Linked to ${srv.name}!`, type: 'success' });
                            } else {
                                // Multi-server discovery
                                setDiscoveredServers(
                                    servers.map(
                                        (s: {
                                            id: string;
                                            name: string;
                                            url: string;
                                            machineId: string;
                                            token: string;
                                        }) => ({ ...s, token: data.authToken })
                                    )
                                );
                                setPlexAuthStatus('discovery');
                            }
                        } catch {
                            setToast({ message: 'Discovery failed. Please enter URL manually.', type: 'error' });
                            setPlexAuthStatus('error');
                        }

                        setTimeout(() => setPlexAuth(null), 3000);
                    }
                } catch {
                    console.error('Plex Poll Error');
                }
            }, 3000);
        }
        return () => clearInterval(pollInterval);
    }, [plexPolling, plexAuth?.id, handleSave]);

    const handlePlexSignIn = async () => {
        if (hasChanges) {
            if (
                !confirm(
                    'You have unsaved changes in your settings. Please save them before authenticating, or they might be lost. Continue anyway?'
                )
            ) {
                return;
            }
        }
        setPlexAuthStatus('linking');
        try {
            // Using standard PIN request without 'strong' flag to get a 4-character code
            const headers = {
                Accept: 'application/json',
                'X-Plex-Product': 'Horizon Dashboard',
                'X-Plex-Client-Identifier': 'horizon-dashboard-v1',
                'X-Plex-Device': 'Web Dashboard',
            };

            const res = await fetch('https://plex.tv/api/v2/pins', {
                method: 'POST',
                headers,
            });
            if (!res.ok) throw new Error(`Plex PIN API Error: ${res.status}`);
            const data = await res.json();

            if (data.code && data.id) {
                setPlexAuth(data);
                setPlexPolling(true);
            } else {
                throw new Error('No PIN received');
            }
        } catch {
            setToast({ message: 'Failed to start Plex Link process.', type: 'error' });
            setPlexAuthStatus('idle');
        }
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (settings?.appearance?.theme) {
            if (settings.appearance.theme === 'time') {
                const hour = new Date().getHours();
                setCurrentTheme(hour >= 6 && hour < 18 ? 'light' : 'dark');
            } else if (settings.appearance.theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setCurrentTheme(prefersDark ? 'dark' : 'light');
            } else {
                setCurrentTheme(settings.appearance.theme);
            }
        }
    }, [settings?.appearance?.theme]);

    const tabs = [
        { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme, colors, profile image' },
        { id: 'shortcuts', label: 'Features', icon: LinkIcon, desc: 'Comics, favorites, default tab' },
        { id: 'plugins', label: 'Plugins', icon: Zap, desc: 'Install & manage modular extensions' },
        { id: 'general', label: 'Sidebar Nav', icon: Monitor, desc: 'Default crate, home visibility' },
        { id: 'system', label: 'About & System', icon: Info, desc: 'Version, hardware, logs' },
    ];

    useEffect(() => {
        fetch('/api/settings')
            .then(res => {
                if (!res.ok) throw new Error(`Settings Load Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setSettings(data.settings);
                setInitialSettings(JSON.parse(JSON.stringify(data.settings)));
            })
            .catch(err => {
                console.error('Failed to load settings:', err);
                setToast({ message: 'Failed to load settings from server.', type: 'error' });
            });
    }, []);

    const handleInputChange = (section: string, field: string, value: string) => {
        setSettings(prev => {
            if (!prev) return prev;
            const sectionData = (prev as unknown as Record<string, Record<string, unknown>>)[section] || {};
            const next = {
                ...prev,
                [section]: {
                    ...sectionData,
                    [field]: value,
                },
            };

            // If user manually types a Plex token, mark method as 'token'
            if (section === 'plex' && field === 'token' && value.length > 0) {
                next.plex.authMethod = 'token';
            }

            return next;
        });
    };

    const handleAppearanceChange = (field: string, value: unknown) => {
        setSettings(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                appearance: {
                    ...(prev.appearance || { theme: 'system', accentColor: 'blue', showHeaderStats: false }),
                    [field]: value,
                },
            };
        });
    };

    const handleResetAppearance = () => {
        setSettings(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                appearance: {
                    theme: 'dark',
                    accentColor: 'var(--md-sys-color-primary)',
                    backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                    backgroundImage: '',
                    dayStart: 7,
                    nightStart: 19,
                },
            };
        });
        setToast({ message: 'Appearance reset to defaults! Click Save to confirm.', type: 'success' });
    };

    const updateNavItem = (id: string, field: 'visible' | 'isIframe', value: boolean) => {
        setSettings(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                navigation: prev.navigation.map((item: NavItem) =>
                    item.id === id ? { ...item, [field]: value } : item
                ),
            };
        });
    };

    const moveNavItem = (id: string, direction: 'up' | 'down') => {
        setSettings(prev => {
            if (!prev) return prev;
            const nav = [...prev.navigation];
            const index = nav.findIndex(i => i.id === id);
            if (index === -1) return prev;

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= nav.length) return prev;

            const [movedItem] = nav.splice(index, 1);
            nav.splice(newIndex, 0, movedItem);

            return { ...prev, navigation: nav };
        });
    };

    const saveNavItem = () => {
        if (!newItem.label || !newItem.path) {
            setToast({ message: 'Label and Path are required.', type: 'error' });
            return;
        }

        setSettings(prev => {
            if (!prev) return prev;
            const isEditing = !!newItem.id;
            let newNav;

            if (isEditing) {
                newNav = prev.navigation.map((item: NavItem) =>
                    item.id === newItem.id ? ({ ...item, ...newItem } as NavItem) : item
                );
            } else {
                const id = (newItem.label || '').toLowerCase().replace(/\s+/g, '-');
                newNav = [...prev.navigation, { ...newItem, id, isIframe: !!newItem.isIframe } as NavItem];
            }

            return { ...prev, navigation: newNav };
        });

        setIsAddingItem(false);
        setNewItem({ label: '', path: '', icon: 'LinkIcon', visible: true, isIframe: false });
        setToast({
            message: `Navigation item ${newItem.id ? 'updated' : 'added'}! Click Save to confirm.`,
            type: 'success',
        });
    };

    const startEditingNavItem = (item: NavItem) => {
        setNewItem({ ...item });
        setIsAddingItem(true);
    };

    const deleteNavItem = (id: string) => {
        if (id === 'dashboard' || id === 'settings') {
            setToast({ message: 'System items cannot be deleted, only hidden.', type: 'error' });
            return;
        }
        setSettings(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                navigation: prev.navigation.filter((item: NavItem) => item.id !== id),
            };
        });
    };

    const removeBookmark = (id: string) => {
        setSettings(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                bookmarks: (prev.bookmarks || []).filter((b: Bookmark) => b.id !== id),
                dashboard: {
                    ...prev.dashboard,
                    rows: (prev.dashboard?.rows || []).map((row: DashboardRow) => ({
                        ...row,
                        sections: (row.sections || []).map((section: DashboardSection) => ({
                            ...section,
                            layout: (section.layout || []).filter((item: DashboardLayoutItem) => {
                                const itemId = typeof item === 'string' ? item : item.i;
                                return itemId !== `bookmark-${id}`;
                            }),
                        })),
                    })),
                },
            };
        });
    };

    const handlePlexTest = async () => {
        setToast({ message: 'Testing Plex connection...', type: 'loading' });
        try {
            const apiRes = await fetch('/api/plex');
            if (!apiRes.ok) throw new Error(`Plex API Error: ${apiRes.status}`);
            const apiData = await apiRes.json();
            if (apiData.status === 'online') {
                setToast({
                    message: `Connected! Server: ${apiData.server.name} (${apiData.server.platform})`,
                    type: 'success',
                });
            } else {
                setToast({ message: `Plex Error: ${apiData.error} - ${apiData.details}`, type: 'error' });
            }
        } catch {
            setToast({ message: 'Could not reach proxy API. Ensure your URL is correct.', type: 'error' });
        }
    };

    const handleSelectServer = async (srv: { token: string; url: string; name: string; machineId: string }) => {
        if (!settings) return;
        const next = {
            ...settings,
            plex: {
                ...settings.plex,
                token: srv.token,
                url: srv.url,
                serverName: srv.name,
                machineId: srv.machineId,
                authMethod: 'plex_login' as const,
            },
        };
        setSettings(next);
        await handleSave(next);
        setPlexAuthStatus('success');
        setToast({ message: `Linked to ${srv.name}!`, type: 'success' });
        setDiscoveredServers([]);
    };

    const addBookmark = () => {
        if (!newBookmark.name || !newBookmark.url) {
            setToast({ message: 'Name and URL are required for shortcuts.', type: 'error' });
            return;
        }

        const id = `bm-${Date.now()}`;
        setSettings(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                bookmarks: [...(prev.bookmarks || []), { ...newBookmark, id }],
            };
        });

        setNewBookmark({ name: '', url: '', icon: 'Globe', color: '#64B5F6' });
        setIsAddingBookmark(false);
        setToast({ message: 'Shortcut created! Click Save to confirm.', type: 'success' });
    };

    const handleExport = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setToast({ message: 'Settings exported successfully!', type: 'success' });
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const imported = JSON.parse(e.target?.result as string);
                if (imported && typeof imported === 'object') {
                    setSettings(imported);
                    setToast({ message: 'Backup loaded! Review changes and click Save to confirm.', type: 'success' });
                } else {
                    throw new Error('Invalid format');
                }
            } catch {
                setToast({
                    message: 'Failed to read backup file. Ensure it is a valid JSON settings file.',
                    type: 'error',
                });
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            const defaults = {
                loopia: { user: '', password: '' },
                cloudflare: { token: '', accountId: '' },
                npm: { url: '', user: '', password: '' },
                unifi: { host: '', user: '', password: '', site: '' },
                adguard: { url: '', user: '', password: '' },
                pihole: { url: '', token: '' },
                uptimekuma: { url: '', user: '', password: '' },
                glances: { url: '' },
                proxmox: { host: '', tokenId: '', tokenSecret: '' },
                dockge: { url: '', user: '', password: '' },
                plex: { url: '', token: '' },
                immich: { url: '', apiKey: '' },
                radarr: { url: '', apiKey: '' },
                sonarr: { url: '', apiKey: '' },
                scrypted: { url: '', user: '', password: '' },
                homeassistant: { url: '', token: '' },
                bookmarks: [],
                dashboard: {
                    rows: [
                        {
                            id: 'row-main',
                            name: 'Home Hub',
                            sections: [
                                {
                                    id: 'sec-main',
                                    name: 'Network & Systems',
                                    layout: ['weather', 'loopia', 'unifi', 'media', 'proxmox', 'workspace'],
                                },
                            ],
                        },
                    ],
                    widgetSizes: {},
                },
                navigation: [
                    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/', visible: true },
                    { id: 'loopia', label: 'Loopia DNS', icon: 'Globe', path: '/loopia', visible: true },
                    { id: 'cloudflare', label: 'Cloudflare', icon: 'Cloud', path: '/cloudflare', visible: true },
                    { id: 'unifi', label: 'UniFi Network', icon: 'Wifi', path: '/unifi', visible: true },
                    { id: 'media', label: 'Media Center', icon: 'Film', path: '/media', visible: true },
                    { id: 'proxmox', label: 'Proxmox', icon: 'Server', path: '/proxmox', visible: true },
                    { id: 'settings', label: 'Global Settings', icon: 'Settings', path: '/settings', visible: true },
                ],
                weather: { location: '', apiKey: '', units: 'metric' as const },
                appearance: {
                    theme: 'dark',
                    accentColor: 'var(--md-sys-color-primary)',
                    backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                    dayStart: 7,
                    nightStart: 19,
                    showHeaderStats: true,
                },
            };
            setSettings(defaults as AppSettings);
            setToast({ message: 'Settings reset to defaults! Click Save to confirm.', type: 'success' });
        }
    };

    if (!settings) {
        return (
            <div
                className="page-container"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
            >
                <div style={{ textAlign: 'center' }}>
                    <Activity className="spinning" size={48} color="var(--md-sys-color-primary)" />
                    <p style={{ marginTop: '24px', fontWeight: 500, opacity: 0.7 }}>Initializing engine...</p>
                </div>
            </div>
        );
    }

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    return (
        <main
            className="app-layout"
            style={
                {
                    minHeight: '100vh',
                    width: '100%',
                    background: 'transparent',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    flexDirection: 'column',
                    paddingTop: isMobile ? '0' : '48px',
                    '--md-sys-color-primary': settings?.appearance?.accentColor || '#3b82f6',
                    '--md-sys-color-primary-container': `${settings?.appearance?.accentColor || '#3b82f6'}33`,
                } as React.CSSProperties
            }
        >
            <div
                style={{
                    maxWidth: '1780px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '0' : '40px',
                    padding: isMobile ? '0' : '0 24px 100px 24px',
                }}
            >
                {/* 1. SIDEBAR / MOBILE NAVIGATION */}
                <aside
                    style={{
                        width: isMobile ? '0' : '320px',
                        display: isMobile ? 'none' : 'flex',
                        borderRight: '1.5px solid var(--md-sys-color-outline-variant)',
                        padding: '40px 16px',
                        flexDirection: 'column',
                        gap: '8px',
                        backgroundColor: 'transparent',
                        position: 'sticky',
                        top: '48px',
                        height: 'fit-content',
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '0 16px',
                            marginBottom: '32px',
                        }}
                    >
                        <BackButton />
                        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Settings</h1>
                    </div>

                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--md-sys-shape-corner-medium)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: isActive ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                    border: 'none',
                                    color: isActive
                                        ? 'var(--md-sys-color-on-primary-container)'
                                        : 'var(--md-sys-color-on-surface-variant)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left',
                                }}
                            >
                                <tab.icon size={20} />
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{tab.label}</span>
                                {isActive && (
                                    <div
                                        style={{
                                            marginLeft: 'auto',
                                            width: '4px',
                                            height: '18px',
                                            backgroundColor: 'var(--md-sys-color-on-primary-container)',
                                            borderRadius: 'var(--md-sys-shape-corner-full)',
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* 2. CONTENT AREA */}
                <div
                    style={{
                        flex: 1,
                        padding: isMobile ? '8px 16px 140px 16px' : '0 24px',
                        backgroundColor: 'transparent',
                    }}
                >
                    {isMobile && showDirectory ? (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '32px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <BackButton />
                                    <h1
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: 700,
                                            margin: 0,
                                            color: 'var(--md-sys-color-primary)',
                                        }}
                                    >
                                        Settings
                                    </h1>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div
                                style={{
                                    position: 'relative',
                                    marginBottom: '32px',
                                    backgroundColor: 'var(--md-sys-color-surface-container)',
                                    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                    padding: '16px 48px',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        opacity: 0.4,
                                    }}
                                >
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search settings (e.g. 'theme', '...')"
                                    value={settingsSearch}
                                    onChange={e => setSettingsSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--md-sys-color-on-surface)',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        opacity: 0.4,
                                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                                        paddingLeft: '12px',
                                    }}
                                >
                                    <Mic size={18} />
                                </div>
                            </div>

                            {/* Category Cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setShowDirectory(false);
                                        }}
                                        className="m3-press-effect"
                                        style={{
                                            width: '100%',
                                            padding: '20px',
                                            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                            background: 'var(--md-sys-color-surface-container)',
                                            border: '1px solid rgba(255,255,255,0.03)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '14px',
                                                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--md-sys-color-primary)',
                                            }}
                                        >
                                            <tab.icon size={24} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    color: 'var(--md-sys-color-on-surface)',
                                                    fontWeight: 600,
                                                    fontSize: '16px',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                {tab.label}
                                            </div>
                                            <div
                                                style={{
                                                    color: 'var(--md-sys-color-on-surface-variant)',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                {tab.desc}
                                            </div>
                                        </div>
                                        <ChevronRight size={20} style={{ opacity: 0.2 }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <React.Fragment>
                            {/* Detail Header (Back Button on Mobile) */}
                            {isMobile && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        marginBottom: '32px',
                                        animation: 'fadeIn 0.2s ease',
                                    }}
                                >
                                    <div
                                        onClick={() => setShowDirectory(true)}
                                        className="m3-press-effect"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: 'var(--md-sys-shape-corner-full)',
                                            background: 'var(--md-sys-color-surface-container)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <ArrowLeft size={20} />
                                    </div>
                                    <h1
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            margin: 0,
                                            color: 'var(--md-sys-color-primary)',
                                        }}
                                    >
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h1>
                                </div>
                            )}

                            {!isMobile && (
                                <div
                                    style={{
                                        width: '100%',
                                        maxWidth: '900px',
                                        backgroundColor: 'var(--md-sys-color-surface-container-low)',
                                        borderRadius: '50px',
                                        padding: '12px 24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        border: '1px solid var(--md-sys-color-outline-variant)',
                                        marginBottom: '40px',
                                    }}
                                >
                                    <Search size={18} opacity={0.3} />
                                    <input
                                        type="text"
                                        placeholder="Search for Cloudflare, Sonarr, or Accent color..."
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            flex: 1,
                                            color: 'var(--md-sys-color-on-surface)',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                        value={settingsSearch}
                                        onChange={e => setSettingsSearch(e.target.value)}
                                    />
                                    <Mic size={18} opacity={0.3} />
                                </div>
                            )}

                            <div style={{ maxWidth: '900px' }}>
                                {settingsSearch.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                color: 'var(--md-sys-color-primary)',
                                                letterSpacing: '0.1em',
                                                opacity: 0.6,
                                            }}
                                        >
                                            SEARCH RESULTS
                                        </div>

                                        {/* Matching Service Cards */}
                                        {SETTINGS_MAP.filter(
                                            s =>
                                                s.name.toLowerCase().includes(settingsSearch.toLowerCase()) ||
                                                s.category.toLowerCase().includes(settingsSearch.toLowerCase()) ||
                                                s.fields.some(f =>
                                                    f.label.toLowerCase().includes(settingsSearch.toLowerCase())
                                                )
                                        ).map(service => (
                                            <section
                                                key={service.id}
                                                style={{
                                                    backgroundColor: 'var(--md-sys-color-surface-container)',
                                                    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                    padding: '32px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '20px',
                                                        marginBottom: '32px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            backgroundColor: service.bg,
                                                            color: service.color,
                                                            padding: '12px',
                                                            borderRadius: '14px',
                                                        }}
                                                    >
                                                        <DashboardIcon
                                                            icon={service.icon}
                                                            size={24}
                                                            color={service.color}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                                            {service.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: '13px',
                                                                color: 'var(--md-sys-color-on-surface-variant)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em',
                                                            }}
                                                        >
                                                            {service.category}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '20px',
                                                    }}
                                                >
                                                    {service.fields.map(field => (
                                                        <div
                                                            key={field.key}
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '8px',
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    color: 'var(--md-sys-color-on-surface-variant)',
                                                                    opacity: 0.6,
                                                                    paddingLeft: '4px',
                                                                }}
                                                            >
                                                                {field.label}
                                                            </label>
                                                            <input
                                                                type={field.type}
                                                                placeholder={field.placeholder}
                                                                value={
                                                                    (
                                                                        settings?.[service.id] as Record<string, string>
                                                                    )?.[field.key] || ''
                                                                }
                                                                onChange={e =>
                                                                    handleInputChange(
                                                                        service.id,
                                                                        field.key,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        'var(--md-sys-color-surface-container-highest)',
                                                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                                                    borderRadius: 'var(--md-sys-shape-corner-medium)',
                                                                    padding: '12px 16px',
                                                                    color: 'var(--md-sys-color-on-surface)',
                                                                    fontSize: '14px',
                                                                    outline: 'none',
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        ))}

                                        {/* Matching Appearance Section */}
                                        {('appearance'.includes(settingsSearch.toLowerCase()) ||
                                            'theme'.includes(settingsSearch.toLowerCase()) ||
                                            'accent'.includes(settingsSearch.toLowerCase()) ||
                                            'background'.includes(settingsSearch.toLowerCase())) && (
                                            <div
                                                style={{
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    paddingTop: '32px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        marginBottom: '20px',
                                                        opacity: 0.5,
                                                    }}
                                                >
                                                    Matching Category: Appearance
                                                </div>
                                                {/* Re-using the Appearance card logic would be ideal, but for now just show a hint or the actual card if matches */}
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('appearance');
                                                        setSettingsSearch('');
                                                    }}
                                                    className="md3-button-tonal m3-press-effect"
                                                    style={{ color: 'var(--md-sys-color-primary)' }}
                                                >
                                                    Go to Appearance Settings
                                                </button>
                                            </div>
                                        )}

                                        {SETTINGS_MAP.filter(
                                            s =>
                                                s.name.toLowerCase().includes(settingsSearch.toLowerCase()) ||
                                                s.category.toLowerCase().includes(settingsSearch.toLowerCase())
                                        ).length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.3 }}>
                                                <Search size={48} style={{ marginBottom: '16px' }} />
                                                <div>No matching settings found for &quot;{settingsSearch}&quot;</div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Fragment>
                                        {activeTab === 'appearance' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: 'var(--md-sys-color-primary)',
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    <Palette size={14} />
                                                    APPEARANCE
                                                </div>

                                                <section
                                                    style={{
                                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        padding: '32px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '20px',
                                                            marginBottom: '24px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    'var(--md-sys-color-surface-container-high)',
                                                                padding: '12px',
                                                                borderRadius: '14px',
                                                            }}
                                                        >
                                                            <Monitor size={24} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                                                Theme
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: '13px',
                                                                    color: 'var(--md-sys-color-on-surface-variant)',
                                                                }}
                                                            >
                                                                Choose your appearance
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Theme Pill Selector */}
                                                    <div
                                                        style={{
                                                            backgroundColor:
                                                                'var(--md-sys-color-surface-container-low)',
                                                            borderRadius: '50px',
                                                            padding: '6px',
                                                            display: 'flex',
                                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                                            marginBottom: '32px',
                                                        }}
                                                    >
                                                        {[
                                                            { id: 'dark', label: 'Dark', icon: Moon },
                                                            { id: 'light', label: 'Light', icon: Sun },
                                                            { id: 'system', label: 'System', icon: Monitor },
                                                            { id: 'time', label: 'Time', icon: Clock },
                                                        ].map(t => (
                                                            <button
                                                                key={t.id}
                                                                onClick={() => handleAppearanceChange('theme', t.id)}
                                                                className="m3-press-effect"
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '12px',
                                                                    borderRadius: '50px',
                                                                    border: 'none',
                                                                    background:
                                                                        settings.appearance?.theme === t.id
                                                                            ? 'var(--md-sys-color-surface-container-high)'
                                                                            : 'transparent',
                                                                    color:
                                                                        settings.appearance?.theme === t.id
                                                                            ? 'var(--md-sys-color-on-surface)'
                                                                            : 'var(--md-sys-color-on-surface-variant)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '10px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    fontSize: '14px',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {settings.appearance?.theme === t.id && (
                                                                    <Check
                                                                        size={14}
                                                                        color="var(--md-sys-color-primary)"
                                                                    />
                                                                )}
                                                                <t.icon size={18} />
                                                                {t.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {settings.appearance?.theme === 'time' && (
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                gap: '16px',
                                                                marginBottom: '32px',
                                                            }}
                                                        >
                                                            <div style={{ flex: 1 }}>
                                                                <div
                                                                    style={{
                                                                        fontSize: '12px',
                                                                        fontWeight: 600,
                                                                        color: 'var(--md-sys-color-on-surface-variant)',
                                                                        opacity: 0.6,
                                                                        marginBottom: '8px',
                                                                        paddingLeft: '4px',
                                                                    }}
                                                                >
                                                                    Day Starts At
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        position: 'relative',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="23"
                                                                        value={settings.appearance?.dayStart ?? 7}
                                                                        onChange={e =>
                                                                            handleAppearanceChange(
                                                                                'dayStart',
                                                                                parseInt(e.target.value) || 0
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '12px 16px',
                                                                            borderRadius:
                                                                                'var(--md-sys-shape-corner-medium)',
                                                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                                                            background:
                                                                                'var(--md-sys-color-surface-container-highest)',
                                                                            color: 'var(--md-sys-color-on-surface)',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                        }}
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            position: 'absolute',
                                                                            right: '16px',
                                                                            fontSize: '12px',
                                                                            opacity: 0.3,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        :00
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div
                                                                    style={{
                                                                        fontSize: '12px',
                                                                        fontWeight: 600,
                                                                        color: 'var(--md-sys-color-on-surface-variant)',
                                                                        opacity: 0.6,
                                                                        marginBottom: '8px',
                                                                        paddingLeft: '4px',
                                                                    }}
                                                                >
                                                                    Night Starts At
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        position: 'relative',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="23"
                                                                        value={settings.appearance?.nightStart ?? 19}
                                                                        onChange={e =>
                                                                            handleAppearanceChange(
                                                                                'nightStart',
                                                                                parseInt(e.target.value) || 0
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '12px 16px',
                                                                            borderRadius:
                                                                                'var(--md-sys-shape-corner-medium)',
                                                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                                                            background:
                                                                                'var(--md-sys-color-surface-container-highest)',
                                                                            color: 'var(--md-sys-color-on-surface)',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                        }}
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            position: 'absolute',
                                                                            right: '16px',
                                                                            fontSize: '12px',
                                                                            opacity: 0.3,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        :00
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: 'var(--md-sys-color-on-surface-variant)',
                                                            opacity: 0.6,
                                                            marginBottom: '16px',
                                                            paddingLeft: '4px',
                                                        }}
                                                    >
                                                        Accent color
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            gap: '12px',
                                                            flexWrap: 'wrap',
                                                            marginBottom: '32px',
                                                        }}
                                                    >
                                                        {[
                                                            { name: 'Horizon', color: 'var(--primary-accent)' },
                                                            { name: 'Teal', color: 'var(--md-sys-color-primary)' },
                                                            { name: 'Blue', color: '#64B5F6' },
                                                            { name: 'Indigo', color: '#7986CB' },
                                                            { name: 'Purple', color: '#BA68C8' },
                                                            { name: 'Pink', color: '#F06292' },
                                                            { name: 'Red', color: 'var(--md-sys-color-error)' },
                                                            { name: 'Orange', color: '#FFB74D' },
                                                            { name: 'Yellow', color: '#FFD54F' },
                                                            { name: 'Green', color: '#81C784' },
                                                            { name: 'Cyan', color: '#4DD0E1' },
                                                        ].map(c => (
                                                            <button
                                                                key={c.name}
                                                                onClick={() =>
                                                                    handleAppearanceChange('accentColor', c.color)
                                                                }
                                                                className="m3-press-effect"
                                                                style={{
                                                                    width: '44px',
                                                                    height: '44px',
                                                                    borderRadius: 'var(--md-sys-shape-corner-full)',
                                                                    backgroundColor: c.color,
                                                                    border:
                                                                        settings.appearance?.accentColor === c.color
                                                                            ? '4px solid #1c212b'
                                                                            : 'none',
                                                                    boxShadow:
                                                                        settings.appearance?.accentColor === c.color
                                                                            ? `0 0 0 2px ${c.color}`
                                                                            : 'none',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transform:
                                                                        settings.appearance?.accentColor === c.color
                                                                            ? 'scale(1)'
                                                                            : 'scale(0.85)',
                                                                }}
                                                                title={c.name}
                                                            >
                                                                {settings.appearance?.accentColor === c.color && (
                                                                    <div
                                                                        style={{
                                                                            width: '4px',
                                                                            height: '4px',
                                                                            borderRadius:
                                                                                'var(--md-sys-shape-corner-full)',
                                                                            backgroundColor: 'white',
                                                                        }}
                                                                    />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: 'var(--md-sys-color-on-surface-variant)',
                                                            opacity: 0.6,
                                                            marginBottom: '8px',
                                                            paddingLeft: '4px',
                                                        }}
                                                    >
                                                        Background Image URL
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                                                        <input
                                                            type="text"
                                                            value={settings.appearance?.backgroundImage || ''}
                                                            onChange={e =>
                                                                handleAppearanceChange(
                                                                    'backgroundImage',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="https://images.unsplash.com/..."
                                                            style={{
                                                                flex: 1,
                                                                padding: '12px 16px',
                                                                borderRadius: 'var(--md-sys-shape-corner-medium)',
                                                                border: '1px solid var(--md-sys-color-outline-variant)',
                                                                background:
                                                                    'var(--md-sys-color-surface-container-highest)',
                                                                color: 'var(--md-sys-color-on-surface)',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                            }}
                                                        />
                                                        {settings.appearance?.backgroundImage && (
                                                            <button
                                                                onClick={() =>
                                                                    handleAppearanceChange('backgroundImage', '')
                                                                }
                                                                className="m3-press-effect"
                                                                style={{
                                                                    padding: '0 16px',
                                                                    borderRadius: 'var(--md-sys-shape-corner-medium)',
                                                                    background: 'var(--md-sys-color-error-container)',
                                                                    color: 'var(--md-sys-color-error)',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontWeight: 600,
                                                                    fontSize: '13px',
                                                                }}
                                                            >
                                                                <Trash size={16} /> Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                </section>

                                                <section
                                                    style={{
                                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        padding: '32px',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                        <button
                                                            onClick={handleResetAppearance}
                                                            className="md3-button-tonal m3-press-effect"
                                                            style={{
                                                                color: 'var(--md-sys-color-error)',
                                                                background: 'var(--md-sys-color-error-container)',
                                                                padding: '12px 24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                borderRadius: '20px',
                                                            }}
                                                        >
                                                            <RefreshCw size={16} />
                                                            Reset Appearance to Defaults
                                                        </button>
                                                    </div>
                                                </section>
                                            </div>
                                        )}

                                        {activeTab === 'shortcuts' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: 'var(--md-sys-color-primary)',
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    <Layers size={14} />
                                                    FEATURES & SHORTCUTS
                                                </div>

                                                <section
                                                    style={{
                                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        padding: '32px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '20px',
                                                            marginBottom: '32px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    'var(--md-sys-color-surface-container-high)',
                                                                padding: '12px',
                                                                borderRadius: '14px',
                                                            }}
                                                        >
                                                            <LinkIcon size={24} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                                                Shortcuts Manager
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: '13px',
                                                                    color: 'var(--md-sys-color-on-surface-variant)',
                                                                }}
                                                            >
                                                                Custom direct links on your grid
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '1px',
                                                            borderRadius: 'var(--md-sys-shape-corner-large)',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {settings.bookmarks?.map((b: Bookmark) => (
                                                            <div
                                                                key={b.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '16px',
                                                                    padding: '16px 20px',
                                                                    backgroundColor:
                                                                        'var(--md-sys-color-surface-container)',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        backgroundColor: `${b.color}22`,
                                                                        padding: '10px',
                                                                        borderRadius:
                                                                            'var(--md-sys-shape-corner-medium)',
                                                                    }}
                                                                >
                                                                    <DashboardIcon
                                                                        icon={b.icon}
                                                                        size={18}
                                                                        color={b.color}
                                                                    />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                                                        {b.name}
                                                                    </div>
                                                                    <div style={{ fontSize: '11px', opacity: 0.4 }}>
                                                                        {b.url}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeBookmark(b.id)}
                                                                    className="m3-press-effect"
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: 'var(--md-sys-color-error)',
                                                                        cursor: 'pointer',
                                                                        padding: '8px',
                                                                    }}
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <div
                                                            style={{
                                                                padding: '8px',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <button
                                                                onClick={() => setIsAddingBookmark(true)}
                                                                className="md3-button-tonal m3-press-effect"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '16px',
                                                                    border: 'none',
                                                                    color: 'var(--md-sys-color-primary)',
                                                                    fontWeight: 800,
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '8px',
                                                                    borderRadius: '16px',
                                                                }}
                                                            >
                                                                <Plus size={18} /> Add New Shortcut
                                                            </button>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        )}

                                        {/* Plex PIN Dialog */}
                                        {plexAuth && plexPolling && (
                                            <div
                                                style={{
                                                    position: 'fixed',
                                                    inset: 0,
                                                    backgroundColor: 'rgba(0,0,0,0.85)',
                                                    backdropFilter: 'blur(12px)',
                                                    zIndex: 9999,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '24px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            'var(--md-sys-color-surface-container-highest)',
                                                        width: '100%',
                                                        maxWidth: '400px',
                                                        borderRadius: '40px',
                                                        padding: '40px',
                                                        border: '1px solid var(--md-sys-color-outline-variant)',
                                                        textAlign: 'center',
                                                        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                                                        animation: 'modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                                            color: '#eab308',
                                                            width: '64px',
                                                            height: '64px',
                                                            borderRadius: '20px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            margin: '0 auto 24px auto',
                                                        }}
                                                    >
                                                        <PlaySquare size={32} />
                                                    </div>
                                                    <h2
                                                        style={{
                                                            fontSize: '24px',
                                                            fontWeight: 900,
                                                            marginBottom: '8px',
                                                            letterSpacing: '-0.02em',
                                                        }}
                                                    >
                                                        Link Your Plex
                                                    </h2>
                                                    <p
                                                        style={{
                                                            fontSize: '14px',
                                                            color: 'var(--md-sys-color-on-surface-variant)',
                                                            marginBottom: '32px',
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        Visit <b>plex.tv/link</b> and <br />
                                                        enter this code to authorize:
                                                    </p>

                                                    <div
                                                        style={{
                                                            backgroundColor: 'var(--md-sys-color-surface-container)',
                                                            padding: '24px',
                                                            borderRadius: '24px',
                                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                                            marginBottom: '32px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: '48px',
                                                                fontWeight: 900,
                                                                letterSpacing: '0.2em',
                                                                color: '#eab308',
                                                                fontFamily: 'monospace',
                                                            }}
                                                        >
                                                            {plexAuth.code}
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '12px',
                                                        }}
                                                    >
                                                        <a
                                                            href="https://plex.tv/link"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="md3-button m3-press-effect"
                                                            style={{
                                                                backgroundColor: 'var(--md-sys-color-primary)',
                                                                color: 'var(--md-sys-color-on-primary)',
                                                                textDecoration: 'none',
                                                                padding: '16px',
                                                                borderRadius: 'var(--md-sys-shape-corner-full)',
                                                                fontWeight: 800,
                                                                fontSize: '14px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '8px',
                                                            }}
                                                        >
                                                            Open Plex.tv/link <ExternalLink size={18} />
                                                        </a>
                                                        <button
                                                            onClick={() => {
                                                                setPlexPolling(false);
                                                                setPlexAuth(null);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'var(--md-sys-color-on-surface-variant)',
                                                                fontSize: '13px',
                                                                fontWeight: 700,
                                                                padding: '12px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>

                                                    <div
                                                        style={{
                                                            marginTop: '24px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '10px',
                                                            fontSize: '11px',
                                                            fontWeight: 800,
                                                            color: 'var(--md-sys-color-on-surface-variant)',
                                                            opacity: 0.8,
                                                        }}
                                                    >
                                                        <RefreshCw className="spinning" size={14} color="#eab308" />
                                                        Waiting for Authorization...
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'general' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: 'var(--md-sys-color-primary)',
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    <Monitor size={14} />
                                                    SIDEBAR NAVIGATION
                                                </div>
                                                <section
                                                    style={{
                                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        padding: '32px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '12px',
                                                        }}
                                                    >
                                                        {settings.navigation
                                                            .filter(
                                                                (item: NavItem) =>
                                                                    item.id !== 'settings' && item.id !== 'dashboard'
                                                            )
                                                            .map((item: NavItem, idx: number, arr: NavItem[]) => (
                                                                <div
                                                                    key={item.id}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '16px',
                                                                        padding: '12px 20px',
                                                                        background: 'rgba(255,255,255,0.03)',
                                                                        borderRadius:
                                                                            'var(--md-sys-shape-corner-large)',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: '2px',
                                                                        }}
                                                                    >
                                                                        <button
                                                                            onClick={() => moveNavItem(item.id, 'up')}
                                                                            disabled={idx === 0}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                color: 'var(--md-sys-color-primary)',
                                                                                cursor:
                                                                                    idx === 0 ? 'default' : 'pointer',
                                                                                opacity: idx === 0 ? 0.2 : 0.6,
                                                                                padding: '2px',
                                                                            }}
                                                                            title="Move Up"
                                                                        >
                                                                            <ChevronUp size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => moveNavItem(item.id, 'down')}
                                                                            disabled={idx === arr.length - 1}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                color: 'var(--md-sys-color-primary)',
                                                                                cursor:
                                                                                    idx === arr.length - 1
                                                                                        ? 'default'
                                                                                        : 'pointer',
                                                                                opacity:
                                                                                    idx === arr.length - 1 ? 0.2 : 0.6,
                                                                                padding: '2px',
                                                                            }}
                                                                            title="Move Down"
                                                                        >
                                                                            <ChevronDown size={16} />
                                                                        </button>
                                                                    </div>
                                                                    <div
                                                                        onClick={() => {
                                                                            setEditingIconId(item.id);
                                                                            setIconSearch('');
                                                                        }}
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            backgroundColor:
                                                                                'var(--md-sys-color-surface-container-high)',
                                                                            padding: '10px',
                                                                            borderRadius: '12px',
                                                                        }}
                                                                        title="Change Icon"
                                                                    >
                                                                        <DashboardIcon icon={item.icon} size={22} />
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div
                                                                            style={{
                                                                                fontWeight: 600,
                                                                                fontSize: '14px',
                                                                            }}
                                                                        >
                                                                            {item.label}
                                                                        </div>
                                                                        <div style={{ fontSize: '11px', opacity: 0.4 }}>
                                                                            {item.path} {item.isIframe && '• Iframe'}
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                                        <button
                                                                            onClick={() => startEditingNavItem(item)}
                                                                            className="m3-press-effect"
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                padding: '8px',
                                                                                color: 'var(--md-sys-color-primary)',
                                                                            }}
                                                                            title="Edit Item"
                                                                        >
                                                                            <Pencil size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                updateNavItem(
                                                                                    item.id,
                                                                                    'visible',
                                                                                    !item.visible
                                                                                )
                                                                            }
                                                                            className="m3-press-effect"
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                padding: '8px',
                                                                                color: item.visible
                                                                                    ? 'var(--md-sys-color-primary)'
                                                                                    : 'rgba(255,255,255,0.2)',
                                                                            }}
                                                                            title="Toggle Visibility"
                                                                        >
                                                                            {item.visible ? (
                                                                                <Eye size={18} />
                                                                            ) : (
                                                                                <EyeOff size={18} />
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteNavItem(item.id)}
                                                                            className="m3-press-effect"
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                padding: '8px',
                                                                                color: 'var(--md-sys-color-error)',
                                                                            }}
                                                                            title="Delete Item"
                                                                        >
                                                                            <Trash size={18} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        <button
                                                            onClick={() => setIsAddingItem(true)}
                                                            className="m3-press-effect"
                                                            style={{
                                                                width: '100%',
                                                                marginTop: '12px',
                                                                padding: '16px',
                                                                border: '1.5px dashed var(--md-sys-color-outline)',
                                                                borderRadius: '20px',
                                                                background: 'none',
                                                                color: 'var(--md-sys-color-primary)',
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '8px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Plus size={18} />
                                                            Add New Navigation Item
                                                        </button>
                                                    </div>
                                                </section>
                                            </div>
                                        )}

                                        {activeTab === 'plugins' && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '32px',
                                                    animation: 'fadeIn 0.3s ease',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: 'var(--md-sys-color-primary)',
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    <Zap size={14} />
                                                    MODULE MANAGEMENT
                                                </div>

                                                <section
                                                    style={{
                                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        padding: '32px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '24px',
                                                        }}
                                                    >
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                type="file"
                                                                accept=".zip"
                                                                onChange={handlePluginUpload}
                                                                disabled={uploading}
                                                                style={{
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    opacity: 0,
                                                                    cursor: uploading ? 'default' : 'pointer',
                                                                    zIndex: 10,
                                                                }}
                                                            />
                                                            <button
                                                                className="m3-press-effect"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '32px',
                                                                    border: '2px dashed var(--md-sys-color-outline-variant)',
                                                                    borderRadius: '32px',
                                                                    background: 'none',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    color: 'var(--md-sys-color-primary)',
                                                                }}
                                                            >
                                                                {uploading ? (
                                                                    <Loader2 className="animate-spin" size={32} />
                                                                ) : (
                                                                    <Plus size={32} />
                                                                )}
                                                                <div style={{ fontWeight: 800, fontSize: '15px' }}>
                                                                    {uploading
                                                                        ? 'Installing Extension...'
                                                                        : 'Install New Plugin (.zip)'}
                                                                </div>
                                                                <div style={{ fontSize: '12px', opacity: 0.5 }}>
                                                                    Modules are hot-reloaded automatically after upload.
                                                                </div>
                                                            </button>
                                                        </div>

                                                        <div
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns:
                                                                    'repeat(auto-fill, minmax(340px, 1fr))',
                                                                gap: '12px',
                                                            }}
                                                        >
                                                            {(() => {
                                                                const coreIds = ['sonarr', 'radarr', 'plex', 'weather'];
                                                                return [...(MODULE_MANIFESTS as ModuleManifest[])]
                                                                    .filter((m: ModuleManifest) => !m.hidden)
                                                                    .sort((a: ModuleManifest, b: ModuleManifest) => {
                                                                        const aCore = coreIds.includes(a.id);
                                                                        const bCore = coreIds.includes(b.id);
                                                                        if (aCore && !bCore) return -1;
                                                                        if (!aCore && bCore) return 1;
                                                                        return a.name.localeCompare(b.name);
                                                                    })
                                                                    .map((m: ModuleManifest) => {
                                                                        const isEnabled =
                                                                            settings?.modules?.[m.id]?.enabled === true;
                                                                        return (
                                                                            <div
                                                                                key={m.id}
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '16px',
                                                                                    padding: '16px 20px',
                                                                                    background:
                                                                                        'var(--md-sys-color-surface-container-low)',
                                                                                    borderRadius: '20px',
                                                                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                                                                    opacity: isEnabled ? 1 : 0.8,
                                                                                    transition: 'all 0.2s ease',
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        padding: '10px',
                                                                                        backgroundColor: `${m.color}15`,
                                                                                        color: m.color,
                                                                                        borderRadius: '14px',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                    }}
                                                                                >
                                                                                    <DashboardIcon
                                                                                        icon={m.icon}
                                                                                        size={20}
                                                                                    />
                                                                                </div>
                                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                                    <div
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '8px',
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            style={{
                                                                                                fontWeight: 700,
                                                                                                fontSize: '15px',
                                                                                                whiteSpace: 'nowrap',
                                                                                                overflow: 'hidden',
                                                                                                textOverflow:
                                                                                                    'ellipsis',
                                                                                            }}
                                                                                        >
                                                                                            {m.name}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        style={{
                                                                                            fontSize: '10px',
                                                                                            fontWeight: 900,
                                                                                            opacity: 0.3,
                                                                                            textTransform: 'uppercase',
                                                                                            letterSpacing: '0.02em',
                                                                                        }}
                                                                                    >
                                                                                        {m.id}
                                                                                    </div>
                                                                                </div>
                                                                                <div
                                                                                    style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '10px',
                                                                                    }}
                                                                                >
                                                                                    {(m.configFields?.length || 0) >
                                                                                        0 && (
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                setEditingPlugin(m)
                                                                                            }
                                                                                            className="m3-press-effect"
                                                                                            style={{
                                                                                                background:
                                                                                                    'var(--md-sys-color-surface-container-highest)',
                                                                                                border: 'none',
                                                                                                color: 'var(--md-sys-color-primary)',
                                                                                                cursor: 'pointer',
                                                                                                padding: '8px',
                                                                                                borderRadius: '12px',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                justifyContent:
                                                                                                    'center',
                                                                                            }}
                                                                                            title="Configure Service"
                                                                                        >
                                                                                            <SettingsIcon size={16} />
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            toggleModule(
                                                                                                m.id,
                                                                                                !isEnabled
                                                                                            )
                                                                                        }
                                                                                        className="m3-press-effect"
                                                                                        style={{
                                                                                            width: '44px',
                                                                                            height: '24px',
                                                                                            borderRadius: '12px',
                                                                                            backgroundColor: isEnabled
                                                                                                ? 'var(--md-sys-color-primary)'
                                                                                                : 'var(--md-sys-color-surface-container-highest)',
                                                                                            position: 'relative',
                                                                                            border: 'none',
                                                                                            cursor: 'pointer',
                                                                                            transition:
                                                                                                'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            style={{
                                                                                                width: '18px',
                                                                                                height: '18px',
                                                                                                borderRadius: '9px',
                                                                                                backgroundColor:
                                                                                                    isEnabled
                                                                                                        ? 'var(--md-sys-color-on-primary)'
                                                                                                        : 'var(--md-sys-color-outline)',
                                                                                                position: 'absolute',
                                                                                                top: '3px',
                                                                                                left: isEnabled
                                                                                                    ? '23px'
                                                                                                    : '3px',
                                                                                                transition:
                                                                                                    'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                                boxShadow:
                                                                                                    'var(--md-sys-elevation-1)',
                                                                                            }}
                                                                                        />
                                                                                    </button>
                                                                                    {![
                                                                                        'sonarr',
                                                                                        'radarr',
                                                                                        'plex',
                                                                                        'weather',
                                                                                    ].includes(m.id) && (
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handlePluginDelete(m.id)
                                                                                            }
                                                                                            className="m3-press-effect"
                                                                                            style={{
                                                                                                background: 'none',
                                                                                                border: 'none',
                                                                                                color: 'var(--md-sys-color-error)',
                                                                                                cursor: 'pointer',
                                                                                                padding: '8px',
                                                                                                opacity: 0.6,
                                                                                            }}
                                                                                        >
                                                                                            <Trash size={16} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    });
                                                            })()}
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        )}

                                        {activeTab === 'system' && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '32px',
                                                    animation: 'fadeIn 0.3s ease',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: 'var(--md-sys-color-primary)',
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    <Database size={14} />
                                                    SYSTEM & DATA
                                                </div>

                                                <section
                                                    style={{
                                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        padding: '32px',
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '16px',
                                                    }}
                                                >
                                                    <button
                                                        onClick={handleExport}
                                                        className="m3-press-effect"
                                                        style={{
                                                            backgroundColor:
                                                                'var(--md-sys-color-surface-container-highest)',
                                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                                            height: '100px',
                                                            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                            color: 'var(--md-sys-color-on-surface)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '8px',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Download size={24} opacity={0.5} />
                                                        <div style={{ fontWeight: 600 }}>Download Backup</div>
                                                    </button>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="file"
                                                            accept=".json"
                                                            onChange={handleImport}
                                                            style={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                opacity: 0,
                                                                cursor: 'pointer',
                                                                zIndex: 10,
                                                            }}
                                                        />
                                                        <button
                                                            className="m3-press-effect"
                                                            style={{
                                                                width: '100%',
                                                                backgroundColor:
                                                                    'var(--md-sys-color-surface-container-highest)',
                                                                border: '1px solid var(--md-sys-color-outline-variant)',
                                                                height: '100px',
                                                                borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                                color: 'var(--md-sys-color-on-surface)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '8px',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Upload size={24} opacity={0.5} />
                                                            <div style={{ fontWeight: 600 }}>Import Backup</div>
                                                        </button>
                                                    </div>
                                                </section>

                                                <button
                                                    onClick={handleReset}
                                                    className="m3-press-effect"
                                                    style={{
                                                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                                        border: '1.5px dashed rgba(239, 68, 68, 0.4)',
                                                        padding: '24px',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        color: 'var(--md-sys-color-error)',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <RefreshCcw size={20} style={{ marginBottom: '8px' }} />
                                                    <div>DANGER: Reset Dashboard to Factory Defaults</div>
                                                </button>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: 'var(--md-sys-color-primary)',
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.08em',
                                                        marginTop: '16px',
                                                    }}
                                                >
                                                    <Info size={14} />
                                                    ABOUT HORIZON
                                                </div>

                                                <section
                                                    style={{
                                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                                        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                                        padding: '32px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '24px',
                                                            marginBottom: '32px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '80px',
                                                                height: '80px',
                                                                borderRadius: '24px',
                                                                background: 'var(--md-sys-color-primary-container)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'var(--md-sys-color-primary)',
                                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                            }}
                                                        >
                                                            <Layers size={40} />
                                                        </div>
                                                        <div>
                                                            <h2
                                                                style={{
                                                                    fontSize: '28px',
                                                                    fontWeight: 900,
                                                                    margin: 0,
                                                                    letterSpacing: '-0.04em',
                                                                }}
                                                            >
                                                                Horizon v{changelogData?.[0]?.version || '0.0.0'}
                                                            </h2>
                                                            <p
                                                                style={{
                                                                    margin: '4px 0 0 0',
                                                                    opacity: 0.6,
                                                                    fontSize: '14px',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                The Intelligent Core for your Private Media Estate.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '12px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '8px',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: '12px',
                                                                    fontWeight: 800,
                                                                    color: 'var(--md-sys-color-primary)',
                                                                    letterSpacing: '0.1em',
                                                                }}
                                                            >
                                                                RELEASE NOTES
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    setIsChangelogExpanded(!isChangelogExpanded)
                                                                }
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: 'var(--md-sys-color-primary)',
                                                                    fontSize: '11px',
                                                                    fontWeight: 800,
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                }}
                                                            >
                                                                {isChangelogExpanded
                                                                    ? 'Show Latest Only'
                                                                    : 'View Version History'}
                                                                {isChangelogExpanded ? (
                                                                    <ChevronUp size={14} />
                                                                ) : (
                                                                    <ChevronDown size={14} />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {(isChangelogExpanded
                                                            ? (changelogData || []).slice(0, 5)
                                                            : (changelogData || []).slice(0, 1)
                                                        )
                                                            .filter(Boolean)
                                                            .map(
                                                                (
                                                                    release: {
                                                                        version: string;
                                                                        title: string;
                                                                        date: string;
                                                                        changes: string[];
                                                                    },
                                                                    idx: number
                                                                ) => (
                                                                    <div
                                                                        key={release.version}
                                                                        style={{
                                                                            padding: '24px',
                                                                            backgroundColor:
                                                                                idx === 0
                                                                                    ? 'var(--md-sys-color-surface-container-highest)'
                                                                                    : 'rgba(255,255,255,0.02)',
                                                                            borderRadius: '24px',
                                                                            border:
                                                                                idx === 0
                                                                                    ? '1px solid var(--md-sys-color-outline-variant)'
                                                                                    : '1px solid rgba(255,255,255,0.05)',
                                                                            marginBottom: isChangelogExpanded
                                                                                ? '8px'
                                                                                : '0',
                                                                            animation: 'slideUp 0.3s ease',
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                marginBottom: '16px',
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '12px',
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        fontSize: '18px',
                                                                                        fontWeight: 900,
                                                                                    }}
                                                                                >
                                                                                    {release.title}
                                                                                </div>
                                                                                <div
                                                                                    style={{
                                                                                        padding: '4px 10px',
                                                                                        borderRadius: '8px',
                                                                                        background:
                                                                                            'var(--md-sys-color-primary-container)',
                                                                                        color: 'var(--md-sys-color-primary)',
                                                                                        fontSize: '10px',
                                                                                        fontWeight: 900,
                                                                                    }}
                                                                                >
                                                                                    v{release.version}
                                                                                </div>
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    fontSize: '12px',
                                                                                    opacity: 0.4,
                                                                                    fontWeight: 600,
                                                                                }}
                                                                            >
                                                                                {release.date}
                                                                            </div>
                                                                        </div>
                                                                        <ul
                                                                            style={{
                                                                                margin: 0,
                                                                                paddingLeft: '20px',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                gap: '8px',
                                                                            }}
                                                                        >
                                                                            {(release.changes || []).map(
                                                                                (change: string, cidx: number) => (
                                                                                    <li
                                                                                        key={cidx}
                                                                                        style={{
                                                                                            fontSize: '13px',
                                                                                            color: 'var(--md-sys-color-on-surface-variant)',
                                                                                            lineHeight: 1.5,
                                                                                        }}
                                                                                    >
                                                                                        {change}
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )
                                                            )}
                                                    </div>
                                                </section>
                                            </div>
                                        )}
                                    </Fragment>
                                )}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>

            {/* MD3 Add Shortcut Dialog */}
            {isAddingBookmark && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(var(--md-sys-color-scrim-rgb), 0.5)',
                            backdropFilter: 'blur(10px)',
                        }}
                        onClick={() => setIsAddingBookmark(false)}
                    />
                    <div
                        style={{
                            position: 'relative',
                            width: '400px',
                            background: 'var(--md-sys-color-surface-container-high)',
                            borderRadius: '28px',
                            padding: '24px',
                            boxShadow: 'var(--md-sys-elevation-3)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                        }}
                    >
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 400, margin: 0 }}>Add Shortcut</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        color: 'var(--md-sys-color-primary)',
                                        paddingLeft: '4px',
                                    }}
                                >
                                    NAME
                                </label>
                                <input
                                    type="text"
                                    value={newBookmark.name}
                                    onChange={e => setNewBookmark({ ...newBookmark, name: e.target.value })}
                                    style={{
                                        backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                        border: '1px solid var(--md-sys-color-outline)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        color: 'var(--md-sys-color-on-surface)',
                                        fontSize: '14px',
                                    }}
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        color: 'var(--md-sys-color-primary)',
                                        paddingLeft: '4px',
                                    }}
                                >
                                    URL
                                </label>
                                <input
                                    type="url"
                                    value={newBookmark.url}
                                    onChange={e => setNewBookmark({ ...newBookmark, url: e.target.value })}
                                    style={{
                                        backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                        border: '1px solid var(--md-sys-color-outline)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        color: 'var(--md-sys-color-on-surface)',
                                        fontSize: '14px',
                                    }}
                                    placeholder="https://google.com"
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                                <button
                                    onClick={() => setIsAddingBookmark(false)}
                                    className="md3-button-text"
                                    style={{ padding: '10px 16px', color: 'var(--md-sys-color-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addBookmark}
                                    className="md3-button-filled"
                                    style={{ padding: '10px 24px', borderRadius: '20px' }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {hasChanges && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '40px',
                        right: '40px',
                        display: 'flex',
                        gap: '12px',
                        zIndex: 1100,
                        animation: 'slideInUp 0.3s var(--md-sys-motion-easing-emphasized)',
                    }}
                >
                    <button
                        className="md3-button-filled m3-press-effect"
                        onClick={() => handleSave()}
                        style={{
                            height: '64px',
                            padding: '0 40px',
                            fontSize: '16px',
                            gap: '14px',
                            boxShadow: '0 12px 32px rgba(var(--md-sys-color-primary-rgb), 0.3)',
                            borderRadius: '32px',
                            fontWeight: 800,
                        }}
                    >
                        <Save size={20} />
                        {saving ? 'Syncing...' : 'Save All Changes'}
                    </button>
                </div>
            )}

            {/* Plex Server Discovery Dialog */}
            {plexAuthStatus === 'discovery' && discoveredServers.length > 1 && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(12px)',
                        }}
                    />
                    <div
                        style={{
                            position: 'relative',
                            width: '500px',
                            background: 'var(--md-sys-color-surface-container-high)',
                            borderRadius: '32px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            animation: 'slideUpScale 0.4s cubic-bezier(0.2, 0, 0, 1)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    padding: '12px',
                                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                    borderRadius: '16px',
                                    color: '#eab308',
                                }}
                            >
                                <Server size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Plex Servers Found</h3>
                                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                                    Multiple servers detected on your account.
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                maxHeight: '400px',
                                overflowY: 'auto',
                                paddingRight: '8px',
                            }}
                        >
                            {discoveredServers.map(srv => (
                                <button
                                    key={srv.id}
                                    onClick={() => handleSelectServer(srv)}
                                    className="m3-press-effect"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'var(--md-sys-color-surface-container)',
                                        borderRadius: '16px',
                                        border: '1px solid var(--md-sys-color-outline-variant)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        color: 'inherit',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div
                                            style={{
                                                backgroundColor: 'var(--md-sys-color-primary-container)',
                                                color: 'var(--md-sys-color-primary)',
                                                padding: '10px',
                                                borderRadius: '12px',
                                            }}
                                        >
                                            <Server size={18} />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 800 }}>{srv.name}</div>
                                            <div style={{ fontSize: '11px', opacity: 0.5 }}>{srv.url}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} opacity={0.3} />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPlexAuthStatus('idle')}
                            style={{
                                marginTop: '24px',
                                padding: '16px',
                                borderRadius: '16px',
                                border: '1px solid var(--md-sys-color-outline)',
                                background: 'none',
                                color: 'var(--md-sys-color-on-surface)',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {toast && <MD3Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* MD3 Add/Edit Nav Item Dialog */}
            {isAddingItem && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(var(--md-sys-color-scrim-rgb), 0.5)',
                            backdropFilter: 'blur(10px)',
                        }}
                        onClick={() => {
                            setIsAddingItem(false);
                            setNewItem({ label: '', path: '', icon: 'LinkIcon', visible: true, isIframe: false });
                        }}
                    />
                    <div
                        style={{
                            position: 'relative',
                            width: '500px',
                            maxHeight: '90vh',
                            background: 'var(--md-sys-color-surface-container-high)',
                            borderRadius: '28px',
                            padding: '24px',
                            boxShadow: 'var(--md-sys-elevation-3)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 400, margin: 0 }}>
                                {newItem.id ? 'Edit Sidebar Item' : 'Add Sidebar Item'}
                            </h3>
                        </div>

                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                paddingRight: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                            }}
                        >
                            {/* Searchable Gallery */}
                            {!newItem.id && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: 'var(--md-sys-color-primary)',
                                            paddingLeft: '4px',
                                        }}
                                    >
                                        QUICK ADD SERVICE
                                    </label>
                                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                                        <Search
                                            size={16}
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                opacity: 0.5,
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search services (e.g. Proxmox...)"
                                            style={{
                                                width: '100%',
                                                padding: '10px 10px 10px 36px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--md-sys-color-outline)',
                                                background: 'var(--md-sys-color-surface-container-highest)',
                                                color: '#fff',
                                                fontSize: '13px',
                                                outline: 'none',
                                            }}
                                            value={gallerySearch}
                                            onChange={e => setGallerySearch(e.target.value)}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                            gap: '8px',
                                            padding: '4px',
                                        }}
                                    >
                                        {SETTINGS_MAP.filter(
                                            s =>
                                                s.name.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                                                s.category.toLowerCase().includes(gallerySearch.toLowerCase())
                                        ).map(service => (
                                            <button
                                                key={service.id}
                                                onClick={() => {
                                                    const isModularView = !!service.hasView;
                                                    const managedServicePages = [
                                                        'glances',
                                                        'dockge',
                                                        'uptimekuma',
                                                        'homeassistant',
                                                    ];
                                                    const isActuallyNative =
                                                        isModularView || managedServicePages.includes(service.id);

                                                    setNewItem({
                                                        ...newItem,
                                                        label: service.name,
                                                        path: isModularView
                                                            ? `/view/${service.id}`
                                                            : (settings[service.id] as Record<string, string>)?.url ||
                                                              `/${service.id}`,
                                                        icon: service.icon,
                                                        isIframe:
                                                            !isActuallyNative &&
                                                            (['proxmox'].includes(service.id) ||
                                                                !!(settings[service.id] as Record<string, string>)
                                                                    ?.url),
                                                    });
                                                }}
                                                className="m3-press-effect"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <DashboardIcon icon={service.icon} size={18} color={service.color} />
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {service.name}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div
                                        style={{
                                            height: '1px',
                                            backgroundColor: 'var(--md-sys-color-outline-variant)',
                                            margin: '8px 0',
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div
                                    onClick={() => {
                                        setEditingIconId('NEW_ITEM');
                                        setIconSearch('');
                                    }}
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: '1px solid var(--md-sys-color-outline-variant)',
                                    }}
                                    title="Change Icon"
                                >
                                    <DashboardIcon icon={newItem.icon || 'LinkIcon'} size={32} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                    <label
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: 'var(--md-sys-color-primary)',
                                            paddingLeft: '4px',
                                        }}
                                    >
                                        LABEL
                                    </label>
                                    <input
                                        type="text"
                                        value={newItem.label}
                                        onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                                        style={{
                                            backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                            border: '1px solid var(--md-sys-color-outline)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            color: 'var(--md-sys-color-on-surface)',
                                            fontSize: '14px',
                                        }}
                                        placeholder="e.g. Media Dashboard"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        color: 'var(--md-sys-color-primary)',
                                        paddingLeft: '4px',
                                    }}
                                >
                                    PATH / URL
                                </label>
                                <input
                                    type="text"
                                    value={newItem.path}
                                    onChange={e => setNewItem({ ...newItem, path: e.target.value })}
                                    style={{
                                        backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                                        border: '1px solid var(--md-sys-color-outline)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        color: 'var(--md-sys-color-on-surface)',
                                        fontSize: '14px',
                                    }}
                                    placeholder="/proxmox or https://..."
                                />
                            </div>

                            <div
                                onClick={() => setNewItem({ ...newItem, isIframe: !newItem.isIframe })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    backgroundColor: 'var(--md-sys-color-surface-container)',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Open as Sidebar Iframe</div>
                                    <div style={{ fontSize: '11px', opacity: 0.5 }}>
                                        Embed view inside the hub instead of navigating
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: '48px',
                                        height: '28px',
                                        borderRadius: '14px',
                                        backgroundColor: newItem.isIframe
                                            ? 'var(--md-sys-color-primary)'
                                            : 'var(--md-sys-color-outline)',
                                        position: 'relative',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            backgroundColor: '#fff',
                                            position: 'absolute',
                                            top: '4px',
                                            left: newItem.isIframe ? '24px' : '4px',
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                marginTop: '24px',
                                borderTop: '1px solid var(--md-sys-color-outline-variant)',
                                paddingTop: '20px',
                            }}
                        >
                            <button
                                onClick={() => {
                                    setIsAddingItem(false);
                                    setGallerySearch('');
                                    setNewItem({
                                        label: '',
                                        path: '',
                                        icon: 'LinkIcon',
                                        visible: true,
                                        isIframe: false,
                                    });
                                }}
                                className="md3-button-text"
                                style={{ padding: '10px 16px', color: 'var(--md-sys-color-primary)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveNavItem}
                                className="md3-button-filled"
                                style={{ padding: '10px 24px', borderRadius: '24px' }}
                            >
                                {newItem.id ? 'Save Changes' : 'Add to Sidebar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MD3 Icon Picker Dialog (Unified) */}
            {editingIconId && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)',
                        }}
                        onClick={() => setEditingIconId(null)}
                    />
                    <div
                        style={{
                            position: 'relative',
                            width: '450px',
                            maxHeight: '80vh',
                            background: 'var(--md-sys-color-surface-container-high)',
                            borderRadius: '28px',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                        }}
                    >
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Select Icon</h3>

                        <div style={{ marginBottom: '16px', position: 'relative' }}>
                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    opacity: 0.5,
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search icons..."
                                value={iconSearch}
                                onChange={e => setIconSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--md-sys-color-outline)',
                                    background: 'var(--md-sys-color-surface-container-highest)',
                                    color: '#fff',
                                    fontSize: '14px',
                                }}
                            />
                        </div>

                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '12px',
                                paddingRight: '4px',
                            }}
                        >
                            {COMMON_ICONS.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase())).map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => {
                                        if (editingIconId === 'NEW_ITEM') {
                                            setNewItem({ ...newItem, icon });
                                        } else if (editingIconId.startsWith('bm-')) {
                                            // It's a bookmark (this part of the code might be elsewhere but for safety)
                                            setSettings(prev => {
                                                if (!prev) return prev;
                                                return {
                                                    ...prev,
                                                    bookmarks: prev.bookmarks.map((b: Bookmark) =>
                                                        b.id === editingIconId ? { ...b, icon } : b
                                                    ),
                                                };
                                            });
                                        } else {
                                            // It's a navigation item
                                            setSettings(prev => {
                                                if (!prev) return prev;
                                                return {
                                                    ...prev,
                                                    navigation: prev.navigation.map((n: NavItem) =>
                                                        n.id === editingIconId ? { ...n, icon } : n
                                                    ),
                                                };
                                            });
                                        }
                                        setEditingIconId(null);
                                    }}
                                    style={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--md-sys-color-surface-container)',
                                        border: '1px solid var(--md-sys-color-outline-variant)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                    }}
                                >
                                    <DashboardIcon icon={icon} size={24} />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setEditingIconId(null)}
                            className="md3-button-text"
                            style={{ alignSelf: 'flex-end', marginTop: '16px' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Contextual Plugin Settings Dialog */}
            {editingPlugin && (
                <ModuleSettingsDialog
                    module={editingPlugin}
                    initialSettings={(settings[editingPlugin.id] as Record<string, unknown>) || {}}
                    onSave={async newSet => {
                        if (!settings) return;
                        const next = {
                            ...settings,
                            [editingPlugin.id]: {
                                ...(settings[editingPlugin.id] || {}),
                                ...newSet,
                            },
                        };
                        setSettings(next);
                        await handleSave(next);
                    }}
                    onClose={() => setEditingPlugin(null)}
                    extraActions={(() => {
                        if (editingPlugin.id === 'plex') {
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: 'var(--md-sys-color-on-surface-variant)',
                                            opacity: 0.6,
                                        }}
                                    >
                                        DIAGNOSTICS & LINK
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={handlePlexTest}
                                            className="m3-press-effect"
                                            style={{
                                                flex: 1,
                                                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                                                border: '1px solid var(--md-sys-color-outline-variant)',
                                                borderRadius: '16px',
                                                padding: '12px',
                                                color: 'var(--md-sys-color-on-surface)',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <Activity size={16} /> Test Connection
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePlexSignIn}
                                            className="m3-press-effect"
                                            disabled={plexAuthStatus === 'linking' || plexPolling}
                                            style={{
                                                flex: 2,
                                                backgroundColor:
                                                    plexAuthStatus === 'success' ? '#4ade80' : 'rgba(234, 179, 8, 0.1)',
                                                border: `1.5px solid ${plexAuthStatus === 'success' ? '#4ade80' : 'rgba(234, 179, 8, 0.3)'}`,
                                                borderRadius: '16px',
                                                padding: '12px',
                                                color: plexAuthStatus === 'success' ? 'black' : '#eab308',
                                                fontSize: '14px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            {plexPolling ? (
                                                <RefreshCw className="spinning" size={16} />
                                            ) : (
                                                <PlaySquare size={16} />
                                            )}
                                            {plexAuthStatus === 'success' ? 'Linked!' : 'Sign in with Plex'}
                                        </button>
                                    </div>
                                </div>
                            );
                        }
                        if (editingPlugin.id === 'workspace') {
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: 'var(--md-sys-color-on-surface-variant)',
                                            opacity: 0.6,
                                        }}
                                    >
                                        AUTHORIZATION
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (hasChanges) {
                                                if (
                                                    !confirm(
                                                        'You have unsaved changes. Save them before authenticating to avoid data loss. Continue anyway?'
                                                    )
                                                ) {
                                                    return;
                                                }
                                            }
                                            window.location.href = '/api/workspace/auth';
                                        }}
                                        className="m3-press-effect"
                                        style={{
                                            backgroundColor: settings.workspace?.accessToken
                                                ? '#4285f4'
                                                : 'rgba(66, 133, 244, 0.1)',
                                            border: `1.5px solid ${settings.workspace?.accessToken ? '#4285f4' : 'rgba(66, 133, 244, 0.3)'}`,
                                            borderRadius: '16px',
                                            padding: '12px',
                                            color: settings.workspace?.accessToken ? 'white' : '#4285f4',
                                            fontSize: '14px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <Globe size={16} />
                                        {settings.workspace?.accessToken ? 'Account Linked' : 'Connect with Google'}
                                    </button>
                                </div>
                            );
                        }
                        return null;
                    })()}
                />
            )}
        </main>
    );
}

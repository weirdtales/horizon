import fs from 'fs';
import path from 'path';
import { AppSettings } from './types';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export const defaultSettings: AppSettings = {
    loopia: {},
    cloudflare: {},
    unifi: {},
    proxmox: {},
    radarr: {},
    sonarr: {},
    homeassistant: {},
    dockge: {},
    adguard: {},
    pihole: {},
    npm: {},
    uptimekuma: {},
    immich: {},
    plex: {},
    scrypted: {},
    glances: {},
    weather: { location: 'London', units: 'metric' },
    dashboard: {
        rows: [
            {
                id: 'row-main',
                name: 'Home Hub',
                sections: [
                    {
                        id: 'sec-main',
                        name: 'Network & Systems',
                        layout: [
                            { i: 'weather', x: 0, y: 0, w: 6, h: 4 },
                            { i: 'unifi', x: 6, y: 0, w: 6, h: 4 },
                            { i: 'proxmox', x: 0, y: 4, w: 6, h: 2 },
                        ],
                    },
                ],
            },
        ],
        widgetSizes: {
            weather: 'large',
            unifi: 'large',
            proxmox: 'wide',
        },
    },
    navigation: [
        { id: 'home', label: 'Dashboard', icon: 'Home', path: '/', visible: true },
        { id: 'loopia', label: 'Loopia Domains', icon: 'Globe', path: '/loopia', visible: true },
        { id: 'npm', label: 'Nginx Proxy Manager', icon: 'Shield', path: '/npm', visible: true },
        { id: 'settings', label: 'Global Settings', icon: 'Settings', path: '/settings', visible: true },
    ],
    appearance: {
        theme: 'dark',
        accentColor: 'blue',
        showHeaderStats: false,
    },
    bookmarks: [],
};

export function getSettings(): AppSettings {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            if (!parsed.dashboard || !parsed.dashboard.rows) {
                parsed.dashboard = defaultSettings.dashboard;
            }
            if (!parsed.navigation) {
                parsed.navigation = defaultSettings.navigation;
            }
            if (!parsed.bookmarks) {
                parsed.bookmarks = defaultSettings.bookmarks;
            }
            return parsed;
        }
    } catch (err) {
        console.error('Error reading settings.json:', err);
    }
    return defaultSettings;
}

export function saveSettings(newSettings: Partial<AppSettings>) {
    const current = getSettings();
    const merged = { ...current, ...newSettings };

    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
        fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
}

export { type AppSettings, type NavItem, type Bookmark, type DashboardRow, type DashboardSection } from './types';

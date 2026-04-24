export interface NavItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    visible: boolean;
    isIframe?: boolean;
}

export interface Bookmark {
    id: string;
    name: string;
    url: string;
    icon: string;
    color?: string;
    size?: 'square' | 'wide';
}

export type DashboardLayoutItem = string | { i: string; x: number; y: number; w: number; h: number; [key: string]: unknown };

export interface DashboardSection {
    id: string;
    name: string;
    hideTitle?: boolean;
    layout: DashboardLayoutItem[];
}

export interface DashboardRow {
    id: string;
    name: string;
    hideTitle?: boolean;
    layout?: 'stacked' | 'split';
    sections: DashboardSection[];
}

export type AppSettings = {
    loopia: { user?: string; password?: string };
    cloudflare: { token?: string; accountId?: string };
    unifi: { host?: string; user?: string; password?: string; site?: string };
    proxmox: { host?: string; tokenId?: string; tokenSecret?: string };
    radarr: { url?: string; apiKey?: string };
    sonarr: { url?: string; apiKey?: string };
    homeassistant: { url?: string; token?: string };
    dockge: { url?: string; user?: string; password?: string };
    adguard: { url?: string; user?: string; password?: string };
    pihole: { url?: string; token?: string };
    npm: { url?: string; user?: string; password?: string }; 
    uptimekuma: { url?: string; user?: string; password?: string };
    immich: { url?: string; apiKey?: string };
    plex: { url?: string; token?: string; authMethod?: 'token' | 'plex_login'; serverName?: string; machineId?: string; allowInsecure?: boolean };
    scrypted: { url?: string; user?: string; password?: string };
    glances: { url?: string };
    weather: { location?: string; apiKey?: string; units?: 'metric' | 'imperial' };
    dashboard: { rows: DashboardRow[]; widgetSizes?: Record<string, string> };
    navigation: NavItem[];
    appearance: {
        theme: 'light' | 'dark' | 'system' | 'time';
        accentColor: string;
        showHeaderStats?: boolean;
        userName?: string;
        bgType?: 'color' | 'image' | 'default';
        bgImage?: string;
        bgColor?: string;
        backgroundColor?: string;
        backgroundImage?: string;
        dayStart?: number;
        nightStart?: number;
    };
    bookmarks: Bookmark[];
    modules?: Record<string, { enabled: boolean }>;
    workspace?: { clientId?: string; clientSecret?: string; accessToken?: string; refreshToken?: string; expiryDate?: number };
    [key: string]: unknown;
};

export interface ModuleField {
    key: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: { label: string, value: string }[];
    helpText?: string;
}

export interface ModuleManifest {
    id: string;
    name: string;
    icon: string;
    color: string;
    hasWidget?: boolean;
    hasView?: boolean;
    hidden?: boolean;
    configFields?: ModuleField[];
}

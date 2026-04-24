"use client";

import React from 'react';
import {
    Home, Globe, Cloud, LayoutDashboard, Settings, Wifi, Shield, Activity, 
    Image as ImageIcon, PlaySquare, Video, Eye, Network, Box, Server, 
    Search, Database, Cpu, HardDrive, Bell, Mail, ListTodo, StickyNote, Lock, Unlock, 
    PlayCircle, Monitor, Smartphone, Terminal, Link as LinkIcon, ExternalLink,
    GitBranch, Package, Zap, LifeBuoy, User, Users, Folder, FileText, List, 
    Tv, Radio, Music, Gamepad, Coffee, Heart, Star, Map, Speaker, Code, Command,
    FlaskConical, Compass, Anchor, Wind, Sun, Moon, Ghost, Skull, Tablet,
    Maximize2, Minimize2, Trash, Power, CloudRain, ArrowUpCircle, GripHorizontal, 
    X, Plus, Save, Pencil, Download, Upload, RefreshCcw, Layout
} from 'lucide-react';

export const ICON_COMPONENTS: Record<string, React.ElementType> = {
    Home, Globe, LayoutDashboard, Settings, Cloud, Wifi, Shield, Activity, 
    ImageIcon, PlaySquare, Video, Eye, Network, Box, Server,
    Search, Database, Cpu, HardDrive, Bell, Mail, ListTodo, StickyNote, Lock, Unlock, 
    PlayCircle, Monitor, Smartphone, Terminal, LinkIcon, ExternalLink,
    GitBranch, Package, Zap, LifeBuoy, User, Users, Folder, FileText, List, 
    Tv, Radio, Music, Gamepad, Coffee, Heart, Star, Map, Speaker, Code, Command,
    FlaskConical, Compass, Anchor, Wind, Sun, Moon, Ghost, Skull, Tablet, Maximize2, Minimize2,
    Trash, Power, CloudRain, ArrowUpCircle, GripHorizontal, X, Plus, Save, Pencil, 
    Download, Upload, RefreshCcw, Layout
};

export const COMMON_ICONS = [
    'Home', 'LayoutDashboard', 'Globe', 'Settings', 'Cloud', 'Wifi', 'Shield', 'Activity', 
    'ImageIcon', 'PlaySquare', 'Video', 'Network', 'Box', 'Server',
    'Search', 'Database', 'Cpu', 'HardDrive', 'Bell', 'Mail', 'ListTodo', 'StickyNote', 'Lock', 'Unlock', 
    'PlayCircle', 'Monitor', 'Smartphone', 'Terminal', 'LinkIcon', 'ExternalLink',
    'GitBranch', 'Package', 'Zap', 'LifeBuoy', 'User', 'Users', 'Folder', 'FileText', 'List', 
    'Tv', 'Radio', 'Music', 'Gamepad', 'Coffee', 'Heart', 'Star', 'Map', 'Speaker', 'Code', 'Command',
    'FlaskConical', 'Compass', 'Anchor', 'Wind', 'Sun', 'Moon', 'Ghost', 'Skull', 'Tablet',
    'Layout'
];

interface DashboardIconProps {
    icon: string;
    size?: number;
    color?: string;
    style?: React.CSSProperties;
}

export const DashboardIcon = ({ icon, size = 24, color, style }: DashboardIconProps) => {
    if (!icon) return <Globe size={size} style={style} />;

    // Handle internal Lucide icons (legacy or explicit)
    if (icon.startsWith('lucide:')) {
        const name = icon.replace('lucide:', '');
        const Icon = ICON_COMPONENTS[name] || Globe;
        return <Icon size={size} style={{ color, ...style }} />;
    }

    // Handle Iconify (mdi:xxx, simple-icons:xxx, etc.)
    if (icon.includes(':')) {
        // e.g. mdi:home, simple-icons:plex
        const url = `https://api.iconify.design/${icon}.svg?color=${encodeURIComponent(color || 'currentColor')}`;
        return (
            <img 
                src={url} 
                alt={icon} 
                style={{ width: size, height: size, objectFit: 'contain', ...style }} 
            />
        );
    }

    // Handle Custom URLs
    if (icon.startsWith('http')) {
        return (
            <img 
                src={icon} 
                alt="Custom" 
                style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px', ...style }} 
            />
        );
    }

    // Legacy Fallback (plain string like "Globe")
    const Icon = ICON_COMPONENTS[icon] || Globe;
    return <Icon size={size} style={{ color, ...style }} />;
};

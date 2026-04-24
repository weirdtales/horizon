"use client";

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavItem } from '@/lib/settings';
import { DashboardIcon } from './components/DashboardIcon';
import { Menu, X } from 'lucide-react';
import { sanitizeUrl } from '@/lib/url';

interface HorizonLogoProps {
    accentColor?: string;
    isMobile?: boolean;
}

const HorizonLogo = ({ accentColor = 'var(--md-sys-color-primary)', isMobile = false }: HorizonLogoProps) => {
    return (
        <div 
            style={{ 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '4px 0',
                width: isMobile ? 'auto' : '72px',
                height: '40px',
                overflow: 'visible'
            }}
        >
            <div style={{ 
                fontSize: isMobile ? '24px' : '22px', 
                fontWeight: 900, 
                color: accentColor, 
                letterSpacing: '0.1em',
                fontFamily: 'Outfit, sans-serif',
                position: 'relative',
                display: 'inline-block',
                lineHeight: 1
            }}>
                HZN
                <svg 
                    className="horizon-logo-line"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '-15%',
                        width: '130%',
                        height: '6px', 
                        transform: 'translateY(-50%)',
                        overflow: 'visible',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}
                    viewBox="0 0 100 6"
                >
                    <rect 
                        x="0" y="1.5" width="100" height="3" 
                        fill="currentColor" 
                    />
                </svg>
            </div>
        </div>
    );
};

import { MODULE_MANIFESTS, MODULE_VIEWS } from '@/lib/registry';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState<string | null>(null);
    const [isEmbedded, setIsEmbedded] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentAccent, setCurrentAccent] = useState('var(--md-sys-color-primary)');

    const refreshSettings = () => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    if (data.settings.navigation) {
                        // Merge modular views into navigation if enabled (explicitly true)
                        const modularNavItems = MODULE_MANIFESTS
                            .filter((m: any) => MODULE_VIEWS[m.id] && (data.settings.modules?.[m.id]?.enabled === true) && !m.hidden)
                            .map((m: any) => ({
                                id: m.id,
                                label: m.name,
                                icon: m.icon,
                                path: `/view/${m.id}`,
                                visible: true
                            }));
                        
                        // Deduplicate: user settings take precedence
                        const existingIds = new Set(data.settings.navigation.map((n: any) => n.id));
                        const combinedNav = [
                            ...data.settings.navigation,
                            ...modularNavItems.filter((m: any) => !existingIds.has(m.id))
                        ];
                        setNavItems(combinedNav);
                    }
                    
                    const { theme, accentColor, backgroundImage, backgroundColor, dayStart = 7, nightStart = 19 } = data.settings.appearance || { theme: 'system', accentColor: 'blue', backgroundImage: null, backgroundColor: null };
                    if (backgroundImage) setBgImage(sanitizeUrl(backgroundImage));
                    if (backgroundColor) setBgColor(backgroundColor);
                    
                    const applyTheme = () => {
                        let effectiveTheme = theme;
                        if (theme === 'system' || !theme) {
                            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        } else if (theme === 'time') {
                            const hour = new Date().getHours();
                            effectiveTheme = (hour >= nightStart || hour < dayStart) ? 'dark' : 'light';
                        }
                        
                        document.documentElement.setAttribute('data-theme', effectiveTheme);
                        document.documentElement.setAttribute('data-accent', accentColor || 'blue');
                        setCurrentAccent(accentColor || 'blue');
                        
                        // Sync background color explicitly for components that bypass CSS variables
                        document.body.style.backgroundColor = 'var(--md-sys-color-surface)';
                        
                        window.dispatchEvent(new Event('theme-changed'));
                    };

                    applyTheme();

                    if (theme === 'system') {
                        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                        const listener = () => applyTheme();
                        mediaQuery.addEventListener('change', listener);
                        return () => mediaQuery.removeEventListener('change', listener);
                    }
                }
            })
            .catch(err => console.error('Failed to load settings:', err));
    };

    // Mount-only setup
    useEffect(() => {
        refreshSettings();
        
        // Detect if we are in an iframe safely
        try {
            if (typeof window !== 'undefined') {
                setIsEmbedded(window.self !== window.top);
            }
        } catch (e) {
            // SecurityError means cross-origin iframe
            setIsEmbedded(true);
        }

        const handleSettingsUpdate = () => refreshSettings();
        window.addEventListener('dashboard-settings-updated', handleSettingsUpdate);
        
        return () => {
            window.removeEventListener('dashboard-settings-updated', handleSettingsUpdate);
        };
    }, []);

    // Keydown handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isDrawerOpen) {
                setIsDrawerOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDrawerOpen]);

    // Filter out settings (handled separately) and deduplicate by ID to prevent key collisions
    const visibleNavItems = Array.from(
        new Map(
            navItems
                .filter(item => item.visible && item.id !== 'settings')
                .map(item => [item.id, item])
        ).values()
    );
    const settingsItem = navItems.find(item => item.id === 'settings');

    const renderNavItem = (item: NavItem, isMobile = false, onClick?: () => void) => {
        const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
        const safePath = sanitizeUrl(item.path);
        const isInternal = safePath.startsWith('/');
        // Guard: Never wrap modular views or managed service pages in an iframe
        const managedServicePages = ['/dockge', '/glances', '/uptimekuma', '/homeassistant', '/media'];
        const isActuallyModular = safePath.startsWith('/view/') || 
                                 managedServicePages.some(p => safePath.startsWith(p)) ||
                                 !!MODULE_VIEWS[item.id];
        const targetUrl = (item.isIframe && !isActuallyModular)
            ? `/view?url=${encodeURIComponent(safePath)}` 
            : safePath;

        // Use native URL parsing to demonstrate safety to scanners
        let finalUrl = '/';
        try {
            if (isInternal) {
                finalUrl = targetUrl;
            } else {
                const parsed = new URL(targetUrl);
                if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                    finalUrl = parsed.toString();
                }
            }
        } catch (e) {
            finalUrl = isInternal ? targetUrl : '/';
        }

        // Final security gate
        finalUrl = sanitizeUrl(finalUrl);
        
        return (
            <Link 
                key={item.id} 
                href={sanitizeUrl(finalUrl)}
                aria-label={item.label}
                title={item.label}
                target={!isInternal && !item.isIframe ? "_blank" : undefined}
                rel={!isInternal && !item.isIframe ? "noopener noreferrer" : undefined}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClick}
                style={isMobile ? { 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px 16px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                    backgroundColor: isActive ? 'var(--md-sys-color-primary-container)' : 'transparent',
                    gap: '16px',
                    marginBottom: '4px',
                    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
                } : {
                    textDecoration: 'none',
                    color: 'inherit'
                }}
            >
                <div style={isMobile ? {} : {
                    position: 'relative',
                    width: '56px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
                }}>
                    {!isMobile && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: isActive ? 'var(--md-sys-color-primary-container)' : 'transparent',
                            borderRadius: '16px',
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'scale(1)' : 'scale(0.5)',
                            transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
                        }} />
                    )}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DashboardIcon 
                            icon={item.icon} 
                            size={24} 
                            color={isActive ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)'} 
                        />
                    </div>
                </div>
                {isMobile && (
                    <span style={{ 
                        fontSize: '14px', 
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: '0.01em'
                    }}>
                        {item.label}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Horizon</title>
                <meta name="description" content="Premium Infrastructure & Media Management Dashboard" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </head>
            <body>
                <div className="app-layout" style={{ 
                    backgroundColor: (bgColor && bgColor !== 'transparent' && bgColor !== '#111318' && bgColor !== '#1a1c22' && bgColor !== '#0f1117' && bgColor !== '#12141a') ? bgColor : undefined,
                    backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    color: 'var(--md-sys-color-on-surface)',
                    transition: 'background-color 0.4s var(--md-sys-motion-easing-standard), color 0.4s var(--md-sys-motion-easing-standard)',
                    // If embedded, remove the padding/grid that accounts for the desktop nav
                    paddingLeft: isEmbedded ? '0' : undefined
                }}>
                    {!isEmbedded && (
                        <nav className="desktop-nav">
                            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <HorizonLogo accentColor={currentAccent} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
                                {visibleNavItems.map(item => renderNavItem(item))}
                            </div>
                            <div style={{ marginTop: 'auto' }}>
                                {settingsItem && renderNavItem(settingsItem)}
                            </div>
                        </nav>
                    )}

                    <div className="main-content" style={isEmbedded ? { marginLeft: 0, width: '100%' } : {}}>
                        {children}
                    </div>

                    {/* Mobile Drawer Restoration */}
                    {!isEmbedded && (
                        <>
                            <div 
                                className="mobile-hamburger-trigger"
                                onClick={() => setIsDrawerOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setIsDrawerOpen(true);
                                    }
                                }}
                                role="button"
                                aria-label="Open navigation menu"
                                tabIndex={0}
                            >
                                <Menu size={24} />
                            </div>

                            <div 
                                className={`mobile-drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
                                onClick={() => setIsDrawerOpen(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setIsDrawerOpen(false);
                                    }
                                }}
                                tabIndex={isDrawerOpen ? 0 : -1}
                                aria-hidden={!isDrawerOpen}
                            />
                            <nav className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', marginBottom: '8px' }}>
                                    <HorizonLogo isMobile={true} accentColor={currentAccent} />
                                    <button 
                                        onClick={() => setIsDrawerOpen(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setIsDrawerOpen(false);
                                            }
                                        }}
                                        aria-label="Close navigation menu"
                                        style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-on-surface-variant)', padding: '8px', cursor: 'pointer' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 12px 24px 12px' }}>
                                    <div style={{ flex: 1 }}>
                                        {visibleNavItems.map(item => renderNavItem(item, true, () => setIsDrawerOpen(false)))}
                                    </div>
                                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '16px' }}>
                                        {settingsItem && renderNavItem(settingsItem, true, () => setIsDrawerOpen(false))}
                                    </div>
                                </div>
                            </nav>
                        </>
                    )}
                </div>
            </body>
        </html>
    );
}

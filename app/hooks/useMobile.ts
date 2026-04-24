"use client";

import { useState, useEffect } from 'react';

/**
 * MD3 Responsive Hook
 * Standard Breakpoints:
 * - Mobile: < 600px
 * - Tablet: 600px - 1024px
 * - Desktop: > 1024px
 */
export function useMobile(breakpoint = 600) {
    const [isMobile, setIsMobile] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Initial check
        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isHydrated ? isMobile : false;
}

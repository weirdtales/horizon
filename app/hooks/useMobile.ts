'use client';

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
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkMobile();
        const handle = requestAnimationFrame(() => setIsHydrated(true));

        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
            cancelAnimationFrame(handle);
        };
    }, [breakpoint]);

    return isHydrated ? isMobile : false;
}

import { useState, useEffect, useCallback } from 'react';

/**
 * useService - Universal hook for dashboard widgets to fetch live API data.
 * Handles loading, error states, and auto-refreshing.
 */
export function useService<T = any>(endpoint: string, intervalMs: number = 45000) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        try {
            const res = await fetch(`/api/${endpoint}`, { signal });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            
            const json = await res.json();
            
            if (json.error || json.status === 'offline') {
                setError(json.details || json.error || 'Service offline');
            } else {
                setData(json);
                setError(null);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') return;
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        const interval = setInterval(() => fetchData(controller.signal), intervalMs);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [fetchData, intervalMs]);

    return { data, loading, error, refetch: fetchData };
}

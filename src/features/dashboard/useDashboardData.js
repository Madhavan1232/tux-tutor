import { useState, useEffect, useCallback } from 'react';

/**
 * useDashboardData — fetches all dashboard data from /api/dashboard.
 * Surfaces real API errors directly to the UI without silent mock fallbacks.
 *
 * Returns: { data, loading, error, refetch }
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') ?? '';
        const res = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Server responded with ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useDashboardData] Fetch failed:', err);
          setError(err.message || 'Failed to connect to the learning server.');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, [trigger]);

  return { data, loading, error, refetch };
}

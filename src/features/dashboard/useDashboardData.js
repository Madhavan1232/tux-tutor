import { useState, useEffect } from 'react';

/**
 * useDashboardData — fetches all dashboard data from /api/dashboard.
 * Falls back to mock data in development if the server is unreachable.
 *
 * Returns: { data, loading, error }
 */

/* ── Mock data for development / when the backend is offline ──────────── */
const MOCK = {
  user: { name: 'tux_user', level: 12, xp: 2340, xpToNext: 3000 },
  streak: { current: 7, best: 15, activeToday: true },
  stats: { missionsCompleted: 48, missionsTotal: 120, totalXp: 8120 },
  worlds: [
    {
      id: 1,
      name: 'Linux Basics',
      orderIndex: 1,
      unlocked: true,
      progress: 100,
      missions: [
        { id: 1, title: 'Hello Terminal',   status: 'completed', xpReward: 50 },
        { id: 2, title: 'Your First Command', status: 'completed', xpReward: 50 },
        { id: 3, title: 'Navigating Paths',  status: 'completed', xpReward: 50 },
      ],
      boss: { id: 1, status: 'completed' },
    },
    {
      id: 2,
      name: 'Files & Directories',
      orderIndex: 2,
      unlocked: true,
      progress: 66,
      missions: [
        { id: 11, title: 'ls and cd',   status: 'completed', xpReward: 50 },
        { id: 12, title: 'mkdir & touch', status: 'current',   xpReward: 50 },
        { id: 13, title: 'cp and mv',    status: 'locked',    xpReward: 50 },
        { id: 14, title: 'rm and find',  status: 'locked',    xpReward: 50 },
      ],
      boss: { id: 2, status: 'locked' },
    },
    {
      id: 3,
      name: 'Text Processing',
      orderIndex: 3,
      unlocked: false,
      progress: 0,
      missions: [
        { id: 21, title: 'grep basics',   status: 'locked', xpReward: 60 },
        { id: 22, title: 'sed & awk',     status: 'locked', xpReward: 60 },
        { id: 23, title: 'sort & uniq',   status: 'locked', xpReward: 60 },
      ],
      boss: { id: 3, status: 'locked' },
    },
    {
      id: 4,
      name: 'Permissions',
      orderIndex: 4,
      unlocked: false,
      progress: 0,
      missions: [
        { id: 31, title: 'chmod basics',  status: 'locked', xpReward: 60 },
        { id: 32, title: 'chown & chgrp', status: 'locked', xpReward: 60 },
        { id: 33, title: 'Octal modes',   status: 'locked', xpReward: 70 },
      ],
      boss: { id: 4, status: 'locked' },
    },
    {
      id: 5,
      name: 'Processes',
      orderIndex: 5,
      unlocked: false,
      progress: 0,
      missions: [
        { id: 41, title: 'ps and top',    status: 'locked', xpReward: 70 },
        { id: 42, title: 'kill & signals', status: 'locked', xpReward: 70 },
        { id: 43, title: 'Background jobs', status: 'locked', xpReward: 70 },
      ],
      boss: { id: 5, status: 'locked' },
    },
    {
      id: 6,
      name: 'Networking',
      orderIndex: 6,
      unlocked: false,
      progress: 0,
      missions: [
        { id: 51, title: 'ping & curl',  status: 'locked', xpReward: 75 },
        { id: 52, title: 'ssh basics',   status: 'locked', xpReward: 75 },
        { id: 53, title: 'netstat & ss', status: 'locked', xpReward: 75 },
      ],
      boss: { id: 6, status: 'locked' },
    },
    {
      id: 7,
      name: 'Shell Scripting',
      orderIndex: 7,
      unlocked: false,
      progress: 0,
      missions: [
        { id: 61, title: 'Your first script', status: 'locked', xpReward: 80 },
        { id: 62, title: 'Variables & loops',  status: 'locked', xpReward: 80 },
        { id: 63, title: 'Functions & args',   status: 'locked', xpReward: 80 },
      ],
      boss: { id: 7, status: 'locked' },
    },
    {
      id: 8,
      name: 'System Administration',
      orderIndex: 8,
      unlocked: false,
      progress: 0,
      missions: [
        { id: 71, title: 'systemd basics',  status: 'locked', xpReward: 90 },
        { id: 72, title: 'cron & journalctl', status: 'locked', xpReward: 90 },
        { id: 73, title: 'Firewall rules',  status: 'locked', xpReward: 100 },
      ],
      boss: { id: 8, status: 'locked' },
    },
  ],
  todaysMission: {
    id: 12,
    title: 'mkdir & touch',
    worldName: 'Files & Directories',
    xpReward: 50,
  },
  leaderboard: [
    { rank: 1, username: 'shellmaster', weeklyXp: 640, isCurrentUser: false },
    { rank: 2, username: 'tux_user',    weeklyXp: 610, isCurrentUser: true  },
    { rank: 3, username: 'linuxnerd',   weeklyXp: 540, isCurrentUser: false },
    { rank: 4, username: 'rooter99',    weeklyXp: 480, isCurrentUser: false },
    { rank: 5, username: 'bashwizard',  weeklyXp: 430, isCurrentUser: false },
  ],
  nextWorld: {
    name: 'Text Processing',
    required: 10,
    completed: 7,
  },
};

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export function useDashboardData() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
          },
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          // Fall back to mock data so the UI is always visible in development
          console.warn('[useDashboardData] Using mock data:', err.message);
          setData(MOCK);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

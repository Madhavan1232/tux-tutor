import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UserProgressContext } from './userProgressStore';
import { clearStoredAuth, getStoredToken } from '../utils/auth';
import {
  applyCompletionToDashboard,
  applyCompletionToUser,
  applyOptimisticToDashboard,
  applyOptimisticToUser,
  calculateLevelFromXp,
  calculateXpToNext,
  isMissionCompletedInWorlds,
  mergeDefined,
} from '../utils/progressState';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * UserProgressProvider — single global source of truth for user XP, level,
 * streak, mission stats, and learning-path progress across Sidebar and Dashboard.
 */
export function UserProgressProvider({
  currentUser,
  onSyncUser,
  onProgressMutated,
  pauseInitialSync = false,
  children,
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));
  const [error, setError] = useState(null);

  const requestSeqRef = useRef(0);
  const inFlightRef = useRef(null);
  const lastFetchedAtRef = useRef(0);
  const stateRef = useRef({ dashboardData, currentUser });

  useEffect(() => {
    stateRef.current = { dashboardData, currentUser };
  }, [dashboardData, currentUser]);

  const refreshUserProgress = useCallback(
    async ({ silent = false, force = false, skipInitialLoadingState = false } = {}) => {
      const token = getStoredToken();
      if (!token) {
        if (!silent) {
          setError('No authentication token found. Please sign in.');
          setDashboardData(null);
          setLoading(false);
        }
        return null;
      }

      if (!force && inFlightRef.current) {
        return inFlightRef.current;
      }

      const reqId = ++requestSeqRef.current;
      if (!silent && !skipInitialLoadingState) {
        setLoading(true);
        setError(null);
      }

      const fetchPromise = (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/dashboard`, {
            cache: 'no-store',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            if (res.status === 401 && !silent) {
              clearStoredAuth();
            }
            const body = await res.json().catch(() => ({}));
            throw new Error(
              body.error || `Server responded with ${res.status} ${res.statusText}`
            );
          }

          const json = await res.json();
          if (reqId !== requestSeqRef.current) {
            return json;
          }

          lastFetchedAtRef.current = Date.now();
          setDashboardData(json);
          setError(null);

          if (json?.user && onSyncUser) {
            onSyncUser((prev) => {
              if (!prev) return prev;
              return mergeDefined(prev, {
                name: json.user.name,
                displayName: json.user.displayName,
                username: json.user.username,
                email: json.user.email,
                level: json.user.level,
                xp: json.user.xp,
                xpToNext: json.user.xpToNext,
                streak: json.streak?.current,
              });
            });
          }

          return json;
        } catch (err) {
          if (reqId !== requestSeqRef.current) {
            return null;
          }
          console.error('[UserProgressContext] Failed to refresh progress:', err);
          if (!silent) {
            setError(err.message || 'Failed to connect to the learning server.');
            setDashboardData(null);
          }
          return null;
        } finally {
          if (reqId === requestSeqRef.current) {
            inFlightRef.current = null;
            setLoading(false);
          }
        }
      })();

      inFlightRef.current = fetchPromise;
      return fetchPromise;
    },
    [onSyncUser]
  );

  // Initial sync once authenticated when a token exists (loading already starts true when token exists)
  useEffect(() => {
    if (!pauseInitialSync && getStoredToken()) {
      const timer = setTimeout(() => {
        void refreshUserProgress({ skipInitialLoadingState: true });
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [pauseInitialSync, refreshUserProgress]);

  const refreshIfStale = useCallback(
    async (maxAgeMs = 5000) => {
      const token = getStoredToken();
      if (!token || !stateRef.current.dashboardData) {
        return refreshUserProgress();
      }
      if (Date.now() - lastFetchedAtRef.current > maxAgeMs) {
        return refreshUserProgress({ silent: true });
      }
      return stateRef.current.dashboardData;
    },
    [refreshUserProgress]
  );

  const applyOptimisticProgress = useCallback(
    ({ missionId, earnedXp = 0, alreadyCompleted = false } = {}) => {
      onProgressMutated?.();
      // Invalidate any stale pre-completion in-flight GET so it cannot overwrite optimistic XP
      requestSeqRef.current += 1;
      inFlightRef.current = null;

      const snapshotDashboard = stateRef.current.dashboardData;
      const snapshotUser = stateRef.current.currentUser;
      const alreadyInWorlds = isMissionCompletedInWorlds(
        snapshotDashboard?.worlds,
        missionId
      );
      const effectiveXpDelta =
        alreadyCompleted || alreadyInWorlds ? 0 : Math.max(0, Number(earnedXp) || 0);

      setDashboardData((prev) =>
        applyOptimisticToDashboard(prev, {
          missionId,
          earnedXp: effectiveXpDelta,
          alreadyCompleted: alreadyCompleted || alreadyInWorlds,
        })
      );

      if (onSyncUser && effectiveXpDelta > 0) {
        onSyncUser((prev) => applyOptimisticToUser(prev, effectiveXpDelta));
      }

      return () => {
        setDashboardData(snapshotDashboard);
        onSyncUser?.(snapshotUser);
      };
    },
    [onProgressMutated, onSyncUser]
  );

  const syncCompletionResult = useCallback(
    (result, { missionId } = {}) => {
      if (!result) return;
      onProgressMutated?.();
      // Cancel older pre-completion GET responses from applying stale data
      requestSeqRef.current += 1;
      inFlightRef.current = null;

      setDashboardData((prev) => applyCompletionToDashboard(prev, result, { missionId }));
      onSyncUser?.((prev) => applyCompletionToUser(prev, result));
    },
    [onProgressMutated, onSyncUser]
  );

  const unifiedUser = useMemo(() => {
    const base = mergeDefined(currentUser, dashboardData?.user);
    const level = dashboardData?.user?.level ?? currentUser?.level ?? 1;
    const xp = dashboardData?.user?.xp ?? currentUser?.xp ?? 0;
    const resolvedLevel = Math.max(1, Number(level) || calculateLevelFromXp(xp));
    const xpToNext = dashboardData?.user?.xpToNext ?? calculateXpToNext(resolvedLevel);
    const streak = dashboardData?.streak?.current ?? currentUser?.streak ?? 0;

    return {
      ...base,
      level: resolvedLevel,
      xp,
      xpToNext,
      streak,
    };
  }, [currentUser, dashboardData]);

  const unifiedStreak = useMemo(
    () =>
      dashboardData?.streak ?? {
        current: currentUser?.streak ?? 0,
        best: currentUser?.streak ?? 0,
        activeToday: (currentUser?.streak ?? 0) > 0,
      },
    [currentUser?.streak, dashboardData?.streak]
  );

  const unifiedStats = useMemo(
    () =>
      dashboardData?.stats ?? {
        missionsCompleted: 0,
        missionsTotal: 0,
        totalXp: unifiedUser.xp ?? 0,
      },
    [dashboardData?.stats, unifiedUser.xp]
  );

  const value = useMemo(
    () => ({
      data: dashboardData,
      user: unifiedUser,
      streak: unifiedStreak,
      stats: unifiedStats,
      worlds: dashboardData?.worlds ?? [],
      todaysMission: dashboardData?.todaysMission ?? null,
      leaderboard: dashboardData?.leaderboard ?? [],
      nextWorld: dashboardData?.nextWorld ?? null,
      loading,
      error,
      refreshUserProgress,
      refreshIfStale,
      applyOptimisticProgress,
      syncCompletionResult,
    }),
    [
      dashboardData,
      unifiedUser,
      unifiedStreak,
      unifiedStats,
      loading,
      error,
      refreshUserProgress,
      refreshIfStale,
      applyOptimisticProgress,
      syncCompletionResult,
    ]
  );

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
}

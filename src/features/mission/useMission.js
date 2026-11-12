import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoredToken } from '../../utils/auth';
import { useUserProgress } from '../../context/userProgressStore';
import { estimateMissionXpReward } from '../../utils/progressState';

/**
 * useMission — Coordinates mission data fetching, start recording,
 * progressive hint unlocking, step progress persistence, and idempotent completion.
 */
export function useMission(missionId) {
  const [mission, setMission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [revealedHints, setRevealedHints] = useState([]);
  const [totalHints, setTotalHints] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isRevealingHint, setIsRevealingHint] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);

  const userProgress = useUserProgress();
  const userProgressRef = useRef(userProgress);
  useEffect(() => {
    userProgressRef.current = userProgress;
  }, [userProgress]);

  const startTimeRef = useRef(null);
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [missionId]);

  const getHeaders = useCallback(() => {
    const token = getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch mission data & record start
  const fetchMission = useCallback(async () => {
    if (!missionId) return;
    setIsLoading(true);
    setError(null);
    startTimeRef.current = Date.now();

    try {
      const res = await fetch(`/api/missions/${missionId}`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to load mission (${res.status})`);
      }

      const data = await res.json();
      if (!data.success || !data.mission) {
        throw new Error(data.error || 'Invalid mission response');
      }

      const m = data.mission;
      setMission(m);
      setTotalHints(m.totalHints || 0);
      setHintsUsed(m.hintsUsed || 0);
      setRevealedHints(m.revealedHints || []);

      if (m.userProgress?.stepsCompleted) {
        setCompletedSteps(m.userProgress.stepsCompleted);
      }

      // Record start on server if user is authenticated
      const token = getStoredToken();
      if (token) {
        fetch(`/api/missions/${missionId}/start`, {
          method: 'POST',
          headers: getHeaders(),
        }).catch((err) => console.warn('[useMission] Start recording warning:', err));
      }
    } catch (err) {
      console.error('[useMission] Error loading mission:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [missionId, getHeaders]);

  useEffect(() => {
    fetchMission();
  }, [fetchMission]);

  // Reveal a hint progressively
  const revealHint = useCallback(
    async (hintIndex) => {
      setIsRevealingHint(true);
      try {
        const res = await fetch(`/api/missions/${missionId}/hints/${hintIndex}`, {
          method: 'POST',
          headers: getHeaders(),
        });

        const data = await res.json();
        if (data.success && data.hint) {
          setRevealedHints((prev) => {
            const next = [...prev];
            next[hintIndex] = data.hint;
            return next;
          });
          setHintsUsed(data.hintsUsed || hintIndex + 1);
          return data.hint;
        } else {
          throw new Error(data.error || 'Failed to reveal hint');
        }
      } catch (err) {
        console.error('[useMission] Error revealing hint:', err);
        throw err;
      } finally {
        setIsRevealingHint(false);
      }
    },
    [missionId, getHeaders]
  );

  // Save intermediate step progress
  const saveProgress = useCallback(
    async (steps) => {
      setCompletedSteps(steps);
      const token = getStoredToken();
      if (!token) return;

      try {
        await fetch(`/api/missions/${missionId}/progress`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            stepsCompleted: steps,
            hintsUsed: revealedHints.length,
          }),
        });
      } catch (err) {
        console.warn('[useMission] Error saving progress:', err);
      }
    },
    [missionId, getHeaders, revealedHints.length]
  );

  // Final mission completion
  const completeMission = useCallback(async () => {
    setIsCompleting(true);
    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const progressCtx = userProgressRef.current;

    const alreadyCompleted = mission?.userProgress?.status === 'completed';
    const effectiveHints = Math.max(
      hintsUsed,
      revealedHints.length,
      mission?.hintsUsed || 0
    );
    const optimisticXp = alreadyCompleted
      ? 0
      : estimateMissionXpReward(mission?.xpReward, effectiveHints);

    // 1. Optimistically update shared XP & progress state immediately
    const rollbackOptimistic = progressCtx?.applyOptimisticProgress?.({
      missionId: Number(missionId),
      earnedXp: optimisticXp,
      alreadyCompleted,
    });

    try {
      // 2. Complete mission API call
      const res = await fetch(`/api/missions/${missionId}/complete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          timeElapsedSeconds: elapsedSeconds,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        rollbackOptimistic?.();
        throw new Error(data.error || 'Failed to record completion');
      }

      // Sync exact server-confirmed XP, level, and streak right away
      progressCtx?.syncCompletionResult?.(data, { missionId: Number(missionId) });
      setMission((prev) =>
        prev
          ? {
              ...prev,
              userProgress: {
                ...(prev.userProgress ?? {}),
                status: 'completed',
              },
            }
          : prev
      );

      // 3. Re-fetch full user progress from backend before triggering success animation
      if (progressCtx?.refreshUserProgress) {
        await progressCtx.refreshUserProgress({ silent: true, force: true });
      }

      // 4. Trigger TuxCelebration -> MissionComplete modal
      setCompletionResult(data);
      return data;
    } catch (err) {
      rollbackOptimistic?.();
      console.error('[useMission] Error completing mission:', err);
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }, [missionId, mission?.xpReward, mission?.hintsUsed, mission?.userProgress?.status, hintsUsed, revealedHints.length, getHeaders]);

  return {
    mission,
    isLoading,
    error,
    completedSteps,
    setCompletedSteps,
    revealedHints,
    totalHints,
    hintsUsed,
    revealHint,
    isRevealingHint,
    saveProgress,
    completeMission,
    isCompleting,
    completionResult,
    reloadMission: fetchMission,
  };
}

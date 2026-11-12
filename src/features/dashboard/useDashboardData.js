import { useCallback, useEffect } from 'react';
import { useUserProgress } from '../../context/userProgressStore';

/**
 * useDashboardData — reads unified user progress & dashboard data from
 * UserProgressContext so Dashboard, Right Rail, and Sidebar share a single
 * global source of truth.
 *
 * Returns: { data, loading, error, refetch }
 */
export function useDashboardData() {
  const progress = useUserProgress();
  const refreshIfStale = progress?.refreshIfStale;
  const refreshUserProgress = progress?.refreshUserProgress;

  useEffect(() => {
    if (refreshIfStale) {
      void refreshIfStale();
    }
  }, [refreshIfStale]);

  const refetch = useCallback(() => {
    if (refreshUserProgress) {
      return refreshUserProgress({ force: true });
    }
    return Promise.resolve(null);
  }, [refreshUserProgress]);

  return {
    data: progress?.data ?? null,
    loading: progress?.loading ?? false,
    error: progress?.error ?? null,
    refetch,
  };
}

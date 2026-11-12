// Icons: lucide-react only — do not mix libraries
import AppShell from '../../components/layout/AppShell';
import LearningPath from './path/LearningPath';
import StreakStat from './rail/StreakStat';
import LevelXp from './rail/LevelXp';
import MissionStats from './rail/MissionStats';
import TodaysMission from './rail/TodaysMission';
import WeeklyLeaderboard from './rail/WeeklyLeaderboard';
import NextWorldProgress from './rail/NextWorldProgress';
import TuxModel from '../../components/TuxModel';
import { useDashboardData } from './useDashboardData';
import { clearStoredAuth } from '../../utils/auth';
import { RefreshCw, LogIn } from 'lucide-react';
import styles from './DashboardPage.module.css';

/**
 * DashboardPage — the three-column Duolingo-style learning path dashboard.
 *
 * Layout:
 *  Sidebar (via AppShell) | Learning path | Stats rail
 */
export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();

  /* ── Loading State ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <AppShell>
        <div className={styles.loadingState} role="status" aria-live="polite">
          <TuxModel size={80} animate />
          <p className={styles.loadingText}>Loading your learning path…</p>
        </div>
      </AppShell>
    );
  }

  /* ── Error State ────────────────────────────────────────────────────── */
  if (error || !data) {
    const isAuthError =
      error?.toLowerCase().includes('token') ||
      error?.toLowerCase().includes('unauthorized') ||
      error?.toLowerCase().includes('401') ||
      error?.toLowerCase().includes('sign in');

    return (
      <AppShell>
        <div className={styles.errorState} role="alert">
          <TuxModel size={80} animate={false} />
          <h2 className={styles.errorTitle}>Failed to Load Learning Path</h2>
          <p className={styles.errorMessage}>{error || 'The server could not be reached.'}</p>
          <div className={styles.errorActions}>
            <button
              type="button"
              className={styles.retryButton}
              onClick={refetch}
            >
              <RefreshCw size={14} />
              <span>Retry Connection</span>
            </button>
            {isAuthError && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  clearStoredAuth();
                  window.location.href = '/';
                }}
              >
                <LogIn size={14} />
                <span>Sign In Again</span>
              </button>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  /* ── Right Rail ─────────────────────────────────────────────────────── */
  const rail = (
    <>
      <StreakStat />
      <div className={styles.railDivider} aria-hidden="true" />
      <LevelXp />
      <div className={styles.railDivider} aria-hidden="true" />
      <MissionStats />
      <div className={styles.railDivider} aria-hidden="true" />
      <TodaysMission mission={data?.todaysMission} />
      <div className={styles.railDivider} aria-hidden="true" />
      <WeeklyLeaderboard entries={data?.leaderboard} />
      <div className={styles.railDivider} aria-hidden="true" />
      <NextWorldProgress nextWorld={data?.nextWorld} />
    </>
  );

  return (
    <AppShell rail={rail}>
      {/* Skip-to-content link for keyboard users */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <LearningPath
        worlds={data?.worlds ?? []}
      />
    </AppShell>
  );
}

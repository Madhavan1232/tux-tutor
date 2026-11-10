import AppShell from '../../components/layout/AppShell';
import LearningPath from './path/LearningPath';
import StreakStat from './rail/StreakStat';
import LevelXp from './rail/LevelXp';
import MissionStats from './rail/MissionStats';
import TodaysMission from './rail/TodaysMission';
import WeeklyLeaderboard from './rail/WeeklyLeaderboard';
import NextWorldProgress from './rail/NextWorldProgress';
import Tux from '../../components/ui/Tux';
import { useDashboardData } from './useDashboardData';
import { RefreshCw } from 'lucide-react';
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
          <Tux mood="think" size={80} />
          <p className={styles.loadingText}>Loading your learning path…</p>
        </div>
      </AppShell>
    );
  }

  /* ── Error State ────────────────────────────────────────────────────── */
  if (error || !data) {
    return (
      <AppShell>
        <div className={styles.errorState} role="alert">
          <Tux mood="annoyed" size={80} />
          <h2 className={styles.errorTitle}>Failed to Load Learning Path</h2>
          <p className={styles.errorMessage}>{error || 'The server could not be reached.'}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={refetch}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      </AppShell>
    );
  }

  /* ── Right Rail ─────────────────────────────────────────────────────── */
  const rail = (
    <>
      <StreakStat streak={data?.streak} />
      <div className={styles.railDivider} aria-hidden="true" />
      <LevelXp user={data?.user} />
      <div className={styles.railDivider} aria-hidden="true" />
      <MissionStats stats={data?.stats} />
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
        userName={data?.user?.name ?? ''}
      />
    </AppShell>
  );
}

// Icons: lucide-react only — do not mix libraries
import { BarChart2, Medal } from 'lucide-react';
import PenguinAvatar from '../../../components/ui/PenguinAvatar';
import styles from './WeeklyLeaderboard.module.css';

/**
 * WeeklyLeaderboard — plain ranked rows with penguin avatars.
 * Current user row highlighted with dark-burgundy background.
 *
 * @param {{ rank: number, username: string, weeklyXp: number, isCurrentUser: boolean }[]} entries
 */
export default function WeeklyLeaderboard({ entries = [] }) {
  return (
    <section className={styles.section} aria-label="Weekly leaderboard">
      <div className={styles.overline}>
        <BarChart2 size={13} strokeWidth={2} aria-hidden="true" />
        <span>Weekly Ranking</span>
      </div>
      <ol className={styles.list} aria-label="Top ranked users this week">
        {entries.map((entry) => (
          <li
            key={entry.rank}
            className={`${styles.row} ${entry.isCurrentUser ? styles.you : ''}`}
            aria-current={entry.isCurrentUser ? 'true' : undefined}
          >
            <span className={styles.rankWrap} aria-label={`Rank ${entry.rank}`}>
              <Medal size={13} strokeWidth={2} className={styles.medalIcon} aria-hidden="true" />
              <span className={styles.rank}>{entry.rank}</span>
            </span>
            <PenguinAvatar
              variant={entry.isCurrentUser ? 'filled' : entry.rank === 1 ? 'outline' : 'muted'}
              size={24}
              username={entry.username}
              className={styles.avatar}
            />
            <span className={styles.username}>{entry.username}</span>
            <span className={styles.xp} aria-label={`${entry.weeklyXp} XP`}>
              {entry.weeklyXp.toLocaleString()} XP
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

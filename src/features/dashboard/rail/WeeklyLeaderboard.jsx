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
      <div className={styles.overline}>Weekly Ranking</div>
      <ol className={styles.list} aria-label="Top ranked users this week">
        {entries.map((entry) => (
          <li
            key={entry.rank}
            className={`${styles.row} ${entry.isCurrentUser ? styles.you : ''}`}
            aria-current={entry.isCurrentUser ? 'true' : undefined}
          >
            <span className={styles.rank} aria-label={`Rank ${entry.rank}`}>
              {entry.rank}
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

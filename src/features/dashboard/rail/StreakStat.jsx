import Tux from '../../../components/ui/Tux';
import styles from './StreakStat.module.css';

/**
 * StreakStat — shows current streak with an animated Tux.
 * Tux cheers when the streak is active today, else idles.
 *
 * @param {{ current: number, best: number, activeToday: boolean }} streak
 */
export default function StreakStat({ streak }) {
  const { current = 0, best = 0, activeToday = false } = streak ?? {};

  return (
    <section className={styles.section} aria-label="Daily streak">
      <div className={styles.overline}>Streak</div>
      <div className={styles.row}>
        <div className={styles.numeral}>
          <span className={styles.count} aria-label={`${current} day streak`}>
            {current}
          </span>
          <span className={styles.unit}>days</span>
        </div>
        <div className={styles.tuxSlot} aria-hidden="true">
          <Tux mood={activeToday ? 'cheer' : 'idle'} size={52} />
        </div>
      </div>
      <p className={styles.best}>Best: {best} days</p>
      {!activeToday && (
        <p className={styles.nudge}>
          Complete a mission today to keep your streak alive.
        </p>
      )}
    </section>
  );
}

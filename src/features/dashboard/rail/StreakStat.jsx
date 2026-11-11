// Icons: lucide-react only — do not mix libraries
import { Flame } from 'lucide-react';
import TuxModel from '../../../components/TuxModel';
import styles from './StreakStat.module.css';

/**
 * StreakStat — shows current streak with an animated 3D Tux.
 *
 * @param {{ current: number, best: number, activeToday: boolean }} streak
 */
export default function StreakStat({ streak }) {
  const { current = 0, best = 0, activeToday = false } = streak ?? {};

  return (
    <section className={styles.section} aria-label="Daily streak">
      <div className={styles.overline}>
        <Flame size={13} strokeWidth={2} aria-hidden="true" />
        <span>Streak</span>
      </div>
      <div className={styles.row}>
        <div className={styles.numeral}>
          <span className={styles.count} aria-label={`${current} day streak`}>
            {current}
          </span>
          <span className={styles.unit}>days</span>
        </div>
        <div className={styles.tuxSlot} aria-hidden="true">
          <TuxModel size={60} animate interactive={activeToday} />
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

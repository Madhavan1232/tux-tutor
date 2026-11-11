// Icons: lucide-react only — do not mix libraries
import { Zap } from 'lucide-react';
import ProgressBar from '../../../components/ui/ProgressBar';
import { levelLabel } from '../../../utils/levels';
import styles from './LevelXp.module.css';

/**
 * LevelXp — shows level number, rank title, and XP progress bar.
 *
 * @param {{ level: number, xp: number, xpToNext: number }} user
 */
export default function LevelXp({ user }) {
  const { level = 1, xp = 0, xpToNext = 100 } = user ?? {};
  const label = levelLabel(level);

  return (
    <section className={styles.section} aria-label="Level and experience">
      <div className={styles.overline}>
        <Zap size={13} strokeWidth={2} aria-hidden="true" />
        <span>Level &amp; XP</span>
      </div>
      <div className={styles.levelRow}>
        <span className={styles.levelNum} aria-label={label}>{label}</span>
      </div>
      <ProgressBar
        value={xp}
        max={xpToNext}
        label={`${xp} of ${xpToNext} XP to next level`}
        size="md"
      />
      <div className={styles.xpNumbers}>
        <span className={styles.xpCurrent}>
          {xp.toLocaleString()} XP
        </span>
        <span className={styles.xpNext}>
          / {xpToNext.toLocaleString()}
        </span>
      </div>
    </section>
  );
}

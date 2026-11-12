// Icons: lucide-react only — do not mix libraries
import { CheckCircle } from 'lucide-react';
import { useUserProgress } from '../../../context/userProgressStore';
import styles from './MissionStats.module.css';

/**
 * MissionStats — shows completed / total missions as large editoral numerals.
 * Reads from the global UserProgressContext unless an explicit stats prop override is passed.
 *
 * @param {{ missionsCompleted: number, missionsTotal: number, totalXp: number }} [stats]
 */
export default function MissionStats({ stats }) {
  const progress = useUserProgress();
  const resolvedStats = stats ?? progress?.stats;
  const { missionsCompleted = 0, missionsTotal = 0, totalXp = 0 } = resolvedStats ?? {};

  return (
    <section className={styles.section} aria-label="Mission progress">
      <div className={styles.overline}>Progress</div>
      <div className={styles.grid}>
        <div className={styles.item}>
          <div className={styles.valueRow}>
            <CheckCircle size={15} strokeWidth={2} className={styles.doneIcon} aria-hidden="true" />
            <span className={styles.value}>{missionsCompleted}</span>
          </div>
          <span className={styles.label}>Missions done</span>
        </div>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.item}>
          <span className={styles.value}>{missionsTotal}</span>
          <span className={styles.label}>Total missions</span>
        </div>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.item}>
          <span className={styles.value}>{totalXp.toLocaleString()}</span>
          <span className={styles.label}>Total XP</span>
        </div>
      </div>
    </section>
  );
}

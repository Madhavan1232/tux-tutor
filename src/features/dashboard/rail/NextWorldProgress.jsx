import ProgressBar from '../../../components/ui/ProgressBar';
import styles from './NextWorldProgress.module.css';

/**
 * NextWorldProgress — thin progress line showing missions needed to unlock the next world.
 *
 * @param {{ name: string, required: number, completed: number }|null} nextWorld
 */
export default function NextWorldProgress({ nextWorld }) {
  if (!nextWorld) return null;

  const { name, required, completed } = nextWorld;
  const remaining = Math.max(required - completed, 0);

  return (
    <section className={styles.section} aria-label="Next world progress">
      <div className={styles.overline}>Next World</div>
      <p className={styles.worldName}>{name}</p>
      <ProgressBar
        value={completed}
        max={required}
        label={`${completed} of ${required} missions to unlock ${name}`}
        size="sm"
      />
      <p className={styles.info}>
        {completed} / {required} missions ·{' '}
        <span className={styles.remaining}>
          {remaining} to unlock
        </span>
      </p>
    </section>
  );
}

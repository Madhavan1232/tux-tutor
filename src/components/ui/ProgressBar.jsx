import styles from './ProgressBar.module.css';

/**
 * ProgressBar — burgundy fill on a black track.
 *
 * @param {number} value  — current value
 * @param {number} max    — maximum value
 * @param {string} [label] — hidden accessible label
 * @param {'sm'|'md'|'lg'} [size]
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label = 'Progress',
  size = 'md',
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`${styles.track} ${styles[size]}`}
    >
      <div
        className={styles.fill}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

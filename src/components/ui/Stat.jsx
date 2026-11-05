import styles from './Stat.module.css';

/**
 * Stat — large editorial numeral with a small label below.
 * Used for streak count, mission stats, XP totals.
 *
 * @param {string|number} value
 * @param {string} label
 * @param {string} [className]
 */
export default function Stat({ value, label, className = '' }) {
  return (
    <div className={`${styles.stat} ${className}`}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

import styles from './SectionHeading.module.css';

/**
 * SectionHeading — typography-first section label.
 * An overline label above a heading.
 *
 * @param {string} overline   — small uppercase label above the heading
 * @param {string} heading    — main heading text
 * @param {string} [className]
 */
export default function SectionHeading({ overline, heading, className = '' }) {
  return (
    <header className={`${styles.header} ${className}`}>
      {overline && <span className={styles.overline}>{overline}</span>}
      <h2 className={styles.heading}>{heading}</h2>
    </header>
  );
}

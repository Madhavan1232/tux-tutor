import styles from './MissionNode.module.css';

/**
 * MissionNode — a single mission on the learning path.
 *
 * States:
 *  completed — solid burgundy fill, white checkmark
 *  current   — white outline, burgundy fill, "Start" label above
 *  locked    — black with subtle dark-burgundy border, dimmed
 *
 * @param {object} mission  — { id, title, status, xpReward }
 * @param {number} offset   — horizontal offset for zigzag effect (px)
 */
export default function MissionNode({ mission, offset = 0 }) {
  const { title, status, xpReward } = mission;
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  return (
    <div
      className={styles.wrapper}
      style={{ '--offset': `${offset}px` }}
      role="listitem"
    >
      {/* "Start" label above the current node */}
      {isCurrent && (
        <span className={styles.startLabel} aria-hidden="true">
          Start ↓
        </span>
      )}

      {/* The node itself */}
      <button
        className={`${styles.node} ${styles[status]}`}
        aria-label={`${title} — ${status}${xpReward ? `, ${xpReward} XP` : ''}`}
        disabled={isLocked}
        aria-disabled={isLocked}
        tabIndex={isLocked ? -1 : 0}
        title={isLocked ? 'Complete previous missions to unlock' : undefined}
      >
        {isCompleted && <span aria-hidden="true">✓</span>}
        {isCurrent && <span className={styles.dot} aria-hidden="true" />}
        {isLocked && <span className={styles.lockIcon} aria-hidden="true">●</span>}
      </button>

      {/* Mission title */}
      <span className={`${styles.title} ${isLocked ? styles.titleLocked : ''}`}>
        {title}
      </span>

      {/* XP badge for current node */}
      {isCurrent && xpReward > 0 && (
        <span className={styles.xpBadge} aria-label={`${xpReward} XP reward`}>
          +{xpReward} XP
        </span>
      )}

      {/* Connector line going down */}
      <div className={`${styles.connector} ${isLocked ? styles.connectorLocked : ''}`} aria-hidden="true" />
    </div>
  );
}

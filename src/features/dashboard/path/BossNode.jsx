import Tux from '../../../components/ui/Tux';
import styles from './BossNode.module.css';

/**
 * BossNode — the boss challenge at the end of each world.
 * Diamond/hexagon shaped, larger than a mission node.
 * Shows a Tux with the # root-prompt badge.
 *
 * @param {object} boss       — { id, status }
 * @param {string} worldName
 * @param {number} worldIndex
 */
export default function BossNode({ boss, worldName, worldIndex }) {
  const isLocked = boss?.status === 'locked';
  const isCompleted = boss?.status === 'completed';
  const isCurrent = boss?.status === 'current';

  return (
    <div className={styles.wrapper} role="listitem">
      {/* Connector from last mission */}
      <div className={`${styles.connector} ${isLocked ? styles.locked : ''}`} aria-hidden="true" />

      {/* Tux with root badge */}
      <div className={styles.tuxSlot} aria-hidden="true">
        <Tux mood={isLocked ? 'sleep' : isCompleted ? 'cheer' : 'think'} size={44} />
      </div>

      {/* Boss diamond node */}
      <button
        className={`${styles.node} ${isLocked ? styles.nodeLocked : ''} ${isCompleted ? styles.nodeCompleted : ''} ${isCurrent ? styles.nodeCurrent : ''}`}
        aria-label={`Boss Challenge — World ${worldIndex}: ${worldName}. Status: ${boss?.status ?? 'locked'}`}
        disabled={isLocked}
        aria-disabled={isLocked}
        tabIndex={isLocked ? -1 : 0}
      >
        <span className={styles.diamond} aria-hidden="true">
          {isCompleted ? '✓' : '#'}
        </span>
      </button>

      <span className={`${styles.label} ${isLocked ? styles.labelLocked : ''}`}>
        Boss · {worldName}
      </span>
    </div>
  );
}

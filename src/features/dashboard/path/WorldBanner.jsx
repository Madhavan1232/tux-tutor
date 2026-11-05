import Tux from '../../../components/ui/Tux';
import MissionNode from './MissionNode';
import BossNode from './BossNode';
import styles from './WorldBanner.module.css';

/**
 * WorldBanner — a single world in the learning path.
 * Expanded = show missions as nodes on a zigzag path.
 * Collapsed = thin progress bar, click to expand.
 *
 * States:
 *  completed — burgundy banner, Tux cheering (wings up)
 *  current   — burgundy banner, expanded by default
 *  locked    — black banner, Tux sleeping, collapsed
 *
 * @param {object} world
 * @param {boolean} isExpanded
 * @param {function} onToggle
 */
export default function WorldBanner({ world, isExpanded, onToggle }) {
  const { name, orderIndex, progress, unlocked, missions = [], boss } = world;

  /* Determine world state */
  const allDone = missions.every((m) => m.status === 'completed') && boss?.status === 'completed';
  const worldState = !unlocked ? 'locked' : allDone ? 'completed' : 'current';

  const tuxMood =
    worldState === 'completed' ? 'cheer' :
    worldState === 'locked'    ? 'sleep' :
    'idle';

  /* Completed count */
  const completedCount = missions.filter((m) => m.status === 'completed').length;

  return (
    <section
      className={`${styles.banner} ${styles[worldState]} ${unlocked ? styles.unlocked : ''}`}
      aria-label={`World ${orderIndex}: ${name}`}
    >
      {/* Banner Header — always visible */}
      <button
        className={styles.header}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`world-${world.id}-content`}
      >
        <div className={styles.meta}>
          <span className={styles.overline}>
            {worldState === 'locked' ? 'LOCKED' : `WORLD ${orderIndex}`}
          </span>
          <h3 className={styles.worldName}>{name}</h3>

          {/* Collapsed progress line */}
          {!isExpanded && unlocked && (
            <div className={styles.collapseProgress}>
              <div
                className={styles.collapseBar}
                style={{ width: `${progress ?? 0}%` }}
                aria-label={`${Math.round(progress ?? 0)}% complete`}
              />
            </div>
          )}

          {!isExpanded && (
            <span className={styles.progressText}>
              {unlocked
                ? `${completedCount} / ${missions.length} missions`
                : 'Complete the previous world to unlock'}
            </span>
          )}
        </div>

        {/* Tux mascot on the right */}
        <div className={styles.tuxSlot} aria-hidden="true">
          <Tux mood={tuxMood} size={52} />
        </div>

        {/* Chevron */}
        <span className={styles.chevron} aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* ── Expanded Path ─────────────────────────────────────────── */}
      {isExpanded && (
        <div
          id={`world-${world.id}-content`}
          className={styles.path}
          role="list"
          aria-label={`Missions for World ${orderIndex}: ${name}`}
        >
          {missions.map((mission, idx) => {
            /* Zigzag: even = slightly left, odd = slightly right */
            const offset = idx % 2 === 0 ? -30 : 30;
            return (
              <MissionNode
                key={mission.id}
                mission={mission}
                offset={offset}
              />
            );
          })}

          {/* Boss node at the end */}
          {boss && (
            <BossNode
              boss={boss}
              worldName={name}
              worldIndex={orderIndex}
            />
          )}
        </div>
      )}
    </section>
  );
}

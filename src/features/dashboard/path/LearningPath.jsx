import { useState } from 'react';
import WorldBanner from './WorldBanner';
import styles from './LearningPath.module.css';

/**
 * LearningPath — the main center column of the dashboard.
 * Maps worlds to WorldBanners.
 * Only the current (first unlocked + incomplete) world is expanded by default.
 *
 * @param {object[]} worlds — from /api/dashboard
 * @param {string}   userName
 */
export default function LearningPath({ worlds = [], userName = '' }) {
  /* Find the current world index (first unlocked + not fully done) */
  const defaultExpandedId = (() => {
    const currentWorld = worlds.find((w) => {
      if (!w.unlocked) return false;
      const allDone =
        w.missions.every((m) => m.status === 'completed') &&
        (w.boss?.status === 'completed' || !w.boss);
      return !allDone;
    });
    return currentWorld?.id ?? worlds[0]?.id;
  })();

  const [expandedId, setExpandedId] = useState(defaultExpandedId);

  const toggleWorld = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      {/* Greeting */}
      <p className={styles.greeting}>
        Welcome back{userName ? `, ${userName}` : ''}.
      </p>

      {/* World banners */}
      <div className={styles.worldList} role="list" aria-label="Learning worlds">
        {worlds.map((world) => (
          <div key={world.id} role="listitem">
            <WorldBanner
              world={world}
              isExpanded={expandedId === world.id}
              onToggle={() => toggleWorld(world.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

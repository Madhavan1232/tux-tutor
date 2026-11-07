import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import WorldBanner from './WorldBanner';
import styles from './LearningPath.module.css';

/**
 * LearningPath — The centerpiece Duolingo-style learning roadmap.
 * Maps all worlds to themed, gamified zones with winding snake mission paths.
 *
 * @param {object[]} worlds — array of world objects from /api/dashboard
 * @param {string} userName — current user's display name
 */
export default function LearningPath({ worlds = [], userName = '' }) {
  // Find current active world (first unlocked world that isn't fully completed)
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

  // Allow independent toggling of worlds
  const [expandedIds, setExpandedIds] = useState(() => new Set(defaultExpandedId ? [defaultExpandedId] : []));

  const toggleWorld = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const completedWorldsCount = worlds.filter(
    (w) =>
      w.unlocked &&
      w.missions.length > 0 &&
      w.missions.every((m) => m.status === 'completed') &&
      (!w.boss || w.boss.status === 'completed')
  ).length;

  return (
    <div className={styles.container}>
      {/* ── Greeting & Roadmap Summary ─────────────────────────────── */}
      <div className={styles.headerArea}>
        <div className={styles.welcomePill}>
          <Compass size={13} className={styles.compassIcon} />
          <span>Linux Mastery Path</span>
        </div>

        <h1 className={styles.greeting}>
          Welcome back{userName ? `, ${userName}` : ''}.
        </h1>

        <p className={styles.subtitle}>
          Master terminal commands, core utilities, and sysadmin skills through interactive mission tracks.
          {worlds.length > 0 && (
            <span className={styles.statusSummary}>
              {' '}· <strong>{completedWorldsCount}</strong> of <strong>{worlds.length}</strong> Worlds Cleared
            </span>
          )}
        </p>
      </div>

      {/* ── Themed World Banners with Winding Paths ──────────────────── */}
      <div className={styles.worldList} role="list" aria-label="Learning worlds">
        {worlds.map((world) => (
          <div key={world.id} role="listitem">
            <WorldBanner
              world={world}
              isExpanded={expandedIds.has(world.id)}
              onToggle={() => toggleWorld(world.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

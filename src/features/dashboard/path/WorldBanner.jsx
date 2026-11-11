// Icons: lucide-react only — do not mix libraries
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ChevronDown, BadgeCheck, Route } from 'lucide-react';
import TuxModel from '../../../components/TuxModel';
import MissionNode from './MissionNode';
import BossNode from './BossNode';
import SnakePathSvg from './SnakePathSvg';
import { getWorldTheme } from './worldThemes';
import styles from './WorldBanner.module.css';

/**
 * WorldBanner — A themed World zone containing an organic snake learning path.
 *
 * Implements:
 *  - Zone-specific atmospheric background & gradients (Terminal green, Ocean blue, etc.)
 *  - Winding left-right S-curve Duolingo/Mimo snake path with responsive single-column collapse
 *  - Visually distinct mission nodes & golden boss node
 *  - Continuous glowing path animations
 *
 * @param {object} world — { id, name, orderIndex, progress, unlocked, missions, boss }
 * @param {boolean} isExpanded — whether the world path is open
 * @param {function} onToggle — toggle expand handler
 */
export default function WorldBanner({ world, isExpanded, onToggle }) {
  const { id, name, orderIndex = 1, progress = 0, unlocked = false, missions = [], boss } = world;
  const theme = getWorldTheme(orderIndex);

  // Responsive mobile collapse detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 520);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine world completion state
  const allMissionsDone = missions.length > 0 && missions.every((m) => m.status === 'completed');
  const bossDone = boss ? boss.status === 'completed' : true;
  const isWorldCompleted = unlocked && allMissionsDone && bossDone;
  const isCurrentWorld = unlocked && !isWorldCompleted;
  const isLockedWorld = !unlocked;

  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const totalMissionsCount = missions.length + (boss ? 1 : 0);

  // ── Calculate Snake Path Coordinates ──────────────────────────────
  // Desktop S-curve horizontal offsets (in px relative to center 200 in 400px viewBox)
  const DESKTOP_OFFSETS = [0, 72, 95, 52, 0, -52, -95, -72];

  const allItems = [...missions];
  if (boss) {
    allItems.push({ ...boss, isBoss: true, title: `Boss · ${name}`, xpReward: 150 });
  }

  const ROW_HEIGHT = 125;
  const TOP_PADDING = 70;
  const BOTTOM_PADDING = 80;
  const totalPathHeight = TOP_PADDING + (Math.max(allItems.length - 1, 0)) * ROW_HEIGHT + BOTTOM_PADDING;

  const points = allItems.map((item, idx) => {
    const isBossItem = idx === allItems.length - 1 && !!boss;
    // On mobile collapse to single column (offset = 0)
    const rawOffset = isBossItem ? 0 : DESKTOP_OFFSETS[idx % DESKTOP_OFFSETS.length];
    const offset = isMobile ? 0 : rawOffset;
    const x = 200 + offset;
    const y = TOP_PADDING + idx * ROW_HEIGHT;
    const xPercent = (x / 400) * 100;

    return {
      x,
      y,
      xPercent,
      status: item.status,
      item,
      isBoss: isBossItem,
    };
  });

  return (
    <section
      className={`${styles.banner} ${
        isWorldCompleted ? styles.completed : isCurrentWorld ? styles.current : styles.locked
      }`}
      style={{
        '--world-accent': theme.accent,
        '--world-accent-hover': theme.accentHover,
        '--world-accent-glow': theme.accentGlow,
        '--world-card-bg': theme.cardBg,
        '--world-border': theme.borderColor,
      }}
      aria-label={`World ${orderIndex}: ${name}`}
    >
      {/* ── Banner Header ────────────────────────────────────────── */}
      <button
        type="button"
        className={styles.header}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`world-${id}-path`}
      >
        <div className={styles.headerLeft}>
          {/* Zone Overline Tag */}
          <div className={styles.zoneTagRow}>
            <span
              className={styles.zoneTag}
              style={{
                backgroundColor: isLockedWorld ? 'rgba(255, 255, 255, 0.06)' : theme.tagBg,
                color: isLockedWorld ? 'rgba(255, 255, 255, 0.5)' : theme.headerColor,
                borderColor: isLockedWorld ? 'rgba(255, 255, 255, 0.1)' : theme.borderColor,
              }}
            >
              {isLockedWorld ? 'LOCKED ZONE' : theme.zoneTag}
            </span>

            {isWorldCompleted && (
              <span className={styles.clearedBadge}>
                <BadgeCheck size={13} strokeWidth={2} aria-hidden="true" />
                CLEARED
              </span>
            )}
          </div>

          {/* World Name Title */}
          <h3 className={styles.worldName}>
            {isLockedWorld && <Lock size={18} strokeWidth={2} className={styles.lockIconInline} aria-hidden="true" />}
            {name}
          </h3>

          {/* Progress Bar & Counter */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${Math.round(progress)}%`,
                  backgroundColor: isWorldCompleted ? '#F59E0B' : theme.accent,
                  boxShadow: `0 0 10px ${theme.accentGlow}`,
                }}
              />
            </div>
            <span className={styles.progressLabel}>
              {isLockedWorld
                ? `Complete World ${orderIndex - 1} to unlock`
                : `${completedCount} of ${totalMissionsCount} completed · ${Math.round(progress)}%`}
            </span>
          </div>
        </div>

        {/* Header Right: Tux Mascot + Chevron */}
        <div className={styles.headerRight}>
          <div className={styles.tuxContainer} aria-hidden="true">
            <TuxModel
              size={64}
              animate={!isLockedWorld}
              interactive={!isLockedWorld}
              locked={isLockedWorld}
            />
          </div>

          <motion.div
            className={styles.chevronWrap}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} className={styles.chevron} />
          </motion.div>
        </div>
      </button>

      {/* ── Expanded Winding Snake Path ──────────────────────────── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`world-${id}-path`}
            className={styles.pathZone}
            style={{
              background: theme.bgGradient,
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Subtle Tech Grid / Scanline Texture */}
            <div className={styles.gridOverlay} aria-hidden="true" />

            {/* Path Subheader Bar */}
            <div className={styles.pathHeaderBar}>
              <span className={styles.pathSubheader}>
                <Route size={13} strokeWidth={2} className={styles.pathIcon} aria-hidden="true" />
                {isMobile ? 'Single-Column Mobile Path' : 'Winding Mission Path'}
              </span>
              <span className={styles.pathHint}>
                {isWorldCompleted ? 'All Missions Cleared!' : 'Advance along the path'}
              </span>
            </div>

            {/* Snake Path Arena */}
            <div
              className={styles.pathArena}
              style={{ height: `${totalPathHeight}px` }}
              role="list"
              aria-label={`Learning path for ${name}`}
            >
              {/* Continuous S-Curved SVG Path */}
              <SnakePathSvg
                points={points}
                theme={theme}
                width={400}
                height={totalPathHeight}
              />

              {/* Render Nodes Centered along the Curve */}
              {points.map((pt, idx) => {
                const nodeStyle = {
                  left: `${pt.xPercent}%`,
                  top: `${pt.y}px`,
                };

                if (pt.isBoss) {
                  return (
                    <BossNode
                      key={`boss-${id}`}
                      boss={boss}
                      worldName={name}
                      worldIndex={orderIndex}
                      theme={theme}
                      style={nodeStyle}
                    />
                  );
                }

                return (
                  <MissionNode
                    key={pt.item.id}
                    mission={pt.item}
                    theme={theme}
                    index={idx}
                    style={nodeStyle}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

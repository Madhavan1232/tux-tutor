// Icons: lucide-react only — do not mix libraries
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ChevronDown, Check, Route, BookOpen } from 'lucide-react';
import TuxModel from '../../../components/TuxModel';
import MissionNode from './MissionNode';
import BossNode from './BossNode';
import SnakePathSvg from './SnakePathSvg';
import { getWorldTheme } from './worldThemes';
import styles from './WorldBanner.module.css';

// Map world orderIndex → bundled PDF asset
import pdf01 from '../../../assets/learning_materials/Module_01_Linux_Basics.pdf';
import pdf02 from '../../../assets/learning_materials/Module_02_Files_and_Directories.pdf';
import pdf03 from '../../../assets/learning_materials/Module_03_Text_Processing.pdf';
import pdf04 from '../../../assets/learning_materials/Module_04_Permissions.pdf';
import pdf05 from '../../../assets/learning_materials/Module_05_Processes.pdf';
import pdf06 from '../../../assets/learning_materials/Module_06_Networking.pdf';
import pdf07 from '../../../assets/learning_materials/Module_07_Shell_Scripting.pdf';
import pdf08 from '../../../assets/learning_materials/Module_08_System_Administration.pdf';

const WORLD_PDFS = {
  1: pdf01,
  2: pdf02,
  3: pdf03,
  4: pdf04,
  5: pdf05,
  6: pdf06,
  7: pdf07,
  8: pdf08,
};

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

  const pdfUrl = WORLD_PDFS[orderIndex] ?? null;

  const handleOpenPdf = (e) => {
    e.stopPropagation(); // prevent toggling the world banner
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Determine world completion state
  const allMissionsDone = missions.length > 0 && missions.every((m) => m.status === 'completed');
  const bossDone = boss ? boss.status === 'completed' : true;
  const isWorldCompleted = unlocked && allMissionsDone && bossDone;
  const isCurrentWorld = unlocked && !isWorldCompleted;
  const isLockedWorld = !unlocked;

  const completedCount =
    missions.filter((m) => m.status === 'completed').length +
    (boss?.status === 'completed' ? 1 : 0);
  const totalMissionsCount = missions.length + (boss ? 1 : 0);
  const estimatedMinutes = Math.max(5, Math.round(totalMissionsCount * 7.5));

  // ── Calculate Snake Path Coordinates ──────────────────────────────
  // Desktop S-curve horizontal offsets (in px relative to center 200 in 400px viewBox)
  const DESKTOP_OFFSETS = [0, 72, 95, 52, 0, -52, -95, -72];

  const allItems = [...missions];
  if (boss) {
    allItems.push({ ...boss, isBoss: true, title: `Boss · ${name}`, xpReward: 150 });
  }

  const ROW_HEIGHT = 136;
  const BOSS_EXTRA_GAP = 64;
  const TOP_LEAD_IN = 60;
  const TOP_PADDING = 96;
  const BOTTOM_PADDING = 130;

  const points = [];
  let currentY = TOP_PADDING;
  for (let idx = 0; idx < allItems.length; idx++) {
    const item = allItems[idx];
    const isBossItem = idx === allItems.length - 1 && !!boss;
    if (idx > 0) {
      currentY += isBossItem ? ROW_HEIGHT + BOSS_EXTRA_GAP : ROW_HEIGHT;
    }
    // On mobile collapse to single column (offset = 0)
    const rawOffset = isBossItem ? 0 : DESKTOP_OFFSETS[idx % DESKTOP_OFFSETS.length];
    const offset = isMobile ? 0 : rawOffset;
    const x = 200 + offset;
    const xPercent = (x / 400) * 100;

    points.push({
      x,
      y: currentY,
      xPercent,
      status: item.status,
      item,
      isBoss: isBossItem,
    });
  }

  const lastY = points.length > 0 ? points[points.length - 1].y : TOP_PADDING;
  const totalPathHeight = lastY + BOTTOM_PADDING;

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
              className={`${styles.zoneTag} ${
                isLockedWorld ? styles.zoneTagLocked : styles.zoneTagUnlocked
              }`}
            >
              {isLockedWorld ? 'LOCKED MODULE' : theme.zoneTag}
            </span>

            {isWorldCompleted && (
              <span className={styles.clearedBadge}>
                <Check size={11} strokeWidth={2.5} aria-hidden="true" />
                Cleared
              </span>
            )}

            {/* Study Material PDF button — shown for all worlds */}
            {pdfUrl && (
              <button
                type="button"
                className={styles.pdfBtn}
                onClick={handleOpenPdf}
                aria-label={`Open study material for ${name}`}
                title="Open Study Material PDF"
              >
                <BookOpen size={12} strokeWidth={2.5} aria-hidden="true" />
                Study Material
              </button>
            )}
          </div>

          {/* World Name Title */}
          <h3 className={styles.worldName}>
            {isLockedWorld && <Lock size={18} strokeWidth={2} className={styles.lockIconInline} aria-hidden="true" />}
            {name}
          </h3>

          {/* Progress Bar & Counter */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBarRow}>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${Math.round(progress)}%` }}
                />
              </div>
              {!isLockedWorld && (
                <span className={styles.progressPercent}>{Math.round(progress)}%</span>
              )}
            </div>
            <span className={styles.progressLabel}>
              {isLockedWorld
                ? `Complete Module ${String(orderIndex - 1).padStart(2, '0')} to unlock`
                : `${completedCount} / ${totalMissionsCount} ${totalMissionsCount === 1 ? 'mission' : 'missions'} completed`}
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
                {`${totalMissionsCount} ${totalMissionsCount === 1 ? 'mission' : 'missions'} · ~${estimatedMinutes} min`}
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
                leadInLength={TOP_LEAD_IN}
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

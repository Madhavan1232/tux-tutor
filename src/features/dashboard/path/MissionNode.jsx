// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Lock, Play, Zap } from 'lucide-react';
import styles from './MissionNode.module.css';

/**
 * MissionNode — A Duolingo-style gamified learning node on the winding snake path.
 *
 * States:
 *  - completed: filled with theme accent, crisp checkmark, slight glow
 *  - current: animated pulsing radar rings, brighter color, floating "START ↓" badge
 *  - locked: grayed out surface, lock icon, dimmed title
 *
 * @param {object} mission — { id, title, status, xpReward }
 * @param {object} theme — WorldTheme object
 * @param {number} index — Index of node for staggered entry animation
 * @param {object} [style] — Coordinate position styling
 */
export default function MissionNode({ mission, theme, index = 0, style }) {
  const navigate = useNavigate();
  const { title, status, xpReward = 40 } = mission;
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  return (
    <div className={styles.wrapper} style={style} role="listitem">
      <motion.div
        className={styles.motionInner}
        initial={{ opacity: 0, scale: 0.75, y: 15 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          duration: 0.45,
          delay: Math.min(index * 0.08, 0.4),
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* ── 1. The Gamified Node Button (centered on SVG waypoint) ── */}
        <div className={styles.nodeContainer}>
          {isCurrent && (
            <div className={styles.startBadge} aria-hidden="true">
              <span className={styles.startBadgeText}>
                <Play size={10} strokeWidth={2.2} aria-hidden="true" />
                <span>START</span>
              </span>
            </div>
          )}
        {/* Continuous Radar Pulse Rings for Current Node */}
        {isCurrent && (
          <>
            <span
              className={styles.pulseRing}
              style={{ borderColor: theme.accent, boxShadow: `0 0 16px ${theme.accentGlow}` }}
              aria-hidden="true"
            />
            <span
              className={styles.pulseRingDelayed}
              style={{ borderColor: theme.accent }}
              aria-hidden="true"
            />
          </>
        )}

        <button
          className={`${styles.node} ${styles[status]}`}
          style={{
            '--node-accent': theme.accent,
            '--node-accent-hover': theme.accentHover,
            '--node-accent-glow': theme.accentGlow,
          }}
          disabled={isLocked}
          aria-disabled={isLocked}
          onClick={() => navigate(`/missions/${mission.id}`)}
          aria-label={`${title} — ${status}, ${xpReward} XP reward`}
          tabIndex={isLocked ? -1 : 0}
          title={isLocked ? 'Complete previous missions to unlock' : `${title} (+${xpReward} XP)`}
        >
          {/* Completed State: Checkmark */}
          {isCompleted && (
            <span className={styles.iconWrap}>
              <Check size={22} strokeWidth={3} />
            </span>
          )}

          {/* Current State: Play Icon */}
          {isCurrent && (
            <span className={styles.iconWrap}>
              <Play size={20} fill="currentColor" strokeWidth={2} />
            </span>
          )}

          {/* Locked State: Lock Icon */}
          {isLocked && (
            <span className={styles.iconWrapLocked}>
              <Lock size={18} strokeWidth={2} />
            </span>
          )}
        </button>
      </div>

      {/* ── 3. Mission Title ────────────────────────────────────── */}
      <span className={`${styles.title} ${isLocked ? styles.titleLocked : ''}`}>
        {title}
      </span>

      {/* ── 4. XP Reward Badge ──────────────────────────────────── */}
      <div
        className={`${styles.xpBadge} ${isLocked ? styles.xpBadgeLocked : isCurrent ? styles.xpBadgeCurrent : styles.xpBadgeCompleted}`}
        style={{
          '--badge-accent': theme.accent,
          '--badge-glow': theme.accentGlow,
        }}
      >
        <Zap size={11} className={styles.xpIcon} aria-hidden="true" />
        <span>+{xpReward} XP</span>
      </div>
      </motion.div>
    </div>
  );
}

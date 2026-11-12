// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Crown, Star, Sparkles } from 'lucide-react';
import TuxModel from '../../../components/TuxModel';
import styles from './BossNode.module.css';

/**
 * BossNode — The grand finale boss challenge at the end of each world.
 * Features a larger circle, gold/yellow radiant styling, crown icon,
 * and high-prestige gamified effects.
 *
 * @param {object} boss — { id, status, xpReward }
 * @param {string} worldName — name of the world
 * @param {number} worldIndex — order index of the world
 * @param {object} theme — WorldTheme object
 * @param {object} [style] — coordinate position styling
 */
export default function BossNode({ boss, worldName, worldIndex, theme: _theme, style }) {
  const navigate = useNavigate();
  const isLocked = boss?.status === 'locked';
  const isCompleted = boss?.status === 'completed';
  const isCurrent = boss?.status === 'current';
  const xpReward = boss?.xpReward ?? 150;

  return (
    <div className={styles.wrapper} style={style} role="listitem">
      <motion.div
        className={styles.motionInner}
        initial={{ opacity: 0, scale: 0.75, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── 1. The Grand Golden Assessment Node (centered on SVG waypoint) ── */}
        <div className={styles.nodeContainer}>
          <div className={styles.aboveNode} aria-hidden="true">
            <div className={styles.tuxSlot}>
              <TuxModel size={44} animate={!isLocked} interactive={!isLocked} locked={isLocked} />
            </div>
            <span className={styles.assessmentLabel}>FINAL ASSESSMENT</span>
          </div>

          {/* Pulsing Golden Aura for Current Assessment */}
          {isCurrent && (
            <>
              <span className={styles.goldPulseRing} aria-hidden="true" />
              <span className={styles.goldPulseRingDelayed} aria-hidden="true" />
            </>
          )}

          <button
            className={`${styles.node} ${
              isCompleted ? styles.nodeCompleted : isCurrent ? styles.nodeCurrent : styles.nodeLocked
            }`}
            aria-label={`Final Assessment: Module ${worldIndex} — ${worldName}. Status: ${boss?.status ?? 'locked'}, ${xpReward} XP reward`}
            disabled={isLocked}
            aria-disabled={isLocked}
            onClick={() => boss?.id && navigate(`/missions/${boss.id}`)}
            tabIndex={isLocked ? -1 : 0}
            title={isLocked ? `Complete all Module ${worldIndex} missions to unlock Final Assessment` : `Final Assessment: ${worldName} (+${xpReward} XP)`}
          >
            {isCompleted && (
              <div className={styles.iconCompletedWrap}>
                <Star size={30} strokeWidth={2.2} fill="#F0B429" />
              </div>
            )}

            {isCurrent && (
              <div className={styles.iconCurrentWrap}>
                <Crown size={32} strokeWidth={2.2} />
              </div>
            )}

            {isLocked && (
              <div className={styles.iconLockedWrap}>
                <Crown size={28} strokeWidth={2} />
              </div>
            )}
          </button>
        </div>

        {/* ── 2. Boss Label ──────────────────────────────────────────── */}
        <div className={styles.labelGroup}>
          <span className={styles.bossOverline}>
            {isCompleted ? 'MODULE CLEARED' : `MODULE ${worldIndex} FINAL`}
          </span>
          <span className={`${styles.label} ${isLocked ? styles.labelLocked : ''}`}>
            {worldName}
          </span>
        </div>

        {/* ── 3. Gold XP Reward Pill ─────────────────────────────────── */}
        <div
          className={`${styles.xpBadge} ${
            isLocked ? styles.xpBadgeLocked : styles.xpBadgeActive
          }`}
        >
          <Sparkles size={12} className={styles.xpIcon} />
          <span>+{xpReward} XP</span>
        </div>
      </motion.div>
    </div>
  );
}

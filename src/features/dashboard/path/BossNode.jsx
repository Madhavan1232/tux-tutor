// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowDown, Crown, Star, Check, Lock, Sparkles } from 'lucide-react';
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
    <motion.div
      className={styles.wrapper}
      style={style}
      role="listitem"
      initial={{ opacity: 0, scale: 0.75, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── 1. Floating Boss Battle Indicator ──────────────────────── */}
      {isCurrent && (
        <div className={styles.bossBadge} aria-hidden="true">
          <Sparkles size={13} strokeWidth={2} className={styles.sparkleIcon} />
          <span>FINAL BOSS</span>
          <ArrowDown size={11} strokeWidth={2.2} aria-hidden="true" />
        </div>
      )}

      {/* ── 2. Boss Tux Mascot Banner ──────────────────────────────── */}
      <div className={styles.tuxSlot} aria-hidden="true">
        <TuxModel size={48} animate={!isLocked} interactive={!isLocked} locked={isLocked} />
      </div>

      {/* ── 3. The Grand Golden Boss Node ──────────────────────────── */}
      <div className={styles.nodeContainer}>
        {/* Pulsing Golden Aura for Current Boss */}
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
          aria-label={`Boss Challenge: World ${worldIndex} — ${worldName}. Status: ${boss?.status ?? 'locked'}, ${xpReward} XP reward`}
          disabled={isLocked}
          aria-disabled={isLocked}
          onClick={() => boss?.id && navigate(`/missions/${boss.id}`)}
          tabIndex={isLocked ? -1 : 0}
          title={isLocked ? `Complete all World ${worldIndex} missions to unlock Boss` : `Boss Challenge: ${worldName} (+${xpReward} XP)`}
        >
          {/* Inner Badge Icon */}
          {isCompleted && (
            <div className={styles.iconCompletedWrap}>
              <Check size={28} strokeWidth={3.2} />
              <Star size={14} className={styles.starSparkle} />
            </div>
          )}

          {isCurrent && (
            <div className={styles.iconCurrentWrap}>
              <Crown size={34} strokeWidth={2.4} />
            </div>
          )}

          {isLocked && (
            <div className={styles.iconLockedWrap}>
              <Lock size={22} strokeWidth={2} />
            </div>
          )}
        </button>
      </div>

      {/* ── 4. Boss Label ──────────────────────────────────────────── */}
      <div className={styles.labelGroup}>
        <span className={styles.bossOverline}>
          {isCompleted ? 'WORLD CLEARED' : `WORLD ${worldIndex} BOSS`}
        </span>
        <span className={`${styles.label} ${isLocked ? styles.labelLocked : ''}`}>
          {worldName}
        </span>
      </div>

      {/* ── 5. Gold XP Reward Pill ─────────────────────────────────── */}
      <div
        className={`${styles.xpBadge} ${
          isLocked ? styles.xpBadgeLocked : styles.xpBadgeActive
        }`}
      >
        <Sparkles size={12} className={styles.xpIcon} />
        <span>+{xpReward} XP</span>
      </div>
    </motion.div>
  );
}

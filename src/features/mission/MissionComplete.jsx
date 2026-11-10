import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Flame, Award, ArrowRight, Home } from 'lucide-react';
import Tux from '../../components/ui/Tux';
import styles from './MissionComplete.module.css';

/**
 * MissionComplete — Celebration screen when all mission objectives & validation pass.
 * Displays cheering Tux, awarded XP, streak stats, level up, and next mission CTA.
 */
export default function MissionComplete({ result, mission, onNextMission }) {
  const navigate = useNavigate();

  const isAlreadyCompleted = Boolean(result?.alreadyCompleted || (result?.xpAwarded === 0 && result?.message));
  const xpEarned = result?.xpAwarded ?? 0;
  const streak = result?.streak ?? 1;
  const newLevel = result?.newLevel;
  const levelTitle = result?.levelTitle;
  const nextMission = result?.nextMission;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Mission Complete celebration"
    >
      <div className={styles.modalCard}>
        {/* Mascot */}
        <div className={styles.mascotArea}>
          <Tux mood={isAlreadyCompleted ? 'happy' : 'cheer'} size={130} />
        </div>

        {/* Celebration Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            {isAlreadyCompleted ? 'Already Completed' : 'Mission Accomplished'}
          </span>
          <h2 className={styles.title}>{mission?.title || 'Terminal Mastery'}</h2>
          {isAlreadyCompleted && (
            <p className={styles.alreadyCompletedNotice}>
              Already completed. No XP awarded this time
            </p>
          )}
        </div>

        {/* Rewards and Stats Grid */}
        <div className={styles.statsGrid}>
          {/* XP Awarded */}
          <div className={styles.statItem}>
            <div className={styles.statIconWrap}>
              <Zap size={18} className={styles.xpIcon} />
            </div>
            <div className={styles.statDetails}>
              <span className={styles.statVal}>
                {isAlreadyCompleted ? '0 XP' : `+${xpEarned} XP`}
              </span>
              <span className={styles.statLabel}>
                {isAlreadyCompleted ? 'No XP awarded this time' : 'Experience Earned'}
              </span>
            </div>
          </div>

          {/* Streak Update */}
          <div className={styles.statItem}>
            <div className={styles.statIconWrap}>
              <Flame size={18} className={styles.streakIcon} />
            </div>
            <div className={styles.statDetails}>
              <span className={styles.statVal}>{streak} Days</span>
              <span className={styles.statLabel}>Active Streak</span>
            </div>
          </div>
        </div>

        {/* Level Up Announcement (if applicable) */}
        {newLevel && (
          <div className={styles.levelCard}>
            <Award size={18} className={styles.levelIcon} />
            <div className={styles.levelText}>
              <span className={styles.levelHeading}>Rank Progression</span>
              <span className={styles.levelTitle}>
                Level {newLevel} · {levelTitle || 'Rockhopper'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {nextMission ? (
            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => onNextMission(nextMission.id)}
            >
              <span>Next Mission</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => navigate('/dashboard')}
            >
              <span>Continue Learning</span>
              <ArrowRight size={16} />
            </button>
          )}

          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/dashboard')}
          >
            <Home size={15} />
            <span>Back to Learning Path</span>
          </button>
        </div>
      </div>
    </div>
  );
}

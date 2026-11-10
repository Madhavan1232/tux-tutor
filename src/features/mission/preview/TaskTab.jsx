import React from 'react';
import { Zap, ShieldAlert, Award } from 'lucide-react';
import StepChecklist from './StepChecklist';
import Tux from '../../../components/ui/Tux';
import styles from './TaskTab.module.css';

/**
 * TaskTab — Main instructions, goal card, live step checklist, XP reward.
 */
export default function TaskTab({ mission, completedSteps = [] }) {
  if (!mission) return null;

  const isBoss = mission.type === 'boss';
  const totalSteps = mission.steps?.length || 0;
  const doneCount = completedSteps.length;
  const isAllDone = totalSteps > 0 && doneCount >= totalSteps;

  return (
    <div className={styles.taskTab}>
      {/* ── Mission Header ────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>
            World {mission.worldOrderIndex || 1} · {mission.worldName}
          </span>
          <div className={styles.xpBadge} aria-label={`${mission.xpReward} XP reward`}>
            <Zap size={12} className={styles.xpIcon} />
            <span>+{mission.xpReward} XP</span>
          </div>
        </div>

        <h1 className={styles.missionTitle}>
          {isBoss && <ShieldAlert size={24} className={styles.bossIcon} />}
          {mission.title}
        </h1>

        {isBoss && (
          <div className={styles.bossBanner}>
            <Award size={16} />
            <span>Boss Challenge — Complete all stages to prove your command-line mastery</span>
          </div>
        )}
      </div>

      {/* ── One-Sentence Goal ─────────────────────────────────────────── */}
      {mission.goal && (
        <div className={styles.goalCard}>
          <div className={styles.goalLabel}>Mission Goal</div>
          <p className={styles.goalText}>{mission.goal}</p>
        </div>
      )}

      {/* ── Formatted Instructions ────────────────────────────────────── */}
      <div className={styles.instructionsContainer}>
        {mission.instructions ? (
          <div className={styles.instructionsContent}>
            {mission.instructions.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className={styles.instructionHeading}>
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              return (
                <p key={idx} className={styles.instructionParagraph}>
                  {paragraph}
                </p>
              );
            })}
          </div>
        ) : (
          <p className={styles.instructionParagraph}>{mission.description}</p>
        )}
      </div>

      {/* ── Live Step Checklist ───────────────────────────────────────── */}
      <StepChecklist steps={mission.steps} completedSteps={completedSteps} />

      {/* ── Footer Progress Stat & Mascot ─────────────────────────────── */}
      <div className={styles.footerRow}>
        <div className={styles.mascotWrap}>
          <Tux
            mood={isAllDone ? 'cheer' : 'idle'}
            size={48}
            className={styles.tuxMascot}
          />
          <div className={styles.progressText}>
            <span className={styles.progressLabel}>
              {doneCount} of {totalSteps} objectives met
            </span>
            <span className={styles.progressSubtext}>
              {isAllDone
                ? 'All objectives satisfied! Click "Check my work" to finish.'
                : 'Follow the steps in your Linux terminal to complete the mission.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

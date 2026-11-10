import React from 'react';
import { HelpCircle, AlertCircle, Eye, Check } from 'lucide-react';
import Tux from '../../../components/ui/Tux';
import styles from './HintsTab.module.css';

/**
 * HintsTab — Progressive hint reveal system with XP penalty transparency and thinking Tux mascot.
 */
export default function HintsTab({
  _mission,
  revealedHints = [],
  totalHints = 0,
  onRevealHint,
  isRevealing = false,
}) {
  const hintsUsed = revealedHints.length;
  const nextHintIndex = hintsUsed;
  const hasMoreHints = nextHintIndex < totalHints;

  // XP multiplier preview
  const getNextMultiplier = (count) => {
    if (count === 0) return '80%';
    if (count === 1) return '60%';
    return '40%';
  };

  return (
    <div className={styles.hintsTab} role="region" aria-label="Mission hints">
      <div className={styles.header}>
        <div className={styles.mascotArea}>
          <Tux mood="think" size={56} className={styles.thinkingTux} />
          <div className={styles.headerText}>
            <h3 className={styles.title}>Guidance & Hints</h3>
            <p className={styles.subtitle}>
              Stuck on a command? Reveal progressive hints one by one. Each revealed
              hint reduces the final XP earned.
            </p>
          </div>
        </div>
      </div>

      {/* ── Revealed Hints List ────────────────────────────────────────── */}
      <div className={styles.hintsList}>
        {revealedHints.map((hintText, idx) => (
          <div key={idx} className={styles.hintCard}>
            <div className={styles.hintCardHeader}>
              <span className={styles.hintNum}>Hint {idx + 1}</span>
              <span className={styles.revealedTag}>
                <Check size={12} />
                Unlocked
              </span>
            </div>
            <p className={styles.hintContent}>{hintText}</p>
          </div>
        ))}
      </div>

      {/* ── Next Hint Unlock Section ──────────────────────────────────── */}
      {hasMoreHints ? (
        <div className={styles.unlockCard}>
          <div className={styles.unlockHeader}>
            <HelpCircle size={18} className={styles.helpIcon} />
            <span className={styles.unlockTitle}>
              Hint {nextHintIndex + 1} Available
            </span>
          </div>

          <div className={styles.penaltyNotice}>
            <AlertCircle size={14} className={styles.penaltyIcon} />
            <span>
              Revealing this hint will reduce completion XP to{' '}
              <strong>{getNextMultiplier(hintsUsed)}</strong> of base reward.
            </span>
          </div>

          <button
            type="button"
            className={styles.revealBtn}
            onClick={() => onRevealHint(nextHintIndex)}
            disabled={isRevealing}
          >
            <Eye size={14} />
            <span>
              {isRevealing
                ? 'Unlocking Hint...'
                : `Reveal Hint ${nextHintIndex + 1}`}
            </span>
          </button>
        </div>
      ) : totalHints > 0 ? (
        <div className={styles.allRevealedNotice}>
          <span>All available hints have been revealed.</span>
        </div>
      ) : (
        <div className={styles.allRevealedNotice}>
          <span>No hints are configured for this challenge.</span>
        </div>
      )}
    </div>
  );
}

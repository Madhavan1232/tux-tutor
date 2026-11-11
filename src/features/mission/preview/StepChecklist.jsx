// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { Check, Circle } from 'lucide-react';
import styles from './StepChecklist.module.css';

/**
 * StepChecklist — Live checklist of mission goals.
 * Ticks automatically as silent step checks succeed in the CheerpX VM.
 */
export default function StepChecklist({ steps = [], completedSteps = [] }) {
  if (!steps.length) return null;

  return (
    <div className={styles.checklistContainer} role="region" aria-label="Mission step checklist">
      <h4 className={styles.checklistTitle}>Mission Objectives</h4>
      <ul className={styles.stepList}>
        {steps.map((step, idx) => {
          const isDone = completedSteps.includes(step.id);
          return (
            <li
              key={step.id || idx}
              className={`${styles.stepItem} ${isDone ? styles.stepDone : ''}`}
              aria-current={isDone ? 'step-completed' : undefined}
            >
              <span className={styles.stepBadge}>
                {isDone ? (
                  <Check size={14} className={styles.checkIcon} strokeWidth={2.5} />
                ) : (
                  <Circle size={10} className={styles.pendingIcon} />
                )}
              </span>
              <span className={styles.stepText}>{step.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

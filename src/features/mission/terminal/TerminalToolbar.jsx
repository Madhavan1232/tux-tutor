import React, { useState } from 'react';
import { RotateCcw, CheckSquare, Terminal as TermIcon, AlertTriangle } from 'lucide-react';
import UploadButton from './UploadButton';
import styles from './TerminalToolbar.module.css';

/**
 * TerminalToolbar — Actions for the in-browser Linux Terminal.
 * Includes Reset (with confirmation dialog) and "Check my work" validation trigger.
 */
export default function TerminalToolbar({
  vm,
  mission,
  onCheckWork,
  onResetMission,
  onUploadSuccess,
  isChecking,
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await onResetMission();
      setShowResetConfirm(false);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className={styles.toolbar} aria-label="Terminal controls">
      <div className={styles.leftGroup}>
        <div className={styles.statusIndicator}>
          <span className={styles.pulseDot} aria-hidden="true" />
          <span className={styles.terminalLabel}>
            <TermIcon size={13} className={styles.termIcon} />
            user@tux
          </span>
        </div>
      </div>

      <div className={styles.rightGroup}>
        {/* Upload Button (if allowed) */}
        {mission?.allowUpload && (
          <UploadButton
            vm={vm}
            mission={mission}
            onUploadComplete={onUploadSuccess}
          />
        )}

        {/* Reset Button */}
        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => setShowResetConfirm(true)}
          title="Reset mission files to initial state"
          aria-label="Reset mission files"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {/* Check My Work Button */}
        <button
          type="button"
          className={styles.checkBtn}
          onClick={onCheckWork}
          disabled={isChecking}
          aria-label="Check my work"
        >
          <CheckSquare size={14} />
          <span>{isChecking ? 'Checking...' : 'Check my work'}</span>
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={20} className={styles.warnIcon} />
              <h4 className={styles.modalTitle}>Reset Mission Filesystem?</h4>
            </div>
            <p className={styles.modalBody}>
              This will re-initialize your workspace files and rerun the mission setup
              script. Any unsaved changes in your home directory will be reset.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmResetBtn}
                onClick={handleConfirmReset}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

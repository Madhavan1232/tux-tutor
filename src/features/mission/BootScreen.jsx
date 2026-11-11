// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import TuxModel from '../../components/TuxModel';
import ProgressBar from '../../components/ui/ProgressBar';
import styles from './BootScreen.module.css';

/**
 * BootScreen — Editorial loading screen during CheerpX VM boot.
 * Displays thinking Tux, progress indicators, or error guidance with retry.
 */
export default function BootScreen({ progress, error, onRetry }) {
  const isError = Boolean(error);

  return (
    <div
      className={styles.bootScreen}
      role="status"
      aria-live="polite"
      aria-label={isError ? 'Virtual machine boot error' : 'Starting Linux virtual machine'}
    >
      <div className={styles.container}>
        {/* Tux Mascot */}
        <div className={styles.mascotWrap}>
          <TuxModel size={110} animate={!isError} locked={isError} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            <Terminal size={14} className={styles.eyebrowIcon} />
            Tux Tutor Linux Runtime
          </span>
          <h2 className={styles.title}>
            {isError ? error.title || 'Boot Failed' : 'Starting your Linux machine'}
          </h2>
        </div>

        {/* Content State */}
        {isError ? (
          <div className={styles.errorBox}>
            <div className={styles.errorMessage}>
              <AlertTriangle size={18} className={styles.errorIcon} />
              <span>{error.message}</span>
            </div>

            {error.details && (
              <div className={styles.detailsList}>
                <span className={styles.detailsLabel}>Missing Required Headers:</span>
                <ul>
                  {error.details.map((d, i) => (
                    <li key={i}>
                      <code>{d}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error.hint && <p className={styles.errorHint}>{error.hint}</p>}

            <button
              type="button"
              className={styles.retryBtn}
              onClick={onRetry}
              aria-label="Retry starting Linux virtual machine"
            >
              <RefreshCw size={14} />
              <span>Retry Machine Boot</span>
            </button>
          </div>
        ) : (
          <div className={styles.loadingBox}>
            <p className={styles.progressText}>{progress || 'Initializing environment...'}</p>
            <div className={styles.progressTrackWrap}>
              <ProgressBar value={75} max={100} size="md" label="Machine Boot Progress" />
            </div>
            <span className={styles.infoNote}>
              Client-side x86 Linux virtualization via CheerpX. No remote servers involved.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

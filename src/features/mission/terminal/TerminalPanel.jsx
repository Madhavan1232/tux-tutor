import React, { useEffect, useRef } from 'react';
import { useXterm } from './useXterm';
import TerminalToolbar from './TerminalToolbar';
import styles from './TerminalPanel.module.css';

/**
 * TerminalPanel — Integrates xterm.js with CheerpX Linux VM.
 * Pure black background, themed block cursor, toolbar with Upload, Reset, Check my work.
 */
export default function TerminalPanel({
  vm,
  mission,
  onCheckWork,
  onResetMission,
  onUploadSuccess,
  isChecking,
}) {
  const { containerRef, termRef } = useXterm();
  const detachRef = useRef(null);

  // Bind xterm to CheerpX custom console input/output
  useEffect(() => {
    if (!termRef.current || !vm.ready) return;

    detachRef.current = vm.attachTerminal(termRef.current);

    return () => {
      if (detachRef.current) {
        detachRef.current();
        detachRef.current = null;
      }
    };
  }, [vm, termRef]);

  // Handle keyboard focus escape mechanism (Section 11 Accessibility)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      containerRef.current?.blur();
    }
  };

  return (
    <div
      className={styles.terminalPanel}
      role="region"
      aria-label="Linux Interactive Terminal"
    >
      <TerminalToolbar
        vm={vm}
        mission={mission}
        onCheckWork={onCheckWork}
        onResetMission={onResetMission}
        onUploadSuccess={onUploadSuccess}
        isChecking={isChecking}
      />

      <div
        className={styles.terminalContainer}
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Interactive Linux Shell. Press Escape then Tab to exit terminal focus."
      />

      <footer className={styles.terminalFooter}>
        <span className={styles.kbNotice}>
          Accessibility: Press <kbd>Esc</kbd> then <kbd>Tab</kbd> to leave terminal
        </span>
        <span className={styles.creditLine}>
          Terminal powered by{' '}
          <a
            href="https://cheerpx.io"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creditLink}
          >
            CheerpX
          </a>
        </span>
      </footer>
    </div>
  );
}

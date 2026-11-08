import React, { useState } from 'react';
import { BookOpen, FolderTree, Lightbulb } from 'lucide-react';
import TaskTab from './TaskTab';
import FilesTab from './FilesTab';
import HintsTab from './HintsTab';
import styles from './PreviewPanel.module.css';

/**
 * PreviewPanel — Left split pane housing Task, Files, and Hints tabs.
 */
export default function PreviewPanel({
  mission,
  completedSteps = [],
  revealedHints = [],
  totalHints = 0,
  onRevealHint,
  isRevealingHint = false,
  vm,
}) {
  const [activeTab, setActiveTab] = useState('task'); // 'task' | 'files' | 'hints'

  return (
    <div className={styles.previewPanel} role="region" aria-label="Mission instructions and files">
      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <nav className={styles.tabBar} aria-label="Workspace tabs">
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'task' ? styles.active : ''}`}
          onClick={() => setActiveTab('task')}
          aria-selected={activeTab === 'task'}
          role="tab"
        >
          <BookOpen size={14} />
          <span>Task</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'files' ? styles.active : ''}`}
          onClick={() => setActiveTab('files')}
          aria-selected={activeTab === 'files'}
          role="tab"
        >
          <FolderTree size={14} />
          <span>Files</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'hints' ? styles.active : ''}`}
          onClick={() => setActiveTab('hints')}
          aria-selected={activeTab === 'hints'}
          role="tab"
        >
          <Lightbulb size={14} />
          <span>Hints</span>
          {totalHints > 0 && (
            <span className={styles.hintsBadge}>
              {revealedHints.length}/{totalHints}
            </span>
          )}
        </button>
      </nav>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      <div className={styles.tabContent} role="tabpanel">
        {activeTab === 'task' && (
          <TaskTab mission={mission} completedSteps={completedSteps} />
        )}

        {activeTab === 'files' && <FilesTab vm={vm} />}

        {activeTab === 'hints' && (
          <HintsTab
            mission={mission}
            revealedHints={revealedHints}
            totalHints={totalHints}
            onRevealHint={onRevealHint}
            isRevealing={isRevealingHint}
          />
        )}
      </div>
    </div>
  );
}

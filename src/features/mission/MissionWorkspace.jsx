// Icons: lucide-react only — do not mix libraries
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, BookOpen, AlertCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import PreviewPanel from './preview/PreviewPanel';
import TerminalPanel from './terminal/TerminalPanel';
import BootScreen from './BootScreen';
import MissionComplete from './MissionComplete';
import TuxCelebration from '../../components/TuxCelebration';
import { useLinuxVM } from './vm/useLinuxVM';
import {
  initializeMissionEnvironment,
  runStepChecks,
  runValidation,
} from './vm/missionRunner';
import styles from './MissionWorkspace.module.css';

/**
 * MissionWorkspace — Split view with resizable panes (Instructions on left, Terminal on right).
 * Manages VM lifecycle, live step check polling, and validation completion.
 */
export default function MissionWorkspace({
  mission,
  completedSteps,
  setCompletedSteps,
  revealedHints,
  totalHints,
  onRevealHint,
  isRevealingHint,
  onCompleteMission,
  completionResult,
}) {
  const navigate = useNavigate();
  const vm = useLinuxVM();

  // Desktop Split Pane state (default 45% left, 55% right)
  const [leftWidthPct, setLeftWidthPct] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Mobile/Tablet View Toggle ('preview' | 'terminal')
  const [mobileTab, setMobileTab] = useState('preview');
  const [isMobile, setIsMobile] = useState(false);

  // Validation & Check Feedback State
  const [isChecking, setIsChecking] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState(null);
  const [completionError, setCompletionError] = useState(null);
  const [isRetryingCompletion, setIsRetryingCompletion] = useState(false);
  const [dismissedCelebrationFor, setDismissedCelebrationFor] = useState(null);

  const missionStatus = completionResult ? 'completed' : 'active';
  const showCelebration =
    missionStatus === 'completed' && dismissedCelebrationFor !== completionResult;

  // Check window width for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 880);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Boot VM on mount if not ready
  useEffect(() => {
    if (!vm.ready && !vm.booting && !vm.error) {
      vm.bootVM();
    }
  }, [vm]);

  // Initialize mission environment when VM and mission are both ready
  const isEnvInitializedRef = useRef(false);
  const initializedMissionIdRef = useRef(null);
  useEffect(() => {
    if (!vm.ready) {
      isEnvInitializedRef.current = false;
      return;
    }

    if (mission && (!isEnvInitializedRef.current || initializedMissionIdRef.current !== mission.id)) {
      isEnvInitializedRef.current = true;
      initializedMissionIdRef.current = mission.id;
      initializeMissionEnvironment(vm, mission)
        .then(() => {
          // Run initial step checks
          return runStepChecks(vm, mission.steps);
        })
        .then((passed) => {
          if (passed && passed.length > 0) {
            setCompletedSteps((prev) => Array.from(new Set([...prev, ...passed])));
          }
        })
        .catch((err) => {
          isEnvInitializedRef.current = false;
          console.error('[MissionWorkspace] Environment setup error:', err);
        });
    }
  }, [vm.ready, mission, vm, setCompletedSteps]);

  // Periodic debounced step checks (every 3 seconds when VM is ready)
  useEffect(() => {
    if (!vm.ready || !mission?.steps?.length || completionResult) return;

    const interval = setInterval(async () => {
      try {
        const passed = await runStepChecks(vm, mission.steps);
        if (passed && passed.length > 0) {
          setCompletedSteps((prev) => {
            const merged = Array.from(new Set([...prev, ...passed]));
            return merged.length !== prev.length ? merged : prev;
          });
        }
      } catch {
        // silent check error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [vm, mission, completionResult, setCompletedSteps]);

  // Divider Drag Handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const newPct = (currentX / rect.width) * 100;
      // Clamp between 28% and 72%
      const clamped = Math.max(28, Math.min(72, newPct));
      setLeftWidthPct(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Check My Work Handler
  const handleCheckWork = async () => {
    if (!vm.ready || isChecking) return;
    setIsChecking(true);
    setCheckFeedback(null);

    try {
      // 1. Run all step checks
      const passedSteps = await runStepChecks(vm, mission.steps);
      setCompletedSteps(passedSteps);

      // 2. Run final validator
      const validation = await runValidation(vm, mission);

      if (validation.success) {
        // Complete mission
        try {
          await onCompleteMission();
          setCompletionError(null);
        } catch (compErr) {
          console.error('[MissionWorkspace] Failed to record completion:', compErr);
          setCompletionError(compErr.message || 'Server error while recording completion.');
        }
      } else {
        // Find unmet steps
        const totalSteps = mission.steps || [];
        const unmet = totalSteps.filter((s) => !passedSteps.includes(s.id));
        const unmetText =
          unmet.length > 0
            ? `Still to complete: "${unmet[0].text}"`
            : 'Final validation check not yet satisfied. Review the goal instructions.';

        setCheckFeedback({
          type: 'unmet',
          message: unmetText,
        });
        setTimeout(() => setCheckFeedback(null), 6000);
      }
    } catch (err) {
      console.error('[MissionWorkspace] Check work error:', err);
      setCheckFeedback({
        type: 'error',
        message: 'Could not complete verification. Please check terminal output.',
      });
      setTimeout(() => setCheckFeedback(null), 5000);
    } finally {
      setIsChecking(false);
    }
  };

  // Retry Completion Handler
  const handleRetryCompletion = async () => {
    if (isRetryingCompletion) return;
    setIsRetryingCompletion(true);
    try {
      await onCompleteMission();
      setCompletionError(null);
    } catch (err) {
      console.error('[MissionWorkspace] Retry completion failed:', err);
      setCompletionError(err.message || 'Retry failed. Check network or server connection.');
    } finally {
      setIsRetryingCompletion(false);
    }
  };

  // Reset Mission Files Handler
  const handleResetMission = async () => {
    if (!vm.ready) return;
    await vm.resetVM();
    await initializeMissionEnvironment(vm, mission);
    setCompletedSteps([]);
    setCheckFeedback({
      type: 'info',
      message: 'Workspace files have been reset to initial state.',
    });
    setTimeout(() => setCheckFeedback(null), 4000);
  };

  const handleNextMission = (nextId) => {
    navigate(`/missions/${nextId}`);
  };

  // Show calm BootScreen during initial VM initialization or fatal error
  if (!vm.ready || vm.error) {
    return (
      <BootScreen
        progress={vm.bootProgress}
        error={vm.error}
        onRetry={() => vm.bootVM()}
      />
    );
  }

  return (
    <div
      className={styles.workspaceRoot}
      data-theme="workspace"
      ref={containerRef}
      style={{ '--drag-active': isDragging ? '1' : '0' }}
    >
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <nav className={styles.topNav} aria-label="Mission workspace navigation">
        <div className={styles.navLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={16} />
            <span>Path</span>
          </button>
          <span className={styles.navDivider}>/</span>
          <span className={styles.navWorld}>
            World {mission?.worldOrderIndex || 1}
          </span>
          <span className={styles.navDivider}>/</span>
          <span className={styles.navTitle}>{mission?.title}</span>
        </div>

        {/* Mobile View Toggle */}
        {isMobile && (
          <div className={styles.mobileToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${mobileTab === 'preview' ? styles.active : ''}`}
              onClick={() => setMobileTab('preview')}
            >
              <BookOpen size={13} />
              <span>Task</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${mobileTab === 'terminal' ? styles.active : ''}`}
              onClick={() => setMobileTab('terminal')}
            >
              <Monitor size={13} />
              <span>Terminal</span>
            </button>
          </div>
        )}
      </nav>

      {/* ── Mobile Notice Banner ──────────────────────────────────────── */}
      {isMobile && (
        <div className={styles.mobileBanner}>
          <Monitor size={13} className={styles.bannerIcon} />
          <span>The Linux Terminal experience is designed and best enjoyed on desktop.</span>
        </div>
      )}

      {/* ── Feedback Banner ───────────────────────────────────────────── */}
      {checkFeedback && (
        <div className={`${styles.feedbackBanner} ${styles[checkFeedback.type]}`}>
          <AlertCircle size={15} />
          <span>{checkFeedback.message}</span>
        </div>
      )}

      {/* ── Workspace Split Panes ─────────────────────────────────────── */}
      <main className={styles.mainContent}>
        {/* Left: Preview Panel */}
        <div
          className={`${styles.pane} ${styles.leftPane} ${isMobile && mobileTab !== 'preview' ? styles.mobileHidden : ''}`}
          style={{ width: isMobile ? '100%' : `${leftWidthPct}%` }}
        >
          <PreviewPanel
            mission={mission}
            completedSteps={completedSteps}
            revealedHints={revealedHints}
            totalHints={totalHints}
            onRevealHint={onRevealHint}
            isRevealingHint={isRevealingHint}
            vm={vm}
          />
        </div>

        {/* Desktop Draggable Divider */}
        {!isMobile && (
          <div
            className={`${styles.divider} ${isDragging ? styles.dragging : ''}`}
            onMouseDown={handleMouseDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize workspace panes"
          >
            <div className={styles.dividerHandle} />
          </div>
        )}

        {/* Right: Interactive Terminal */}
        <div
          className={`${styles.pane} ${styles.rightPane} ${isMobile && mobileTab !== 'terminal' ? styles.mobileHidden : ''}`}
          style={{ width: isMobile ? '100%' : `${100 - leftWidthPct}%` }}
        >
          <TerminalPanel
            vm={vm}
            mission={mission}
            onCheckWork={handleCheckWork}
            onResetMission={handleResetMission}
            onUploadSuccess={() => {
              setCheckFeedback({
                type: 'info',
                message: 'File uploaded into ~/uploads. Refreshed Files tab.',
              });
              setTimeout(() => setCheckFeedback(null), 3500);
            }}
            isChecking={isChecking}
          />
        </div>
      </main>

      {/* ── Mission Complete Celebration Portal & Summary Modal ───────── */}
      {showCelebration && (
        <TuxCelebration
          xpAwarded={completionResult.xpAwarded ?? mission?.xpReward ?? 0}
          onComplete={() => setDismissedCelebrationFor(completionResult)}
        />
      )}

      {completionResult && !showCelebration && (
        <MissionComplete
          result={completionResult}
          mission={mission}
          onNextMission={handleNextMission}
        />
      )}

      {/* ── Completion Request Error Dialog ────────────────────────────── */}
      {completionError && (
        <div
          className={styles.errorOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Completion recording error"
        >
          <div className={styles.errorCard}>
            <div className={styles.errorIconWrap}>
              <AlertTriangle size={24} />
            </div>
            <h3 className={styles.errorTitle}>Completion Request Failed</h3>
            <p className={styles.errorMessage}>
              Your solution passed validation, but the server failed to record completion:
              <br />
              <strong>{completionError}</strong>
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={handleRetryCompletion}
                disabled={isRetryingCompletion}
              >
                {isRetryingCompletion ? 'Retrying…' : 'Retry Completion'}
              </button>
              <button
                type="button"
                className={styles.dismissBtn}
                onClick={() => setCompletionError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

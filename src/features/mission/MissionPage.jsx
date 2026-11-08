import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { VMProvider } from './vm/VMProvider';
import { useMission } from './useMission';
import MissionWorkspace from './MissionWorkspace';
import BootScreen from './BootScreen';

function MissionPageContent({ missionId }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'workspace');
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, []);
  const {
    mission,
    isLoading,
    error,
    completedSteps,
    setCompletedSteps,
    revealedHints,
    totalHints,
    revealHint,
    isRevealingHint,
    saveProgress,
    completeMission,
    completionResult,
  } = useMission(missionId);

  if (isLoading) {
    return <BootScreen progress="Loading mission briefing..." />;
  }

  if (error || !mission) {
    return (
      <BootScreen
        error={{
          title: 'Mission Not Found',
          message: error || `Mission #${missionId} could not be loaded.`,
          hint: 'Verify the mission exists or return to the learning path.',
        }}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <MissionWorkspace
      mission={mission}
      completedSteps={completedSteps}
      setCompletedSteps={setCompletedSteps}
      revealedHints={revealedHints}
      totalHints={totalHints}
      onRevealHint={revealHint}
      isRevealingHint={isRevealingHint}
      onSaveProgress={saveProgress}
      onCompleteMission={completeMission}
      completionResult={completionResult}
    />
  );
}

/**
 * MissionPage — Fullscreen route entry for /missions/:id.
 * Wraps content with the CheerpX VMProvider context.
 */
export default function MissionPage() {
  const { id } = useParams();
  const missionId = parseInt(id, 10);

  if (isNaN(missionId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <VMProvider>
      <MissionPageContent missionId={missionId} />
    </VMProvider>
  );
}

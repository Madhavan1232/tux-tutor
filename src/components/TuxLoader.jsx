import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import TuxCanvasStage from './TuxCanvasStage';
import { useNormalizedTuxScene, usePrefersReducedMotion } from './tux3dUtils';
import styles from './TuxLoader.module.css';

const LOADER_FADE_MS = 400;

/**
 * Walking-in-place Tux mesh for the full-page app loader.
 * `tux.glb` is a rigid printable mesh without skeletal arm bones, so walking is conveyed
 * through an alternating X-axis pitch rock, slight Z-axis waddle tilt, and up-down bob.
 */
function WalkingTuxMesh({ reducedMotion }) {
  const groupRef = useRef(null);
  const walkClockRef = useRef(0);
  const normalized = useNormalizedTuxScene(1.45);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (reducedMotion) {
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0.14, 0);
      return;
    }

    walkClockRef.current += delta;
    const t = walkClockRef.current;
    group.position.y = Math.abs(Math.sin(t * 4.2)) * 0.065;
    group.rotation.x = Math.sin(t * 8.4) * 0.075;
    group.rotation.z = Math.sin(t * 4.2) * 0.06;
    group.rotation.y = Math.sin(t * 2.1) * 0.12;
  });

  return (
    <group ref={groupRef} scale={normalized.scale}>
      <primitive object={normalized.object} position={normalized.offset} />
    </group>
  );
}

/**
 * Full-screen dark loader with 3D walking Tux, fading "TUX TUTOR" wordmark, and 3px red bar.
 * Serves both as app startup screen (`isDone` triggers 400ms fade-out) and root `Suspense` fallback.
 */
export default function TuxLoader({ isDone = false, onExited }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isDone || !onExited) return undefined;
    const timer = setTimeout(onExited, prefersReducedMotion ? 150 : LOADER_FADE_MS);
    return () => clearTimeout(timer);
  }, [isDone, onExited, prefersReducedMotion]);

  return (
    <div
      className={`${styles.loaderOverlay} ${isDone ? styles.loaderExiting : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Tux Tutor"
      data-testid="tux-loader"
    >
      <TuxCanvasStage size={120}>
        <WalkingTuxMesh reducedMotion={prefersReducedMotion} />
      </TuxCanvasStage>

      <span className={styles.wordmark}>TUX TUTOR</span>

      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} />
      </div>
    </div>
  );
}


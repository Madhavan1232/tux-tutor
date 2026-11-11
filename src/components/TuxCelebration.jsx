import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import TuxCanvasStage from './TuxCanvasStage';
import { useNormalizedTuxScene, usePrefersReducedMotion } from './tux3dUtils';
import styles from './TuxCelebration.module.css';

const CONFETTI_COLORS = ['#E53E3E', '#FFFFFF', '#9CA3AF', '#DC2626', '#D1D5DB'];
const TOTAL_DURATION_MS = 3500;
const FADE_START_MS = 3150;
const DISMISS_FADE_MS = 350;

// Precomputed deterministic burst vectors so confetti particles never recalculate on re-render
const CONFETTI_PARTICLES = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2;
  const radius = 95 + (index % 4) * 32;
  return {
    id: index,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    isCircle: index % 2 === 0,
    size: 7 + (index % 3) * 3,
    tx: `${Math.round(Math.cos(angle) * radius)}px`,
    ty: `${Math.round(Math.sin(angle) * radius - 18)}px`,
    rot: `${(index % 2 === 0 ? 1 : -1) * (180 + index * 18)}deg`,
    delay: `${(index % 5) * 45}ms`,
  };
});

/**
 * Animated celebratory Tux scene + pulsing warm golden spotlight.
 * Sequence: 0-0.5s jump & 360 spin -> 0.5-1.5s victory dance -> 1.5-2.0s settle -> idle.
 */
function CelebrationScene({ reducedMotion }) {
  const groupRef = useRef(null);
  const spotlightRef = useRef(null);
  const elapsedRef = useRef(0);
  const normalized = useNormalizedTuxScene(1.15);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const spotlight = spotlightRef.current;
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    if (spotlight) {
      spotlight.intensity = reducedMotion ? 2.4 : 2.2 + Math.sin(t * 7.5) * 1.1;
    }

    if (!group) return;

    if (reducedMotion) {
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0.14, 0);
      group.scale.setScalar(normalized.scale);
      return;
    }

    const smooth = Math.min(1, delta * 10);

    if (t < 0.5) {
      // Phase 1 (0 - 0.5s): Jump up + full Y-axis spin
      const p = t / 0.5;
      const arc = Math.sin(p * Math.PI);
      const scaleBoost = 1 + arc * 0.14;
      group.position.y = arc * 0.24;
      group.rotation.y = p * Math.PI * 2;
      group.rotation.z = 0;
      group.scale.setScalar(normalized.scale * scaleBoost);
    } else if (t < 1.5) {
      // Phase 2 (0.5 - 1.5s): Rapid victory dance Z-wobble + bounce
      const dt = t - 0.5;
      group.position.y = Math.abs(Math.sin(dt * 12)) * 0.08;
      group.rotation.y = Math.sin(dt * 6) * 0.22;
      group.rotation.z = Math.sin(dt * 24) * 0.22;
      group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, normalized.scale, smooth));
    } else if (t < 2.5) {
      // Phase 3 (1.5 - 2.5s): Settle smoothly back toward idle
      const idleTargetY = Math.sin((t - 1.5) * 1.1) * 0.28;
      group.position.y = THREE.MathUtils.lerp(group.position.y, 0, smooth);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, smooth);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, idleTargetY, smooth);
      group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, normalized.scale, smooth));
    } else {
      // Phase 4 (2.5s+): Gentle idle rotation
      group.position.y = THREE.MathUtils.lerp(group.position.y, 0, smooth);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, smooth);
      group.rotation.y = Math.sin((t - 1.5) * 1.1) * 0.28;
      group.scale.setScalar(normalized.scale);
    }
  });

  return (
    <>
      <pointLight
        ref={spotlightRef}
        position={[0, 1.9, 2.2]}
        color="#FFD166"
        intensity={2.4}
        distance={10}
        decay={1.5}
      />
      <group ref={groupRef} scale={normalized.scale}>
        <primitive object={normalized.object} position={normalized.offset} />
      </group>
    </>
  );
}

/**
 * Full-screen 3D mission completion celebration rendered into a React portal.
 * Automatically fades out after the sequence or immediately when clicked.
 */
export default function TuxCelebration({ xpAwarded = 50, onComplete }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isExiting, setIsExiting] = useState(false);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  const dismiss = useCallback(() => {
    setIsExiting(true);
  }, []);

  // Trigger auto-exit after the celebration timeline (shorter when reduced-motion is enabled)
  useEffect(() => {
    const fadeStartMs = prefersReducedMotion ? 1600 : FADE_START_MS;
    const totalMs = prefersReducedMotion ? 1850 : TOTAL_DURATION_MS;

    const fadeTimer = setTimeout(() => setIsExiting(true), fadeStartMs);
    const doneTimer = setTimeout(finish, totalMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [prefersReducedMotion, finish]);

  // Complete cleanly after manual click fade-out
  useEffect(() => {
    if (!isExiting) return undefined;
    const timer = setTimeout(finish, prefersReducedMotion ? 50 : DISMISS_FADE_MS);
    return () => clearTimeout(timer);
  }, [isExiting, prefersReducedMotion, finish]);

  // Allow keyboard Escape dismissal
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        dismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismiss]);

  const xpLabel = xpAwarded > 0 ? `+${xpAwarded} XP` : 'Mission Complete!';

  const overlayNode = (
    <div
      className={`${styles.overlay} ${isExiting ? styles.overlayExiting : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Mission complete celebration. ${xpLabel}`}
      data-testid="tux-celebration"
      onClick={dismiss}
    >
      <div className={styles.stage}>
        {!prefersReducedMotion && (
          <div className={styles.confettiLayer} aria-hidden="true">
            {CONFETTI_PARTICLES.map((p) => (
              <span
                key={p.id}
                className={styles.particle}
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: p.isCircle ? '50%' : '2px',
                  backgroundColor: p.color,
                  '--tx': p.tx,
                  '--ty': p.ty,
                  '--rot': p.rot,
                  '--delay': p.delay,
                }}
              />
            ))}
          </div>
        )}

        <TuxCanvasStage
          size={200}
          camera={{ position: [0, 0.08, 3.05], fov: 36, near: 0.1, far: 50 }}
        >
          <CelebrationScene reducedMotion={prefersReducedMotion} />
        </TuxCanvasStage>

        <div className={prefersReducedMotion ? styles.xpBadgeStatic : styles.xpBadge}>
          {xpLabel}
        </div>
        <div className={styles.dismissHint}>Click anywhere to continue</div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return overlayNode;
  }

  return createPortal(overlayNode, document.body);
}


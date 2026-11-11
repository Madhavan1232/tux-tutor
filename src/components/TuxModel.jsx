import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import TuxCanvasStage, { TuxPlaceholder } from './TuxCanvasStage';
import {
  tuxModelUrl,
  useNormalizedTuxScene,
  usePrefersReducedMotion,
} from './tux3dUtils';

/**
 * Normalized 3D Tux mesh with idle look-around rotation and hover bounce/wave animation.
 */
function TuxMesh({ animate, interactive, hoveredRef }) {
  const groupRef = useRef(null);
  const idleTimeRef = useRef(0);
  const hoverTimeRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const normalized = useNormalizedTuxScene(1.5);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (prefersReducedMotion) {
      group.position.y = 0;
      group.rotation.z = 0;
      group.rotation.y = 0.14;
      return;
    }

    const isHovered = interactive && hoveredRef.current;
    const smooth = Math.min(1, delta * 8);

    if (isHovered) {
      hoverTimeRef.current += delta;
      const ht = hoverTimeRef.current;
      const bounceY = Math.abs(Math.sin(ht * 5.2)) * 0.085;
      const waveZ = Math.sin(ht * 6.4) * 0.09;
      const turnY = Math.sin(ht * 2.4) * 0.28;

      group.position.y = THREE.MathUtils.lerp(group.position.y, bounceY, smooth);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, waveZ, smooth);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, turnY, smooth);
      return;
    }

    hoverTimeRef.current = 0;
    idleTimeRef.current += delta;
    const targetYRot = animate ? Math.sin(idleTimeRef.current * 0.9) * 0.36 : 0.14;

    group.position.y = THREE.MathUtils.lerp(group.position.y, 0, smooth);
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, smooth);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetYRot, smooth);
  });

  return (
    <group ref={groupRef} scale={normalized.scale}>
      <primitive object={normalized.object} position={normalized.offset} />
    </group>
  );
}

/**
 * Reusable transparent-canvas 3D Tux mascot powered by `src/assets/tux.glb`.
 *
 * @param {object} props
 * @param {number} [props.size=80] — Square canvas dimensions in px
 * @param {boolean} [props.animate=true] — Enables slow idle Y-axis look-around rotation
 * @param {boolean} [props.interactive=false] — Enables hover bounce/wave interaction
 * @param {boolean} [props.locked=false] — Applies desaturated grayscale/dimmed styling
 * @param {string} [props.className]
 * @param {object} [props.style]
 */
export default function TuxModel({
  size = 80,
  animate = true,
  interactive = false,
  locked = false,
  className = '',
  style,
}) {
  const wrapperRef = useRef(null);
  const hoveredRef = useRef(false);
  const [isInView, setIsInView] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );

  // Lazy-mount offscreen canvases so long dashboards stay safely under WebGL context limits
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !wrapperRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          setIsInView(entries[0].isIntersecting);
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const wrapperStyle = {
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'transparent',
    border: 'none',
    filter: locked ? 'grayscale(0.8) brightness(0.6)' : undefined,
    transition: 'filter 200ms ease',
    cursor: interactive ? 'pointer' : undefined,
    ...style,
  };

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={wrapperStyle}
      onPointerEnter={() => {
        if (interactive) hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
      }}
    >
      {isInView ? (
        <TuxCanvasStage size={size}>
          <TuxMesh
            animate={animate}
            interactive={interactive}
            hoveredRef={hoveredRef}
          />
        </TuxCanvasStage>
      ) : (
        <TuxPlaceholder size={size} />
      )}
    </div>
  );
}

useGLTF.preload(tuxModelUrl);

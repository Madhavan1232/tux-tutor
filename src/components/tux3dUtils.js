import { useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import tuxModelUrl from '../assets/tux.glb?url';

export { tuxModelUrl };

/**
 * Loads `tux.glb` once via drei cache and returns a cloned scene centered at origin
 * and scaled uniformly to `targetHeight`.
 */
export function useNormalizedTuxScene(targetHeight = 1.5) {
  const { scene } = useGLTF(tuxModelUrl);

  return useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const bounds = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(bounds);
    box.getCenter(center);

    const maxDim = Math.max(bounds.x, bounds.y, bounds.z) || 1;
    const scale = targetHeight / maxDim;

    return {
      object: cloned,
      scale,
      offset: [-center.x, -center.y, -center.z],
    };
  }, [scene, targetHeight]);
}

/**
 * Subscribes to the user's `(prefers-reduced-motion: reduce)` system preference.
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event) => setPrefersReduced(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }
    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  return prefersReduced;
}

useGLTF.preload(tuxModelUrl);


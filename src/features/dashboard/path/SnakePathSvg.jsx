import React from 'react';
import { motion } from 'motion/react';
import styles from './SnakePathSvg.module.css';

/**
 * SnakePathSvg — Draws a continuous, organic S-curved path connecting
 * the mission nodes and the final boss node in a world.
 *
 * @param {Array<{ x: number, y: number, status: string }>} points
 * @param {object} theme — WorldTheme object
 * @param {number} width — viewBox width (default 400)
 * @param {number} height — total SVG container height
 */
export default function SnakePathSvg({ points = [], theme, width = 400, height = 500 }) {
  if (points.length < 2) return null;

  // Build the complete path string
  let fullPathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const yMid = (p1.y + p2.y) / 2;
    fullPathD += ` C ${p1.x} ${yMid}, ${p2.x} ${yMid}, ${p2.x} ${p2.y}`;
  }

  // Find index of current active or last completed node
  // Segments before or up to the current node are "active/completed"
  let activeUntilIndex = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i].status === 'completed' || points[i].status === 'current') {
      activeUntilIndex = i;
    }
  }

  // Build active path string (connecting completed/current nodes)
  let activePathD = '';
  if (activeUntilIndex > 0) {
    activePathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < activeUntilIndex; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const yMid = (p1.y + p2.y) / 2;
      activePathD += ` C ${p1.x} ${yMid}, ${p2.x} ${yMid}, ${p2.x} ${p2.y}`;
    }
  }

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Neon Glow Filter */}
        <filter id={`glow-${theme.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient for Active Stroke */}
        <linearGradient id={`path-grad-${theme.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.pathStroke} stopOpacity="0.85" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* 1. Inactive/Future Background Track (Dashed subtle line) */}
      <path
        d={fullPathD}
        className={styles.backgroundTrack}
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="8 8"
        fill="none"
      />

      {/* 2. Active Path Glow (Subtle blur behind active stroke) */}
      {activePathD && (
        <motion.path
          d={activePathD}
          stroke={theme.pathGlow}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.45 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          filter={`url(#glow-${theme.id})`}
        />
      )}

      {/* 3. Active Progress Path (Solid Neon Glowing Stroke with draw animation) */}
      {activePathD && (
        <motion.path
          d={activePathD}
          stroke={`url(#path-grad-${theme.id})`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </svg>
  );
}


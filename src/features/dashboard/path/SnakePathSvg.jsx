import React from 'react';
import { motion } from 'motion/react';
import styles from './SnakePathSvg.module.css';

/**
 * SnakePathSvg — Draws a continuous, organic S-curved path connecting
 * a smooth top lead-in line, all mission nodes, and the final assessment node.
 *
 * @param {Array<{ x: number, y: number, status: string }>} points
 * @param {object} theme — WorldTheme object
 * @param {number} width — viewBox width (default 400)
 * @param {number} height — total SVG container height
 * @param {number} leadInLength — vertical lead-in length above the first node (default 60)
 */
export default function SnakePathSvg({
  points = [],
  theme,
  width = 400,
  height = 500,
  leadInLength = 60,
}) {
  if (points.length === 0) return null;

  const firstPoint = points[0];
  const leadInStartY = Math.max(0, firstPoint.y - leadInLength);

  // Build complete path: vertical lead-in -> all mission nodes -> final assessment node
  let fullPathD = `M ${firstPoint.x} ${leadInStartY} L ${firstPoint.x} ${firstPoint.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const yMid = (p1.y + p2.y) / 2;
    fullPathD += ` C ${p1.x} ${yMid}, ${p2.x} ${yMid}, ${p2.x} ${p2.y}`;
  }

  // Find index of furthest completed or current node
  let activeUntilIndex = -1;
  for (let i = 0; i < points.length; i++) {
    if (points[i].status === 'completed' || points[i].status === 'current') {
      activeUntilIndex = i;
    }
  }

  // Build active path string starting from top lead-in down through active nodes
  let activePathD = '';
  if (activeUntilIndex >= 0) {
    activePathD = `M ${firstPoint.x} ${leadInStartY} L ${firstPoint.x} ${firstPoint.y}`;
    for (let i = 0; i < activeUntilIndex; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const yMid = (p1.y + p2.y) / 2;
      activePathD += ` C ${p1.x} ${yMid}, ${p2.x} ${yMid}, ${p2.x} ${p2.y}`;
    }
  }

  const glowFilterId = `glow-${theme.id}`;
  const activeGradId = `path-grad-${theme.id}`;
  const topFadeGradId = `path-top-fade-grad-${theme.id}`;
  const topFadeMaskId = `path-top-fade-mask-${theme.id}`;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <defs>
        {/* Neon Glow Filter */}
        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient for Active Stroke */}
        <linearGradient id={activeGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.pathStroke} stopOpacity="0.85" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="1" />
        </linearGradient>

        {/* Subtle fade-in gradient over top lead-in segment; spreadMethod="pad" keeps rest opaque */}
        <linearGradient
          id={topFadeGradId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={leadInStartY}
          x2="0"
          y2={firstPoint.y}
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
        </linearGradient>

        <mask
          id={topFadeMaskId}
          maskUnits="userSpaceOnUse"
          x="-40"
          y="0"
          width={width + 80}
          height={height}
        >
          <rect x="-40" y="0" width={width + 80} height={height} fill={`url(#${topFadeGradId})`} />
        </mask>
      </defs>

      <g mask={`url(#${topFadeMaskId})`}>
        {/* 1. Full Path Track down through Final Assessment node */}
        <path
          d={fullPathD}
          className={styles.backgroundTrack}
          data-testid={`snake-path-track-${theme.id}`}
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="8 8"
          fill="none"
        />

        {/* 2. Active Path Glow */}
        {activePathD && (
          <motion.path
            d={activePathD}
            stroke={theme.pathGlow}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.45 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            filter={`url(#${glowFilterId})`}
          />
        )}

        {/* 3. Active Progress Path */}
        {activePathD && (
          <motion.path
            d={activePathD}
            data-testid={`snake-path-active-${theme.id}`}
            stroke={`url(#${activeGradId})`}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </g>
    </svg>
  );
}

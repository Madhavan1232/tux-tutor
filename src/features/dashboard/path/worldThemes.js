/**
 * worldThemes.js — Visual themes for each World zone in the Tux Tutor learning path.
 * 
 * Provides distinct gradients, neon/accent colors, glowing path strokes,
 * and zone descriptors to create an immersive Duolingo/Mimo game-like progression.
 */

/**
 * @typedef {Object} WorldTheme
 * @property {number} id
 * @property {string} slug
 * @property {string} zoneTag
 * @property {string} bgGradient
 * @property {string} cardBg
 * @property {string} borderColor
 * @property {string} borderHover
 * @property {string} accent
 * @property {string} accentHover
 * @property {string} accentGlow
 * @property {string} pathStroke
 * @property {string} pathGlow
 * @property {string} headerColor
 * @property {string} tagBg
 */

export const WORLD_THEMES = {
  // World 1: Linux Basics (Terminal Green / Dark Slate)
  1: {
    id: 1,
    slug: 'basics',
    zoneTag: 'MODULE 01 · TERMINAL SHELL',
    bgGradient: 'linear-gradient(180deg, #0b151a 0%, #060c10 100%)',
    cardBg: '#091319',
    borderColor: 'rgba(16, 185, 129, 0.28)',
    borderHover: 'rgba(16, 185, 129, 0.6)',
    accent: '#10B981',         // Terminal phosphor emerald
    accentHover: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    pathStroke: '#10B981',
    pathGlow: 'rgba(16, 185, 129, 0.6)',
    headerColor: '#34D399',
    tagBg: 'rgba(16, 185, 129, 0.12)',
  },

  // World 2: Files & Directories (Deep Ocean Blue)
  2: {
    id: 2,
    slug: 'files',
    zoneTag: 'MODULE 02 · FILESYSTEM HIERARCHY',
    bgGradient: 'linear-gradient(180deg, #081728 0%, #040d17 100%)',
    cardBg: '#061423',
    borderColor: 'rgba(56, 189, 248, 0.28)',
    borderHover: 'rgba(56, 189, 248, 0.6)',
    accent: '#0EA5E9',         // Ocean sky cyan
    accentHover: '#0284C7',
    accentGlow: 'rgba(14, 165, 233, 0.45)',
    pathStroke: '#38BDF8',
    pathGlow: 'rgba(56, 189, 248, 0.6)',
    headerColor: '#7DD3FC',
    tagBg: 'rgba(14, 165, 233, 0.12)',
  },

  // World 3: Text Processing (Stream Violet / Amethyst)
  3: {
    id: 3,
    slug: 'pipes',
    zoneTag: 'MODULE 03 · STREAMS & PIPELINES',
    bgGradient: 'linear-gradient(180deg, #150b22 0%, #0b0513 100%)',
    cardBg: '#12091e',
    borderColor: 'rgba(168, 85, 247, 0.28)',
    borderHover: 'rgba(168, 85, 247, 0.6)',
    accent: '#A855F7',         // Stream purple
    accentHover: '#9333EA',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
    pathStroke: '#C084FC',
    pathGlow: 'rgba(192, 132, 252, 0.6)',
    headerColor: '#D8B4FE',
    tagBg: 'rgba(168, 85, 247, 0.12)',
  },

  // World 4: Permissions (Vault Gold & Bronze)
  4: {
    id: 4,
    slug: 'permissions',
    zoneTag: 'MODULE 04 · ACCESS & PERMISSIONS',
    bgGradient: 'linear-gradient(180deg, #1c1306 0%, #0e0902 100%)',
    cardBg: '#181005',
    borderColor: 'rgba(245, 158, 11, 0.28)',
    borderHover: 'rgba(245, 158, 11, 0.6)',
    accent: '#F59E0B',         // Security amber
    accentHover: '#D97706',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    pathStroke: '#FBBF24',
    pathGlow: 'rgba(251, 191, 36, 0.6)',
    headerColor: '#FDE68A',
    tagBg: 'rgba(245, 158, 11, 0.12)',
  },

  // World 5: Processes (Runtime Engine Teal)
  5: {
    id: 5,
    slug: 'processes',
    zoneTag: 'MODULE 05 · DAEMONS & RUNTIME',
    bgGradient: 'linear-gradient(180deg, #051b19 0%, #020d0c 100%)',
    cardBg: '#041715',
    borderColor: 'rgba(20, 184, 166, 0.28)',
    borderHover: 'rgba(20, 184, 166, 0.6)',
    accent: '#14B8A6',         // Daemon teal
    accentHover: '#0D9488',
    accentGlow: 'rgba(20, 184, 166, 0.45)',
    pathStroke: '#2DD4BF',
    pathGlow: 'rgba(45, 212, 191, 0.6)',
    headerColor: '#5EEAD4',
    tagBg: 'rgba(20, 184, 166, 0.12)',
  },

  // World 6: Networking (Fiber Optic Indigo)
  6: {
    id: 6,
    slug: 'networking',
    zoneTag: 'MODULE 06 · PORTS & SOCKETS',
    bgGradient: 'linear-gradient(180deg, #091228 0%, #030815 100%)',
    cardBg: '#070f22',
    borderColor: 'rgba(99, 102, 241, 0.28)',
    borderHover: 'rgba(99, 102, 241, 0.6)',
    accent: '#6366F1',         // Network indigo
    accentHover: '#4F46E5',
    accentGlow: 'rgba(99, 102, 241, 0.45)',
    pathStroke: '#818CF8',
    pathGlow: 'rgba(129, 140, 248, 0.6)',
    headerColor: '#A5B4FC',
    tagBg: 'rgba(99, 102, 241, 0.12)',
  },

  // World 7: Shell Scripting (Hacker Rose / Magenta)
  7: {
    id: 7,
    slug: 'scripting',
    zoneTag: 'MODULE 07 · SCRIPTING AUTOMATION',
    bgGradient: 'linear-gradient(180deg, #1e0714 0%, #0e0209 100%)',
    cardBg: '#190510',
    borderColor: 'rgba(244, 63, 94, 0.28)',
    borderHover: 'rgba(244, 63, 94, 0.6)',
    accent: '#F43F5E',         // Bash rose
    accentHover: '#E11D48',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
    pathStroke: '#FB7185',
    pathGlow: 'rgba(251, 113, 133, 0.6)',
    headerColor: '#FDA4AF',
    tagBg: 'rgba(244, 63, 94, 0.12)',
  },

  // World 8: System Administration (Root Crimson)
  8: {
    id: 8,
    slug: 'sysadmin',
    zoneTag: 'MODULE 08 · ROOT FORTRESS',
    bgGradient: 'linear-gradient(180deg, #1b0505 0%, #0c0101 100%)',
    cardBg: '#170303',
    borderColor: 'rgba(220, 38, 38, 0.35)',
    borderHover: 'rgba(220, 38, 38, 0.7)',
    accent: '#DC2626',         // Root crimson
    accentHover: '#B91C1C',
    accentGlow: 'rgba(220, 38, 38, 0.55)',
    pathStroke: '#EF4444',
    pathGlow: 'rgba(239, 68, 68, 0.65)',
    headerColor: '#FCA5A5',
    tagBg: 'rgba(220, 38, 38, 0.15)',
  },
};

/**
 * Returns the theme for a given world index, with a safe fallback.
 * @param {number} [orderIndex=1]
 * @returns {WorldTheme}
 */
export function getWorldTheme(orderIndex = 1) {
  return WORLD_THEMES[orderIndex] || WORLD_THEMES[1];
}

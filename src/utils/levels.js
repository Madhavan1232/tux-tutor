/**
 * Tux Tutor — Level Titles
 * Linux-flavored rank system, based on penguin life stages.
 */

const LEVEL_TIERS = [
  { min: 1,  max: 5,  title: 'Egg' },
  { min: 6,  max: 10, title: 'Chick' },
  { min: 11, max: 20, title: 'Rockhopper' },
  { min: 21, max: 35, title: 'Emperor' },
  { min: 36, max: Infinity, title: 'Root Penguin' },
];

/**
 * Returns the Linux-flavored rank title for a given level.
 * @param {number} level
 * @returns {string}
 */
function levelTitle(level) {
  const tier = LEVEL_TIERS.find((t) => level >= t.min && level <= t.max);
  return tier ? tier.title : 'Egg';
}

/**
 * Returns the full label including level number.
 * @param {number} level
 * @returns {string}  e.g. "Level 12 · Rockhopper"
 */
export function levelLabel(level) {
  return `Level ${level} · ${levelTitle(level)}`;
}

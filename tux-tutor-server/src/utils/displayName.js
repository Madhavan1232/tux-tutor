/**
 * Formats a user's display name in priority order:
 * 1. Saved display name / full name in database or user profile (e.g. "Madhavan")
 * 2. Cleaned fallback from the part before '@' in email, or username:
 *    - Remove numbers at the end (e.g. madhavanvairava_380 -> madhavanvairava)
 *    - Replace underscores with spaces
 *    - Capitalize first letter of each word
 *
 * @param {object|null|undefined} user
 * @returns {string}
 */
function formatDisplayName(user) {
  if (!user) return '';

  // Priority 1: Explicit displayName / fullName saved in DB or profile
  const explicit =
    user.displayName ||
    user.display_name ||
    (user.name && user.name !== user.username ? user.name : null) ||
    user.fullName;

  if (explicit && typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim();
  }

  // Priority 2: Part before '@' in email, falling back to username
  let raw = '';
  if (user.email && typeof user.email === 'string' && user.email.includes('@')) {
    raw = user.email.split('@')[0];
  } else if (user.username && typeof user.username === 'string') {
    raw = user.username;
  }

  if (!raw) return '';

  // Remove numbers at the end and any trailing separator left before them
  let cleaned = raw.replace(/\d+$/, '').replace(/[._-]+$/, '');
  if (!cleaned) cleaned = raw;

  // Replace underscores with spaces
  cleaned = cleaned.replace(/_+/g, ' ').trim();

  // Capitalize first letter of each word
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function validateDisplayName(rawName) {
  if (typeof rawName !== 'string') {
    return { valid: false, error: 'Please enter your name.' };
  }

  const trimmed = rawName.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter your name.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: 'Name must be 30 characters or fewer.' };
  }
  if (!/^[\p{L}\p{N} -]+$/u.test(trimmed)) {
    return { valid: false, error: 'Only letters, numbers, spaces, and hyphens are allowed.' };
  }

  return { valid: true, value: trimmed };
}

module.exports = { formatDisplayName, validateDisplayName };

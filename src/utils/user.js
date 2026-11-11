/**
 * Formats a user's display name according to the priority rules:
 * 1. Saved display name / full name in database or profile (e.g. "Madhavan")
 * 2. Cleaned fallback from the part before '@' in the email, or username:
 *    - Remove trailing numbers (e.g. madhavanvairava_380 -> madhavanvairava)
 *    - Replace underscores with spaces (e.g. madhavan_vairava -> Madhavan Vairava)
 *    - Capitalize first letter of each word (Title Case)
 */
export function formatDisplayName(user) {
  if (!user) return '';

  // Priority 1: Explicit displayName, fullName, or non-username name saved in DB/profile
  const explicit =
    user.displayName ||
    user.display_name ||
    (user.name && user.name !== user.username ? user.name : null) ||
    user.fullName;

  if (explicit && typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim();
  }

  // Priority 2: Fall back to part before '@' in email, or username
  let raw = '';
  if (user.email && typeof user.email === 'string' && user.email.includes('@')) {
    raw = user.email.split('@')[0];
  } else if (user.username && typeof user.username === 'string') {
    raw = user.username;
  }

  if (!raw) return '';

  // Remove trailing numbers and trailing separators (e.g. madhavanvairava_380 -> madhavanvairava)
  let cleaned = raw.replace(/\d+$/, '').replace(/[._-]+$/, '');
  if (!cleaned) cleaned = raw;

  // Replace underscores with spaces
  cleaned = cleaned.replace(/_+/g, ' ').trim();

  // Capitalize first letter of each word (Title Case)
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}


/**
 * PenguinAvatar — small penguin avatars for leaderboard rows.
 * Three visual variants: filled (accent), outline (crisp), and muted.
 *
 * @param {'filled'|'outline'|'muted'} [variant='muted']
 * @param {number} [size=28]
 * @param {string} [username] — used for aria-label
 * @param {string} [className]
 */
export default function PenguinAvatar({
  variant = 'muted',
  size = 28,
  username = 'User',
  className = '',
}) {
  const bodyFill =
    variant === 'filled'  ? 'var(--color-accent)' :
    variant === 'outline' ? '#FFFFFF' :
    '#1D1D1F';

  const bodyStroke =
    variant === 'filled'  ? 'var(--color-accent-hover)' :
    variant === 'outline' ? 'var(--color-accent)' :
    '#111113';

  const bellyFill =
    variant === 'filled'  ? 'rgba(255,255,255,0.85)' :
    variant === 'outline' ? 'rgba(220, 38, 38, 0.1)' :
    '#FFFFFF';

  const eyeFill =
    variant === 'filled'  ? '#FFFFFF' :
    variant === 'outline' ? 'var(--color-accent)' :
    '#FFFFFF';

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${username}'s penguin avatar`}
    >
      {/* Body */}
      <ellipse
        cx="16" cy="19" rx="12" ry="13"
        fill={bodyFill}
        stroke={bodyStroke}
        strokeWidth="1.2"
      />
      {/* Belly */}
      <ellipse cx="16" cy="22" rx="7" ry="9" fill={bellyFill} />
      {/* Head */}
      <ellipse cx="16" cy="10" rx="10" ry="10" fill={bodyFill} stroke={bodyStroke} strokeWidth="1.2" />
      {/* Eyes */}
      <circle cx="13" cy="9"  r="2" fill={eyeFill} />
      <circle cx="19" cy="9"  r="2" fill={eyeFill} />
      <circle cx="13.6" cy="9.3" r="0.8" fill={bodyStroke} />
      <circle cx="19.6" cy="9.3" r="0.8" fill={bodyStroke} />
      {/* Beak */}
      <path
        d="M13.5 13 Q16 10.5 18.5 13 Q16 17 13.5 13Z"
        fill="var(--color-accent)"
      />
      {/* Wings */}
      <ellipse cx="5"  cy="20" rx="3" ry="7" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
      <ellipse cx="27" cy="20" rx="3" ry="7" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
    </svg>
  );
}

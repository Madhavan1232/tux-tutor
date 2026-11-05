/**
 * PenguinAvatar — small penguin avatars for leaderboard rows.
 * Three visual variants: filled (burgundy), outline (white), and muted.
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
  /* Resolve fill/stroke per variant from CSS vars */
  const bodyFill =
    variant === 'filled'  ? 'var(--color-primary)'      :
    variant === 'outline' ? 'var(--color-background)'   :
    /* muted */             'var(--color-surface)';

  const bodyStroke =
    variant === 'filled'  ? 'var(--color-secondary-red)'  :
    variant === 'outline' ? 'var(--color-text-primary)'   :
    /* muted */             'var(--color-dark-burgundy)';

  const bellyFill =
    variant === 'filled'  ? 'rgba(255,255,255,0.25)' :
    variant === 'outline' ? 'var(--color-text-primary)' :
    /* muted */             'var(--color-text-secondary)';

  const eyeFill =
    variant === 'filled'  ? 'var(--color-text-primary)' :
    variant === 'outline' ? 'var(--color-background)'   :
    /* muted */             'var(--color-text-primary)';

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
      <circle cx="13.6" cy="9.3" r="0.8" fill={bodyFill} />
      <circle cx="19.6" cy="9.3" r="0.8" fill={bodyFill} />
      {/* Beak */}
      <path
        d="M13.5 13 Q16 10.5 18.5 13 Q16 17 13.5 13Z"
        fill="var(--color-text-secondary)"
        opacity="0.8"
      />
      {/* Wings */}
      <ellipse cx="5"  cy="20" rx="3" ry="7" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
      <ellipse cx="27" cy="20" rx="3" ry="7" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
    </svg>
  );
}

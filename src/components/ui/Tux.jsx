/**
 * Tux — the Tux Tutor penguin mascot, rendered as inline SVG.
 * Flat, palette-only, no gradients, no glow, no official Tux artwork.
 *
 * Moods:
 *  idle  — gentle sway (default)
 *  cheer — wings up, hopping (completed world, active streak)
 *  sleep — closed eyes, still (locked world)
 *  think — slight lean (loading / empty states)
 *
 * @param {'idle'|'cheer'|'sleep'|'think'} [mood='idle']
 * @param {number} [size=120]
 * @param {string} [className]
 */

const WINGS = {
  idle:  { l: 12,  r: -12 },
  cheer: { l: -35, r: 35  },
  sleep: { l: 12,  r: -12 },
  think: { l: 12,  r: -60 },
};

export default function Tux({ mood = 'idle', size = 120, className = '' }) {
  const wing = WINGS[mood] ?? WINGS.idle;
  const asleep = mood === 'sleep';

  return (
    <svg
      className={`tux tux--${mood} ${className}`}
      width={size}
      height={size * 1.17}
      viewBox="0 0 120 140"
      role="img"
      aria-label={`Tux the penguin — ${mood} mood`}
    >
      {/* Feet / shadow */}
      <ellipse cx="44" cy="131" rx="13" ry="5" fill="var(--color-text-secondary)" opacity="0.5" />
      <ellipse cx="76" cy="131" rx="13" ry="5" fill="var(--color-text-secondary)" opacity="0.5" />

      {/* Wings */}
      <ellipse
        cx="22" cy="84" rx="8" ry="26"
        fill="var(--color-surface)"
        stroke="var(--color-dark-burgundy)"
        strokeWidth="1.5"
        transform={`rotate(${wing.l} 26 62)`}
      />
      <ellipse
        cx="98" cy="84" rx="8" ry="26"
        fill="var(--color-surface)"
        stroke="var(--color-dark-burgundy)"
        strokeWidth="1.5"
        transform={`rotate(${wing.r} 94 62)`}
      />

      {/* Body */}
      <ellipse
        cx="60" cy="78" rx="38" ry="52"
        fill="var(--color-surface)"
        stroke="var(--color-dark-burgundy)"
        strokeWidth="1.5"
      />

      {/* Belly */}
      <ellipse cx="60" cy="90" rx="25" ry="37" fill="var(--color-text-primary)" opacity="0.92" />

      {/* Eyes */}
      {asleep ? (
        <>
          {/* Closed eye curves */}
          <path
            d="M43 48 Q49 53 55 48"
            stroke="var(--color-text-primary)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M65 48 Q71 53 77 48"
            stroke="var(--color-text-primary)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="49" cy="48" r="6"   fill="var(--color-text-primary)" />
          <circle cx="71" cy="48" r="6"   fill="var(--color-text-primary)" />
          <circle cx="50" cy="48" r="2.5" fill="var(--color-background)"  />
          <circle cx="72" cy="48" r="2.5" fill="var(--color-background)"  />
        </>
      )}

      {/* Beak — palette only, no yellow */}
      <path
        d="M52 58 Q60 51 68 58 Q60 71 52 58Z"
        fill="var(--color-text-secondary)"
      />

      {/* Cheeks for cheer */}
      {mood === 'cheer' && (
        <>
          <circle cx="43" cy="56" r="5" fill="var(--color-primary)" opacity="0.4" />
          <circle cx="77" cy="56" r="5" fill="var(--color-primary)" opacity="0.4" />
        </>
      )}

      {/* Root badge for think mode (# symbol) */}
      {mood === 'think' && (
        <text
          x="82" y="30"
          fontSize="14"
          fontFamily="var(--font-mono)"
          fill="var(--color-primary)"
          fontWeight="600"
        >
          #
        </text>
      )}
    </svg>
  );
}

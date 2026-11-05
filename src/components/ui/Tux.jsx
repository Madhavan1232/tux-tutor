/**
 * Tux — the Tux Tutor penguin mascot, rendered as inline SVG.
 * Clean, iconic Apple-style design adhering to the white & red palette.
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
      {/* Feet */}
      <ellipse cx="44" cy="131" rx="13" ry="5" fill="var(--color-accent)" opacity="0.9" />
      <ellipse cx="76" cy="131" rx="13" ry="5" fill="var(--color-accent)" opacity="0.9" />

      {/* Wings */}
      <ellipse
        cx="22" cy="84" rx="8" ry="26"
        fill="#1D1D1F"
        stroke="#111113"
        strokeWidth="1.2"
        transform={`rotate(${wing.l} 26 62)`}
      />
      <ellipse
        cx="98" cy="84" rx="8" ry="26"
        fill="#1D1D1F"
        stroke="#111113"
        strokeWidth="1.2"
        transform={`rotate(${wing.r} 94 62)`}
      />

      {/* Body */}
      <ellipse
        cx="60" cy="78" rx="38" ry="52"
        fill="#1D1D1F"
        stroke="#111113"
        strokeWidth="1.2"
      />

      {/* Belly */}
      <ellipse
        cx="60" cy="90" rx="25" ry="37"
        fill="#FFFFFF"
        stroke="rgba(0, 0, 0, 0.08)"
        strokeWidth="1"
      />

      {/* Eyes */}
      {asleep ? (
        <>
          {/* Closed eye curves */}
          <path
            d="M43 48 Q49 53 55 48"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M65 48 Q71 53 77 48"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="49" cy="48" r="6.5" fill="#FFFFFF" />
          <circle cx="71" cy="48" r="6.5" fill="#FFFFFF" />
          <circle cx="50" cy="48.5" r="3.2" fill="#1D1D1F" />
          <circle cx="72" cy="48.5" r="3.2" fill="#1D1D1F" />
          <circle cx="51.5" cy="47" r="1.2" fill="#FFFFFF" />
          <circle cx="73.5" cy="47" r="1.2" fill="#FFFFFF" />
        </>
      )}

      {/* Beak */}
      <path
        d="M52 57 Q60 50 68 57 Q60 70 52 57Z"
        fill="var(--color-accent)"
      />
    </svg>
  );
}

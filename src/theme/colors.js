// src/theme/colors.js
// Single source-of-truth JavaScript color tokens for TUX TUTOR (Apple Store Light Mode).

export const colors = {
  bg: {
    base:      '#FBFBFD',   // Apple's off-white page background
    surface:   '#FFFFFF',   // Cards, modals, panels
    elevated:  '#F5F5F7',   // Secondary elevated surfaces
  },
  border: {
    subtle:    '#D2D2D7',   // Apple's border color
    focus:     '#DC2626',   // Crimson focused input borders
  },
  text: {
    primary:   '#1D1D1F',   // Apple's near-black
    secondary: '#6E6E73',   // Apple's warm muted gray
    muted:     '#86868B',   // Metadata, tertiary hints
  },
  accent: {
    default:   '#DC2626',   // Crimson primary CTA, highlights, links
    hover:     '#B91C1C',   // Button hover
    muted:     'rgba(220, 38, 38, 0.08)',
    glow:      'rgba(220, 38, 38, 0.12)',
  },
  feedback: {
    success:   '#15803D',
    error:     '#DC2626',
    warning:   '#B45309',
  },
}

export default colors

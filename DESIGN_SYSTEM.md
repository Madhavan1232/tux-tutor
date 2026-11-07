# Tux Tutor — Global Design System (Apple Store-Style Edition)

**Theme:** Off-White Light Mode with Crimson (`#DC2626`) as the Only Accent  
**Aesthetic:** Apple Store Precision, Generous Spacing, and Mixed-Weight Typographic Hierarchy  
**Single Source of Truth:** `src/styles/tokens.css` (CSS custom properties)

---

## 1. Global Color Tokens

All colors across the application strictly reference these tokens. Never hardcode hex values anywhere else in the codebase.

### CSS Custom Properties (`src/styles/tokens.css`)

```css
:root {
  /* === BACKGROUNDS (Apple Off-White Light Mode) === */
  --color-bg-base:       #FBFBFD;   /* Apple's off-white page background */
  --color-bg-surface:    #FFFFFF;   /* Clean white cards, modals, panels */
  --color-bg-elevated:   #F5F5F7;   /* Secondary surface, hover, dropdowns */

  /* === BORDERS === */
  --color-border-subtle: #D2D2D7;   /* Apple's 0.5px / 1px subtle divider & border */
  --color-border-focus:  #DC2626;   /* Crimson focused input borders */

  /* === TEXT (Apple's Near-Black & Warm Muted Gray) === */
  --color-text-primary:  #1D1D1F;   /* Apple's near-black, never pure #000 */
  --color-text-secondary:#6E6E73;   /* Apple's warm muted gray (not #888 or #999) */
  --color-text-muted:    #86868B;   /* Metadata, tertiary hints */

  /* === ACCENT (Crimson — #DC2626 is the ONLY accent) === */
  --color-accent:        #DC2626;   /* Primary CTA, eyebrows, links */
  --color-accent-hover:  #B91C1C;   /* Button hover */
  --color-accent-muted:  rgba(220, 38, 38, 0.08); /* Subtle crimson tint */
  --color-accent-glow:   rgba(220, 38, 38, 0.12); /* Soft focus ring */

  /* === FEEDBACK === */
  --color-success:       #15803D;   /* Verified, success states */
  --color-error:         #DC2626;   /* Validation errors */
  --color-warning:       #B45309;   /* Warnings */
}
```

---

## 2. Apple Store Typographic System

### Font Stack
- **Headings:** `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Helvetica Neue', sans-serif;`
- **Body:** `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif;`
- **Mono:** `'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;` *(strictly for terminal code blocks, never for UI text)*

### Typographic Scale
- **Display (Hero Titles):**
  - `font-size: clamp(40px, 6vw, 72px)`
  - `font-weight: 700`
  - `letter-spacing: -0.025em` (Apple's signature tightness)
  - `line-height: 1.05`
  - `color: #1D1D1F`
- **Section Heading (`h2`):**
  - `font-size: clamp(28px, 4vw, 48px)`
  - `font-weight: 700`
  - `letter-spacing: -0.02em`
  - `line-height: 1.1`
  - `color: #1D1D1F`
- **Card Heading (`h3`):**
  - `font-size: 20px` (or 24px)
  - `font-weight: 600`
  - `letter-spacing: -0.01em`
  - `line-height: 1.2`
  - `color: #1D1D1F`
- **Body Text:**
  - `font-size: 17px`
  - `font-weight: 400`
  - `letter-spacing: 0`
  - `line-height: 1.65`
  - `color: #6E6E73` (Apple's warm muted gray)
- **Small / Caption:**
  - `font-size: 13px`
  - `font-weight: 400`
  - `line-height: 1.5`
  - `color: #6E6E73`
- **Eyebrow Label:**
  - `font-size: 12px`
  - `font-weight: 600`
  - `letter-spacing: 0.08em`
  - `text-transform: uppercase`
  - `color: #DC2626` (crimson accent ONLY on eyebrows and links)

---

## 3. Apple's Mixed-Weight Headline Trick

For section headlines, split into two weights:
```html
<h1 class="apple-display-headline">
  <span class="headline-accent">Learn Linux.</span>
  <span class="headline-rest"> The right way.</span>
</h1>
```
- `.headline-accent`: `color: #DC2626; font-weight: 700;`
- `.headline-rest`: `color: #1D1D1F; font-weight: 300;`

---

## 4. Spacing Rules & Apple Component Styles

- **Section padding:** 80px top/bottom on desktop, 40px on mobile
- **Card padding:** 24px (and 32px on wide cards)
- **Multiples of 8px:** `8, 16, 24, 32, 40, 48, 64, 80`
- **Primary CTA Button:**
  - `background: #DC2626`
  - `color: #FFFFFF`
  - `font-size: 17px`
  - `font-weight: 400` (Apple buttons are NOT bold)
  - `padding: 12px 24px`
  - `border-radius: 980px` (Apple's pill shape)
  - `letter-spacing: 0`
- **Secondary / Ghost Button:**
  - `background: transparent`
  - `color: #1D1D1F`
  - `border: 1px solid #1D1D1F`
  - same sizing as primary (980px pill)
- **Link Style:**
  - `color: #DC2626`
  - `text-decoration: none`
  - Appended arrow: `" →"`
  - Hover: `opacity: 0.8`

---

## 5. Strict Guardrails (What NOT to do)
- ✗ **No `font-weight: 500`** — Apple uses 300, 400, 600, or 700. Skip 500.
- ✗ **No pure black (`#000000`)** anywhere — use Apple's `#1D1D1F`.
- ✗ **No letter-spacing on body text** — keep at 0; only headings get tight negative spacing.
- ✗ **No `text-transform: uppercase` on headings** — only on 12px eyebrow labels.
- ✗ **No tight line-height on body text** — keep at 1.65.
- ✗ **No color other than `#1D1D1F` and `#6E6E73` for text**, and `#DC2626` only for accents, links, and eyebrows.

# Tux Tutor — Global UI Design System

**Role:** Senior UI/UX Designer & Frontend Engineer  
**Aesthetic:** Minimalist Editorial • Dark Luxury • Pure Black & Deep Burgundy  
**Core Motto:** *Black is the foundation. Deep red is the identity. White is the typography.*

---

## 1. Visual Direction & Principles

- **Minimalist Editorial:** High contrast, deliberate whitespace, refined layout balance.
- **Dark Luxury Aesthetic:** Pure pitch-black (`#000000`) canvas with deliberate deep burgundy blocks (`#770600`).
- **Typography Forward:** Large, elegant page headings, light-to-regular font weights, maximum readability.
- **Asymmetrical Compositions:** Editorial rhythm rather than repetitive cards or grid-clutter.
- **Minimal Decoration:** No unnecessary gradients, no bright glowing neon, no gaming dashboard clutter.
- **Authentic Linux Terminal:** Pure black, clean monospace typography, burgundy subtle highlights.

---

## 2. Global Color Palette

| Variable | Hex Code | Token Name | Usage |
|---|---|---|---|
| **Background** | `#000000` | `--color-background` | Pure black primary canvas |
| **Primary Red** | `#770600` | `--color-primary` | Main burgundy sections, hero panels, active states |
| **Surface** | `#161414` | `--color-surface` | Subtle dark surfaces when separation is necessary |
| **Secondary Red** | `#7A0401` | `--color-secondary-red` | Accent borders, secondary badges, status markers |
| **Dark Burgundy** | `#4D0B08` | `--color-dark-burgundy` | Hover backgrounds, selected states |
| **Deep Red** | `#170001` | `--color-deep-red` | Deep dark red detailing, subtle panel depths |
| **Primary Text** | `#FFFFFF` | `--color-text-primary` | Main headings, primary values, active labels |
| **Secondary Text** | `#BCB3B3` | `--color-text-secondary` | Editorial subheaders, descriptions, muted info |

### Strict Color Rules
1. **Black must dominate** the entire application (at least 70-80% visual weight).
2. **Deep burgundy** is reserved for high-impact sections, primary buttons, selected navigation, and milestones.
3. **No gray backgrounds:** Never use generic `#1f2937` or slate gray card backgrounds.
4. **No neon effects:** Never use bright red (`#ff0000`), neon pink, or high-glow neon shadows.
5. **No unrelated colors:** Strictly no blue, purple, green, yellow, or teal accents anywhere in the UI.
6. **White typography:** High contrast against black and burgundy for effortless readability.

---

## 3. Typography Hierarchy

### Preferred Typefaces
- **Primary / Body:** `Inter`, `Manrope`, or `DM Sans`
- **Headings:** `Inter` or `Manrope` (regular to medium weight, tracked tightly for large sizes)
- **Terminal & Code:** `JetBrains Mono`, `Fira Code`, or `ui-monospace`

### Scale
- **Display 1 (Page Titles):** `clamp(2.5rem, 6vw, 4.5rem)` • `font-weight: 400 - 500` • `letter-spacing: -0.03em`
- **Heading 2 (Section Titles):** `1.75rem - 2.25rem` • `font-weight: 500` • `letter-spacing: -0.02em`
- **Heading 3 (Card / Panel Titles):** `1.15rem - 1.35rem` • `font-weight: 500`
- **Body Regular:** `0.95rem - 1.05rem` • `line-height: 1.6` • `#BCB3B3`
- **Code / Terminal:** `0.85rem - 0.95rem` • `font-family: var(--font-mono)` • `#FFFFFF`
- **Overline / Label:** `0.75rem` • `text-transform: uppercase` • `letter-spacing: 0.12em` • `color: #770600` or `#BCB3B3`

---

## 4. Component Design System

### Buttons
- **Primary Action:**
  - Background: `#770600`
  - Text: `#FFFFFF`
  - Border: `1px solid #7A0401`
  - Radius: `4px` or `6px` (sharp/architectural, never rounded pills)
  - Hover: Background `#4D0B08`, Border `#770600`
- **Secondary / Ghost Action:**
  - Background: `transparent` or `#161414`
  - Text: `#FFFFFF`
  - Border: `1px solid rgba(119, 6, 0, 0.4)`
  - Hover: Border `#770600`, Background `rgba(119, 6, 0, 0.15)`

### Navigation (Sidebar)
- Background: `#000000`
- Border Right: `1px solid rgba(119, 6, 0, 0.2)`
- Links: `#BCB3B3` regular weight
- Active Link: Background `#770600` with text `#FFFFFF` (clean architectural block)
- Hover Link: Background `rgba(77, 11, 8, 0.5)` with text `#FFFFFF`

### Cards & Panels
- Background: `#000000` with subtle `1px solid #161414` or `rgba(119, 6, 0, 0.2)` borders.
- Editorial Callout Panels: Deep burgundy background (`#770600` or `#4D0B08`) with white text.
- Spacing: Generous padding (`1.75rem` to `2.5rem`), breathing room, high negative space.

### Linux Terminal
- Canvas: Pure black `#000000`
- Border: `1px solid rgba(119, 6, 0, 0.35)`
- Prompt: `tux@archlinux:~$ ` with `tux` in `#770600` or `#BCB3B3` and command in `#FFFFFF`
- Output: `#FFFFFF` (regular) and `#BCB3B3` (supporting logs)
- Error / Notice: Deep burgundy accent `#7A0401`

### Progress & Level Tracking
- Track: `#161414` or pure `#000000` with border
- Fill: `#770600`
- Value: `#FFFFFF` tabular numbers

---

## 5. Screen Coverage (Uniform Design Language)

1. **Landing Page:** Hero with bold editorial title, deep burgundy marquee block, minimal interactive terminal preview.
2. **Authentication (Login / Register):** Pure black split or minimal center with burgundy accent panel.
3. **Dashboard:** Welcome editorial section with minimal Tux Linux silhouette, XP bar, 8 worlds roadmap, daily streak.
4. **Worlds (8 Learning Worlds):**
   - World 1: Navigation & File Operations
   - World 2: Permissions & Ownership
   - World 3: Pipes, Redirection & Text Processing
   - World 4: Process Management & System Monitoring
   - World 5: Networking & Ports
   - World 6: Bash Scripting & Automation
   - World 7: User Management & Sudo
   - World 8: System Administration & Hardening
5. **Mission Details:** Split editorial view with mission briefing on the left, interactive terminal on the right.
6. **Interactive Terminal Sandbox:** Real-time command parsing, terminal history, mission verification.
7. **Achievements & Badges:** Minimalist dark trophy showcase with burgundy seals.
8. **Boss Challenges:** Timed scenario missions with countdown and high-stakes linux debug drills.
9. **Leaderboard:** Editorial typography rank table with weekly reset timer.
10. **User Profile:** Career stats, completed worlds, badge collection, terminal config.
11. **Settings:** Preferences, terminal font size, keybindings, account management.

---

## 6. Technical Tokens Defined

```css
:root {
  /* Color Tokens */
  --color-background: #000000;
  --color-primary: #770600;
  --color-surface: #161414;
  --color-secondary-red: #7A0401;
  --color-dark-burgundy: #4D0B08;
  --color-deep-red: #170001;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #BCB3B3;

  /* Typography */
  --font-sans: 'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* Borders & Radii */
  --border-subtle: 1px solid rgba(255, 255, 255, 0.08);
  --border-burgundy: 1px solid rgba(119, 6, 0, 0.4);
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
}
```


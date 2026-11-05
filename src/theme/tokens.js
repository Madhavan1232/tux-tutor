// =============================================================================
// TUX TUTOR — JavaScript Color Tokens (v2 — Apple-Style Design Language)
// Single source of truth for JS-side color references.
// Always reference these — never hardcode hex values.
// =============================================================================

export const colors = {
  bg: {
    base:     '#0D0D0D',
    surface:  '#1A1A1A',
    elevated: '#222222',
  },
  border: {
    subtle: '#2A2A2A',
    focus:  '#E8192C',
  },
  text: {
    primary:   '#F0F0F0',
    secondary: '#A0A0A0',
    muted:     '#666666',
  },
  accent: {
    default: '#E8192C',
    hover:   '#FF2D3F',
    muted:   '#7A0A14',
    glow:    'rgba(232, 25, 44, 0.25)',
  },
  feedback: {
    success: '#22C55E',
    error:   '#FF4444',
    warning: '#F59E0B',
  },
};

// Legacy export — kept for backward compatibility
export const COLORS = {
  background:    colors.bg.base,
  primary:       colors.accent.default,
  surface:       colors.bg.surface,
  secondaryRed:  colors.accent.hover,
  darkBurgundy:  colors.accent.muted,
  deepRed:       colors.accent.muted,
  textPrimary:   colors.text.primary,
  textSecondary: colors.text.secondary,
};

export const WORLDS = [
  {
    id: 1,
    title: 'Navigation & File Operations',
    slug: 'navigation',
    description: 'Master cd, ls, pwd, mkdir, rm, and Linux directory hierarchy fundamentals.',
    totalMissions: 10,
  },
  {
    id: 2,
    title: 'Permissions & Ownership',
    slug: 'permissions',
    description: 'Understand chmod, chown, octal modes, umask, and POSIX security.',
    totalMissions: 8,
  },
  {
    id: 3,
    title: 'Pipes, Redirection & Text Processing',
    slug: 'pipes',
    description: 'Harness grep, sed, awk, sort, cut, stdin, stdout, and stream chaining.',
    totalMissions: 12,
  },
  {
    id: 4,
    title: 'Process Management & Monitoring',
    slug: 'processes',
    description: 'Inspect ps, top, kill, nice, jobs, background daemons, and signals.',
    totalMissions: 9,
  },
  {
    id: 5,
    title: 'Networking & Connectivity',
    slug: 'networking',
    description: 'Master curl, netstat, ss, ping, ssh, dig, and interface sockets.',
    totalMissions: 10,
  },
  {
    id: 6,
    title: 'Bash Scripting & Automation',
    slug: 'scripting',
    description: 'Write executable shell scripts, variables, conditionals, loops, and exits.',
    totalMissions: 11,
  },
  {
    id: 7,
    title: 'User Management & Sudo',
    slug: 'users',
    description: 'Manage useradd, usermod, /etc/shadow, groups, permissions, and visudo.',
    totalMissions: 8,
  },
  {
    id: 8,
    title: 'System Administration & Hardening',
    slug: 'sysadmin',
    description: 'Control systemd units, journalctl logs, cron automations, and firewall rules.',
    totalMissions: 14,
  },
];

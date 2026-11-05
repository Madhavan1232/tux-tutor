// =============================================================================
// TUX TUTOR — JavaScript Color Tokens & World Definitions
// Single source of truth for JS-side color references (White & Crimson).
// =============================================================================

import { colors } from './colors';

export { colors };

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
    title: 'Directory Navigation & File Operations',
    slug: 'navigation',
    description: 'Master cd, ls, pwd, mkdir, rm, and Linux directory hierarchy fundamentals.',
    totalMissions: 10,
  },
  {
    id: 2,
    title: 'Permissions & User Ownership',
    slug: 'permissions',
    description: 'Understand chmod, chown, octal modes, umask, and POSIX security.',
    totalMissions: 8,
  },
  {
    id: 3,
    title: 'Stream Redirection & Text Processing',
    slug: 'pipes',
    description: 'Harness grep, sed, awk, sort, cut, stdin, stdout, and stream chaining.',
    totalMissions: 12,
  },
  {
    id: 4,
    title: 'Process Management & Daemons',
    slug: 'processes',
    description: 'Inspect ps, top, kill, nice, jobs, background daemons, and signals.',
    totalMissions: 9,
  },
  {
    id: 5,
    title: 'Networking & Port Inspection',
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
    title: 'User Management & Sudoers',
    slug: 'users',
    description: 'Manage useradd, usermod, /etc/shadow, groups, permissions, and visudo.',
    totalMissions: 8,
  },
  {
    id: 8,
    title: 'System Hardening & Security Audit',
    slug: 'sysadmin',
    description: 'Control systemd units, journalctl logs, cron automations, and firewall rules.',
    totalMissions: 14,
  },
];

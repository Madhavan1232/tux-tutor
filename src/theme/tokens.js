// =============================================================================
// TUX TUTOR — JavaScript Color Tokens & World Definitions
// Single source of truth for JS-side color references.
// =============================================================================

import { colors } from './colors';

export { colors };
export const COLORS = {
  background:    colors.bg?.base || '#FBFBFD',
  primary:       colors.accent?.default || '#DC2626',
  surface:       colors.bg?.surface || '#FFFFFF',
  secondaryRed:  colors.accent?.hover || '#B91C1C',
  darkBurgundy:  colors.accent?.muted || 'rgba(220, 38, 38, 0.08)',
  deepRed:       colors.accent?.muted || 'rgba(220, 38, 38, 0.08)',
  textPrimary:   colors.text?.primary || '#1D1D1F',
  textSecondary: colors.text?.secondary || '#6E6E73',
};

export const WORLDS = [
  {
    id: 1,
    title: 'Directory Navigation & File Operations',
    slug: 'navigation',
    description: 'Master cd, ls, pwd, mkdir, rm, and POSIX tree traversal.',
    totalMissions: 10,
    commandPreview: 'pwd && ls -la /var/log',
    active: true,
  },
  {
    id: 2,
    title: 'Permissions & User Ownership',
    slug: 'permissions',
    description: 'Deconstruct chmod, chown, octal modes (755, 644), and umask.',
    totalMissions: 8,
    commandPreview: 'chmod 600 id_ed25519',
    active: false,
  },
  {
    id: 3,
    title: 'Stream Redirection & Text Processing',
    slug: 'pipes',
    description: 'Chain grep, sed, awk, stdin, stdout, and standard stream pipes.',
    totalMissions: 12,
    commandPreview: 'grep -rn "FATAL" /var/log | awk \'{print $1}\'',
    active: false,
  },
  {
    id: 4,
    title: 'Process Management & Daemons',
    slug: 'processes',
    description: 'Signal control, ps aux, top, kill -9, nice, and systemd units.',
    totalMissions: 9,
    commandPreview: 'systemctl status sshd',
    active: false,
  },
  {
    id: 5,
    title: 'Networking & Port Inspection',
    slug: 'networking',
    description: 'Examine ss -tulpn, curl, dig, ip route, and iptables socket flow.',
    totalMissions: 10,
    commandPreview: 'ss -tulpn | grep :5000',
    active: false,
  },
  {
    id: 6,
    title: 'Bash Scripting & Automation',
    slug: 'scripting',
    description: 'Craft executable shell programs, variables, conditionals, and loops.',
    totalMissions: 11,
    commandPreview: '#!/usr/bin/env bash',
    active: false,
  },
  {
    id: 7,
    title: 'User Management & Sudoers',
    slug: 'users',
    description: 'Administer useradd, /etc/shadow, group policies, and visudo.',
    totalMissions: 8,
    commandPreview: 'usermod -aG sudo tux',
    active: false,
  },
  {
    id: 8,
    title: 'System Hardening & Security Audit',
    slug: 'security',
    description: 'Audit journalctl logs, SSH hardening, and kernel sysctl flags.',
    totalMissions: 14,
    commandPreview: 'sysctl -w net.ipv4.tcp_syncookies=1',
    active: false,
  },
];

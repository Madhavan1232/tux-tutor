import { colors } from './colors'

export { colors }
export const COLORS = colors

export const WORLDS = [
  {
    id: '001.',
    title: 'Directory Navigation & File Operations',
    slug: 'navigation',
    description: 'Master cd, ls, pwd, mkdir, rm, and POSIX tree traversal.',
    totalMissions: 10,
    commandPreview: 'pwd && ls -la /var/log',
    active: true,
  },
  {
    id: '002.',
    title: 'Permissions & User Ownership',
    slug: 'permissions',
    description: 'Deconstruct chmod, chown, octal modes (755, 644), and umask.',
    totalMissions: 8,
    commandPreview: 'chmod 600 id_ed25519',
    active: false,
  },
  {
    id: '003.',
    title: 'Stream Redirection & Text Processing',
    slug: 'pipes',
    description: 'Chain grep, sed, awk, stdin, stdout, and standard stream pipes.',
    totalMissions: 12,
    commandPreview: 'grep -rn "FATAL" /var/log | awk \'{print $1}\'',
    active: false,
  },
  {
    id: '004.',
    title: 'Process Management & Daemons',
    slug: 'processes',
    description: 'Signal control, ps aux, top, kill -9, nice, and systemd units.',
    totalMissions: 9,
    commandPreview: 'systemctl status sshd',
    active: false,
  },
  {
    id: '005.',
    title: 'Networking & Port Inspection',
    slug: 'networking',
    description: 'Examine ss -tulpn, curl, dig, ip route, and iptables socket flow.',
    totalMissions: 10,
    commandPreview: 'ss -tulpn | grep :5000',
    active: false,
  },
  {
    id: '006.',
    title: 'Bash Scripting & Automation',
    slug: 'scripting',
    description: 'Craft executable shell programs, variables, conditionals, and loops.',
    totalMissions: 11,
    commandPreview: '#!/usr/bin/env bash',
    active: false,
  },
  {
    id: '007.',
    title: 'User Management & Sudoers',
    slug: 'users',
    description: 'Administer useradd, /etc/shadow, group policies, and visudo.',
    totalMissions: 8,
    commandPreview: 'usermod -aG sudo tux',
    active: false,
  },
  {
    id: '008.',
    title: 'System Hardening & Security Audit',
    slug: 'security',
    description: 'Audit journalctl logs, SSH hardening, and kernel sysctl flags.',
    totalMissions: 14,
    commandPreview: 'sysctl -w net.ipv4.tcp_syncookies=1',
    active: false,
  },
]

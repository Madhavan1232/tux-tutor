import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Tux from '../ui/Tux';
import { UserButton } from '../UserButton';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Learn',       icon: '◈' },
  { to: '/terminal',     label: 'Terminal',    icon: '>' },
  { to: '/badges',       label: 'Badges',      icon: '◇' },
  { to: '/bosses',       label: 'Bosses',      icon: '◆' },
  { to: '/leaderboard',  label: 'Ranking',     icon: '≡' },
  { to: '/profile',      label: 'Profile',     icon: '○' },
  { to: '/settings',     label: 'Settings',    icon: '⊙' },
];

/**
 * Sidebar — desktop left navigation + mobile bottom tab bar.
 * Apple-style white surface, dark text, and crimson active state.
 */
export default function Sidebar({ currentUser: propUser, onSignOut: propSignOut }) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  // Context takes priority; props serve as explicit overrides (for pages that still pass them)
  const currentUser = propUser ?? auth.currentUser;
  const authSignOut = propSignOut ?? auth.onSignOut;

  const handleSignOut = () => {
    localStorage.removeItem('tux_user');
    localStorage.removeItem('tux_token');
    localStorage.removeItem('token');
    if (authSignOut) {
      authSignOut();
    } else {
      window.location.href = '/';
    }
  };

  // Derive user display data
  const name = currentUser?.name || currentUser?.username || currentUser?.email?.split('@')[0] || 'User';
  const email = currentUser?.email || '';
  const level = currentUser?.level ?? 1;
  const xp = currentUser?.xp ?? 0;
  const avatarInitials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className={styles.sidebar} aria-label="Main navigation">
        {/* Logo */}
        <div className={styles.logo} aria-label="Tux Tutor">
          <Tux mood="idle" size={36} />
          <span className={styles.logoText}>Tux Tutor</span>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul role="list">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                  aria-current={location.pathname === to ? 'page' : undefined}
                >
                  <span className={styles.icon} aria-hidden="true">{icon}</span>
                  <span className={styles.label}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer — UserButton replaces old Sign Out */}
        <div className={styles.sidebarFooter} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px', padding: '12px 8px 10px' }}>
          <UserButton
            name={name}
            email={email}
            avatarInitials={avatarInitials || 'TT'}
            level={level}
            xp={xp}
            onSignOut={handleSignOut}
            onViewProfile={() => navigate('/profile')}
            onSettings={() => navigate('/settings')}
          />
          <span className={styles.version} style={{ textAlign: 'center', paddingBottom: '2px' }}>v0.1</span>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────── */}
      <nav className={styles.bottomBar} aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.tabActive : ''}`
            }
            aria-label={label}
          >
            <span className={styles.tabIcon} aria-hidden="true">{icon}</span>
            <span className={styles.tabLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

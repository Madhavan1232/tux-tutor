import { NavLink, useLocation } from 'react-router-dom';
import Tux from '../ui/Tux';
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
export default function Sidebar() {
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('tux_user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

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

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.signOutBtn}
            onClick={handleSignOut}
          >
            Sign Out
          </button>
          <span className={styles.version}>v0.1</span>
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

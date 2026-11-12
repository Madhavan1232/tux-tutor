import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Terminal,
  Award,
  Flame,
  Trophy,
  User,
  Settings,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import TuxModel from '../TuxModel';
import { useAuth } from '../../context/AuthContext';
import { useUserProgress } from '../../context/userProgressStore';
import { clearStoredAuth } from '../../utils/auth';
import { formatDisplayName } from '../../utils/user';
import styles from './Sidebar.module.css';

/**
 * Primary navigation item definitions matching Tux Tutor routing.
 */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Learn',    icon: Home,     key: 'dashboard' },
  { to: '/terminal',  label: 'Terminal', icon: Terminal, key: 'terminal' },
  { to: '/badges',    label: 'Badges',   icon: Award,    key: 'badges' },
  { to: '/bosses',    label: 'Bosses',   icon: Flame,    key: 'bosses' },
  { to: '/ranking',   label: 'Ranking',  icon: Trophy,   key: 'ranking' },
];

/**
 * Unified Sidebar component.
 * Combines the clean, enlarged Apple & Crimson visual design with all existing app routing,
 * user authentication context, active route detection, notification badges, and user popover.
 */
export default function Sidebar({
  currentUser: propUser,
  onSignOut: propSignOut,
  notificationCounts = {},
  notificationCount = 0,
  className = '',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const userProgress = useUserProgress();

  // Context takes priority; props serve as explicit overrides
  const currentUser = propUser ?? userProgress?.user ?? auth.currentUser;
  const authSignOut = propSignOut ?? auth.onSignOut;

  // ── User Popover State ───────────────────────────────────────────────
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const handleSignOut = () => {
    clearStoredAuth();
    if (authSignOut) {
      authSignOut();
    } else {
      window.location.href = '/';
    }
  };

  // ── User Profile Resolution ──────────────────────────────────────────
  const fullName = formatDisplayName(currentUser) || 'User';
  const displayEmail = currentUser?.email || '';
  const level = currentUser?.level ?? 1;
  const xp = currentUser?.xp ?? 0;
  const streak = currentUser?.streak ?? 0;
  const levelText = `Lv.${level} · ${xp.toLocaleString()} XP`;

  // Avatar initials: First letters of multi-word name, or first 2 chars of single word
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const avatarInitials =
    (nameParts.length >= 2
      ? nameParts
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join('')
      : fullName.slice(0, 2).toUpperCase()) || 'T';

  // ── Active Route Detection ───────────────────────────────────────────
  const isItemActive = (to) => {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (to === '/terminal') {
      return location.pathname === '/terminal' || location.pathname.startsWith('/missions');
    }
    if (to === '/ranking') {
      return location.pathname === '/ranking' || location.pathname === '/leaderboard';
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  // ── Notification Count Resolution ────────────────────────────────────
  const getBadgeFor = (item) => {
    if (notificationCounts && typeof notificationCounts[item.key] === 'number') {
      return notificationCounts[item.key];
    }
    if (notificationCounts && typeof notificationCounts[item.to] === 'number') {
      return notificationCounts[item.to];
    }
    if (item.key === 'badges' && notificationCount > 0) {
      return notificationCount;
    }
    return 0;
  };

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`${styles.sidebarContainer} ${className}`}
        aria-label="Main navigation"
      >
        {/* Brand / Logo */}
        <NavLink to="/dashboard" className={styles.logo} aria-label="Tux Tutor">
          <TuxModel size={36} animate={false} />
          <span className={styles.appTitle}>
            <span className={styles.titleTux}>TUX</span>{' '}
            <span className={styles.titleTutor}>TUTOR</span>
          </span>
        </NavLink>

        {/* Navigation Items */}
        <nav className={styles.scrollArea}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.to);
            const badgeCount = getBadgeFor(item);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.3 : 2}
                  />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
                {badgeCount > 0 && (
                  <span
                    className={styles.badge}
                    aria-label={`${badgeCount} unread items`}
                  >
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── User Profile Card at Bottom ────────────────────────────── */}
        <div className={styles.bottomSection} ref={userMenuRef}>
          <button
            type="button"
            className={styles.userButton}
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="dialog"
            aria-label={`${fullName} — open user menu`}
            data-testid="user-button"
          >
            {/* Avatar Circle with Initials on Red Background */}
            <div
              className={styles.avatarCircle}
              data-testid="user-avatar"
            >
              {avatarInitials}
            </div>

            {/* Username & Level */}
            <div className={styles.userDetails}>
              <span className={styles.userName} data-testid="user-name">
                {fullName}
              </span>
              <span className={styles.userLevel} data-testid="user-level">
                {levelText}
                {streak > 0 && (
                  <>
                    {' · '}
                    <span className={styles.streakFireGlow}>🔥</span> {streak}d
                  </>
                )}
              </span>
            </div>

            <ChevronRight
              size={16}
              className={styles.userChevron}
              style={{
                transform: isUserMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div
              className={styles.userPopover}
              role="dialog"
              aria-label="User menu"
              data-testid="user-popover"
            >
              <div
                className={styles.popoverHeader}
                data-testid="popover-user-header"
              >
                <div
                  className={styles.popoverHeaderName}
                  data-testid="popover-name"
                >
                  {fullName}
                </div>
                {displayEmail && (
                  <div
                    className={styles.popoverHeaderEmail}
                    data-testid="popover-email"
                  >
                    {displayEmail}
                  </div>
                )}
                <div className={styles.popoverStats}>
                  <span data-testid="popover-level-xp">
                    Level {level} · {xp.toLocaleString()} XP
                  </span>
                  {streak > 0 && (
                    <span className={styles.popoverStreak}>
                      <span className={styles.streakFireGlow}>🔥</span> {streak} day streak
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={styles.popoverItem}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/profile');
                }}
              >
                <User size={15} />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                className={styles.popoverItem}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
              >
                <Settings size={15} />
                <span>Settings</span>
              </button>

              <hr className={styles.divider} />

              <button
                type="button"
                className={`${styles.popoverItem} ${styles.popoverItemDanger}`}
                data-testid="menu-sign-out"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleSignOut();
                }}
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────── */}
      <nav className={styles.bottomBar} aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-label={item.label}
            >
              <span className={styles.tabIcon} aria-hidden="true">
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className={styles.tabLabel}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

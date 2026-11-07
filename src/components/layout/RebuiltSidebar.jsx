import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Search,
  Bell,
  Settings,
  Users,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import styles from './RebuiltSidebar.module.css';

/**
 * RebuiltSidebar — Streamlined and enlarged navigation structure:
 * 1. Prominent Primary Navigation (Home, Search, Notifications with red badge, Settings)
 * 2. Team action row (Invite people)
 * 3. Bottom user profile card (Avatar initials, name, email, popover menu)
 *
 * Strictly adheres to Tux Tutor Global Design System (Apple White & Crimson).
 */
export default function RebuiltSidebar({
  currentUser,
  onSignOut,
  activeKey = 'home',
  onSelect,
  notificationCount = 3,
  onInviteClick,
  onSearchClick,
  onNotificationsClick,
  onSettingsClick,
  className = '',
}) {
  // ── User Popover State ───────────────────────────────────────────────
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  // ── User Information Resolution ──────────────────────────────────────
  const displayName = currentUser?.name || currentUser?.username || 'Jane Doe';
  const displayEmail = currentUser?.email || 'jane@acme.com';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'JD';

  const handleItemClick = (key, customHandler) => {
    if (customHandler) {
      customHandler();
    }
    if (onSelect) {
      onSelect(key);
    }
  };

  return (
    <aside
      className={`${styles.sidebarContainer} ${className}`}
      aria-label="Application sidebar"
    >
      {/* ── 1. Scrollable Center Navigation (Enlarged Primary Items) ───── */}
      <div className={styles.scrollArea}>
        {/* Home */}
        <button
          type="button"
          className={`${styles.navItem} ${activeKey === 'home' ? styles.navItemActive : ''}`}
          onClick={() => handleItemClick('home')}
          aria-current={activeKey === 'home' ? 'page' : undefined}
        >
          <span className={styles.navIcon}>
            <Home
              size={22}
              strokeWidth={activeKey === 'home' ? 2.3 : 2}
              fill={activeKey === 'home' ? 'currentColor' : 'none'}
            />
          </span>
          <span className={styles.navLabel}>Home</span>
        </button>

        {/* Search */}
        <button
          type="button"
          className={`${styles.navItem} ${activeKey === 'search' ? styles.navItemActive : ''}`}
          onClick={() => handleItemClick('search', onSearchClick)}
        >
          <span className={styles.navIcon}>
            <Search size={22} strokeWidth={activeKey === 'search' ? 2.3 : 2} />
          </span>
          <span className={styles.navLabel}>Search</span>
        </button>

        {/* Notifications (with prominent crimson badge) */}
        <button
          type="button"
          className={`${styles.navItem} ${
            activeKey === 'notifications' ? styles.navItemActive : ''
          }`}
          onClick={() => handleItemClick('notifications', onNotificationsClick)}
        >
          <span className={styles.navIcon}>
            <Bell size={22} strokeWidth={activeKey === 'notifications' ? 2.3 : 2} />
          </span>
          <span className={styles.navLabel}>Notifications</span>
          {notificationCount > 0 && (
            <span
              className={styles.badge}
              aria-label={`${notificationCount} unread notifications`}
            >
              {notificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          type="button"
          className={`${styles.navItem} ${
            activeKey === 'settings' ? styles.navItemActive : ''
          }`}
          onClick={() => handleItemClick('settings', onSettingsClick)}
        >
          <span className={styles.navIcon}>
            <Settings size={22} strokeWidth={activeKey === 'settings' ? 2.3 : 2} />
          </span>
          <span className={styles.navLabel}>Settings</span>
        </button>
      </div>

      <hr className={styles.divider} />

      {/* ── 2. Team Action Section (Invite people) ───────────────────── */}
      <div className={styles.actionSection}>
        <button
          type="button"
          className={`${styles.navItem} ${styles.actionNavItem} ${
            activeKey === 'invite' ? styles.navItemActive : ''
          }`}
          onClick={() => handleItemClick('invite', onInviteClick)}
        >
          <span className={styles.navIcon}>
            <Users size={21} strokeWidth={2} />
          </span>
          <span className={styles.navLabel}>Invite people</span>
        </button>
      </div>

      <hr className={styles.divider} />

      {/* ── 3. Bottom User Profile Section ───────────────────────────── */}
      <div className={styles.bottomSection} ref={userMenuRef}>
        <button
          type="button"
          className={styles.userButton}
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          aria-expanded={isUserMenuOpen}
          aria-haspopup="menu"
          aria-label="User profile menu"
        >
          {/* Avatar Circle with Initials 'JD' */}
          <div className={styles.avatarCircle}>{initials}</div>

          {/* User Details */}
          <div className={styles.userDetails}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userEmail}>{displayEmail}</span>
          </div>

          <ChevronRight size={16} className={styles.userChevron} />
        </button>

        {/* User Popover Menu */}
        {isUserMenuOpen && (
          <div className={styles.userPopover} role="menu">
            <div className={styles.popoverHeader}>
              <div className={styles.popoverHeaderName}>{displayName}</div>
              <div className={styles.popoverHeaderEmail}>{displayEmail}</div>
            </div>

            <button
              type="button"
              className={styles.popoverItem}
              onClick={() => {
                setIsUserMenuOpen(false);
                if (onSettingsClick) onSettingsClick();
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
                if (onSettingsClick) onSettingsClick();
              }}
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>

            <hr className={styles.divider} style={{ margin: '4px 0' }} />

            <button
              type="button"
              className={`${styles.popoverItem} ${styles.popoverItemDanger}`}
              onClick={() => {
                setIsUserMenuOpen(false);
                if (onSignOut) onSignOut();
              }}
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, Bell, ShieldCheck, Layers, ExternalLink } from 'lucide-react';
import RebuiltSidebar from '../../components/layout/RebuiltSidebar';
import styles from './SidebarPreviewPage.module.css';

export default function SidebarPreviewPage({ currentUser: propUser }) {
  const navigate = useNavigate();

  // Active selection inside the sidebar
  const [activeKey, setActiveKey] = useState('home');

  // Controls for interactive testing
  const [userMode, setUserMode] = useState('reference'); // 'reference' (Jane Doe) | 'active' (Logged-in user)
  const [notificationCount, setNotificationCount] = useState(3);

  // Modals / Feedback
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const activeUser =
    userMode === 'reference'
      ? { name: 'Jane Doe', email: 'jane@acme.com', level: 1 }
      : propUser || { name: 'Active Operative', email: 'tux@academy.dev', level: 3 };

  const handleSidebarSelect = (key) => {
    setActiveKey(key);
    if (key === 'home') {
      showToast('Navigated to Home (Dashboard)');
    } else if (key.startsWith('doc-')) {
      const docName = key.replace('doc-', '');
      showToast(`Selected document: "${docName.charAt(0).toUpperCase() + docName.slice(1)}"`);
    }
  };

  const handleSignOut = () => {
    showToast('Sign out action triggered successfully');
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviteOpen(false);
    showToast(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail('');
  };

  return (
    <div className={styles.previewContainer}>
      {/* ── Fixed Sidebar on the Left (Exact match to reference) ──── */}
      <div className={styles.sidebarWrapper}>
        <RebuiltSidebar
          currentUser={activeUser}
          onSignOut={handleSignOut}
          activeKey={activeKey}
          onSelect={handleSidebarSelect}
          notificationCount={notificationCount}
          onInviteClick={() => setIsInviteOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
          onNotificationsClick={() => {
            showToast(`You have ${notificationCount} unread notifications`);
          }}
          onSettingsClick={() => {
            showToast('Opened Settings');
          }}
        />
      </div>

      {/* ── Interactive Inspection & Verification Area ─────────────── */}
      <main className={styles.contentArea}>
        <div className={styles.topBar}>
          <span className={styles.badgePill}>
            <Layers size={13} />
            Structural Sidebar Rebuild Preview
          </span>

          <button
            type="button"
            className="apple-btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Go to Dashboard <ExternalLink size={13} style={{ marginLeft: '4px' }} />
          </button>
        </div>

        <h1 className={styles.heroHeading}>Rebuilt Sidebar Verification</h1>
        <p className={styles.heroSub}>
          Updated based on your specifications: workspace header and projects division removed,
          and primary navigation (Home, Search, Notifications, Settings) enlarged for superior
          visual presence, while strictly adhering to the Apple Store white &amp; crimson design system.
        </p>

        {/* ── Active Selection Feedback ──────────────────────────────── */}
        <div className={styles.activeSelectionCard}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
              CURRENTLY ACTIVE SIDEBAR ITEM:
            </div>
            <div className={styles.activeSelectionKey}>
              <code>{activeKey}</code>
            </div>
          </div>
          <span style={{ fontSize: '12.5px', color: '#15803D', fontWeight: 600 }}>
            ● Interactive &amp; Reactive
          </span>
        </div>

        {/* ── Testing Controls ───────────────────────────────────────── */}
        <div className={styles.controlGrid}>
          {/* User Profile Switcher */}
          <div className={styles.controlCard}>
            <div className={styles.controlCardTitle}>
              <Users size={16} /> User Profile Mock
            </div>
            <div className={styles.buttonRow}>
              <button
                type="button"
                className={`${styles.pillButton} ${
                  userMode === 'reference' ? styles.pillButtonActive : ''
                }`}
                onClick={() => setUserMode('reference')}
              >
                Jane Doe (Reference)
              </button>
              <button
                type="button"
                className={`${styles.pillButton} ${
                  userMode === 'active' ? styles.pillButtonActive : ''
                }`}
                onClick={() => setUserMode('active')}
              >
                Current User Session
              </button>
            </div>
          </div>

          {/* Notification Badge Adjuster */}
          <div className={styles.controlCard}>
            <div className={styles.controlCardTitle}>
              <Bell size={16} /> Notification Badge Count
            </div>
            <div className={styles.buttonRow}>
              {[3, 5, 9, 0].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`${styles.pillButton} ${
                    notificationCount === count ? styles.pillButtonActive : ''
                  }`}
                  onClick={() => setNotificationCount(count)}
                >
                  {count === 0 ? 'Clear (0)' : `${count} notifications`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reference Architecture Checklist ───────────────────────── */}
        <div className={styles.verificationCard}>
          <h2 className={styles.verificationTitle}>Sidebar Implementation Checklist</h2>
          <div className={styles.checklist}>
            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkIcon} />
              <div className={styles.checkText}>
                <span className={styles.checkLabel}>1. Enlarged Primary Navigation Items</span>
                <p className={styles.checkDesc}>
                  Home, Search, Notifications, and Settings have enlarged touch targets (48px height),
                  larger 21px icons, 15px font size, and generous spacing for high visual clarity.
                </p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkIcon} />
              <div className={styles.checkText}>
                <span className={styles.checkLabel}>2. Workspace Header Removed</span>
                <p className={styles.checkDesc}>
                  The Acme Workspace squircle button, subtitle, and dropdown menu have been completely removed.
                </p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkIcon} />
              <div className={styles.checkText}>
                <span className={styles.checkLabel}>3. Projects Division Removed</span>
                <p className={styles.checkDesc}>
                  The entire Projects division, including nested folders and guide lines, has been removed to keep the layout minimal and focused.
                </p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkIcon} />
              <div className={styles.checkText}>
                <span className={styles.checkLabel}>4. Scaled Red Pill Notification Badge</span>
                <p className={styles.checkDesc}>
                  The red badge (showing 3) now scales cleanly with the enlarged navigation row, featuring crisp white typography and a crimson elevation shadow.
                </p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkIcon} />
              <div className={styles.checkText}>
                <span className={styles.checkLabel}>5. Bottom Team &amp; User Profile Sections Intact</span>
                <p className={styles.checkDesc}>
                  Retains "Invite people" and the bottom User Profile card with initials avatar ("JD"), user details, and interactive sign-out popover.
                </p>
              </div>
            </div>

            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkIcon} />
              <div className={styles.checkText}>
                <span className={styles.checkLabel}>6. Design System Compliance</span>
                <p className={styles.checkDesc}>
                  Zero foreign color palettes introduced. Uses strictly <code>--color-bg-surface</code> (#FFFFFF),{' '}
                  <code>--color-text-primary</code> (#1D1D1F), <code>--color-text-secondary</code> (#6E6E73),{' '}
                  <code>--color-accent</code> (#DC2626), and SF Pro / Inter typography tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Search Command Palette Modal ────────────────────────────── */}
      {isSearchOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsSearchOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Quick Search</h3>
            <p className={styles.modalSub}>Type a command, project, or document to jump to...</p>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, commands, labs..."
              className={styles.modalInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsSearchOpen(false);
                  showToast(`Searched for "${searchQuery}"`);
                  setSearchQuery('');
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className="apple-btn-secondary"
                onClick={() => setIsSearchOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite People Modal ─────────────────────────────────────── */}
      {isInviteOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsInviteOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Invite Team Members</h3>
            <p className={styles.modalSub}>Collaborate on projects, missions, and sandbox environments.</p>
            <form onSubmit={handleSendInvite}>
              <input
                type="email"
                autoFocus
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className={styles.modalInput}
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="apple-btn-secondary"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="apple-btn-primary">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Notification ──────────────────────────────────────── */}
      {toastMessage && (
        <div className={styles.toast} role="status">
          <ShieldCheck size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import DashboardPage from './features/dashboard/DashboardPage';
import SidebarPreviewPage from './features/sidebar-preview/SidebarPreviewPage';
import AppShell from './components/layout/AppShell';
import { AuthContext } from './context/AuthContext';
import tuxLogo from './assets/logo.png';
import styles from './App.module.css';

function Placeholder({ title }) {
  return (
    <AppShell>
      <div className={styles.placeholder}>
        <span className={styles.placeholderOverline}>Coming soon</span>
        <h1 className={styles.placeholderTitle}>{title}</h1>
        <p className={styles.placeholderText}>
          This page is under construction. Head back to{' '}
          <a href="/dashboard">Learn</a>.
        </p>
      </div>
    </AppShell>
  );
}

/**
 * Root Application Router with Authentication & Protected Learning Dashboard.
 */
export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tux_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // URL route parsing for password reset link — strictly active on /reset-password
  const [resetToken, setResetToken] = useState(() => {
    try {
      if (!window.location.pathname.includes('reset-password')) return '';
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    } catch {
      return '';
    }
  });

  const [isResetRoute, setIsResetRoute] = useState(() => {
    try {
      return window.location.pathname.includes('reset-password');
    } catch {
      return false;
    }
  });

  const [authNotice, setAuthNotice] = useState('');
  const [prefilledEmail, setPrefilledEmail] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('tux_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('tux_user');
        localStorage.removeItem('token');
      }
    } catch {
      // storage unavailable
    }
  }, [currentUser]);

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  const handleNavigateToLoginFromReset = (email = '', notice = '') => {
    try {
      const cleanPath = window.location.pathname.replace('/reset-password', '') || '/';
      window.history.replaceState({}, document.title, cleanPath);
    } catch {
      // ignore
    }
    setPrefilledEmail(email);
    setAuthNotice(notice);
    setIsResetRoute(false);
    setResetToken('');
  };

  if (isInitializing) {
    return (
      <div
        className="tux-splash-screen"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--color-bg-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <img
          src={tuxLogo}
          alt="TUX TUTOR"
          className="tux-logo-pulse"
          style={{
            width: '100px',
            height: '100px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 16px rgba(220, 38, 38, 0.25))',
          }}
        />
        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="apple-eyebrow">
            Tux Tutor — Initializing Sandbox
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated or Password Reset flow
  if (!currentUser) {
    if (isResetRoute) {
      return (
        <ResetPasswordPage
          token={resetToken}
          onNavigateToLogin={handleNavigateToLoginFromReset}
        />
      );
    }

    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        initialEmail={prefilledEmail}
        initialNotice={authNotice}
      />
    );
  }

  // Authenticated Learning Dashboard & Terminal
  return (
    <AuthContext.Provider value={{ currentUser, onSignOut: handleSignOut }}>
      <BrowserRouter>
        <Routes>
          <Route path="/sidebar" element={<SidebarPreviewPage currentUser={currentUser} />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/terminal" element={<Placeholder title="Terminal" />} />
          <Route path="/badges" element={<Placeholder title="Badges" />} />
          <Route path="/bosses" element={<Placeholder title="Boss Challenges" />} />
          <Route path="/leaderboard" element={<Placeholder title="Leaderboard" />} />
          <Route
            path="/profile"
            element={
              <AppShell>
                <div className={styles.placeholder}>
                  <span className={styles.placeholderOverline}>Active Session</span>
                  <h1 className={styles.placeholderTitle}>{currentUser.email || currentUser.username}</h1>
                  <p className={styles.placeholderText}>
                    Authenticated operative ID: <code>UID: 1000</code>
                  </p>
                  <button
                    type="button"
                    className="apple-btn-secondary"
                    onClick={handleSignOut}
                    style={{ marginTop: '16px' }}
                  >
                    Sign Out
                  </button>
                </div>
              </AppShell>
            }
          />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

import { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { AuthContext } from './context/AuthContext';
import { UserProgressProvider } from './context/UserProgressContext';
import { getStoredToken, clearStoredAuth } from './utils/auth';
import { formatDisplayName } from './utils/user';
import TuxLoader from './components/TuxLoader';
import styles from './App.module.css';

const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const SidebarPreviewPage = lazy(() => import('./features/sidebar-preview/SidebarPreviewPage'));
const MissionPage = lazy(() => import('./features/mission/MissionPage'));

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

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
  const [showLoader, setShowLoader] = useState(true);
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
  const [authSessionKey, setAuthSessionKey] = useState(0);
  const hasLocalProgressMutationRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Refresh user profile from /api/auth/me when a JWT exists so displayName stays synced
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return undefined;

    const controller = new AbortController();
    fetch(`${API_BASE}/api/auth/me`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          clearStoredAuth();
          setCurrentUser(null);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (!controller.signal.aborted && data?.user) {
          setCurrentUser((prev) => {
            if (!prev || !hasLocalProgressMutationRef.current) {
              return data.user;
            }
            return {
              ...data.user,
              xp: prev.xp ?? data.user.xp,
              level: prev.level ?? data.user.level,
              streak: prev.streak ?? data.user.streak,
            };
          });
        }
      })
      .catch(() => {
        // Ignore network/abort errors during background profile sync
      });

    return () => {
      controller.abort();
    };
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
    hasLocalProgressMutationRef.current = false;
    setAuthSessionKey((k) => k + 1);
    setCurrentUser(userData);
  };

  const handleSignOut = () => {
    hasLocalProgressMutationRef.current = false;
    clearStoredAuth();
    setAuthSessionKey((k) => k + 1);
    setCurrentUser(null);
  };

  const handleProgressMutated = useCallback(() => {
    hasLocalProgressMutationRef.current = true;
  }, []);

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

  let content;
  if (!currentUser) {
    content = isResetRoute ? (
      <ResetPasswordPage
        token={resetToken}
        onNavigateToLogin={handleNavigateToLoginFromReset}
      />
    ) : (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        initialEmail={prefilledEmail}
        initialNotice={authNotice}
      />
    );
  } else {
    content = (
      <AuthContext.Provider
        value={{ currentUser, onSignOut: handleSignOut, updateCurrentUser: setCurrentUser }}
      >
        <UserProgressProvider
          key={authSessionKey}
          currentUser={currentUser}
          onSyncUser={setCurrentUser}
          onProgressMutated={handleProgressMutated}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/sidebar" element={<SidebarPreviewPage currentUser={currentUser} />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/missions/:id" element={<MissionPage />} />
              <Route path="/terminal" element={<Navigate to="/missions/1" replace />} />
              <Route path="/badges" element={<Placeholder title="Badges" />} />
              <Route path="/bosses" element={<Placeholder title="Boss Challenges" />} />
              <Route path="/ranking" element={<Placeholder title="Leaderboard" />} />
              <Route path="/leaderboard" element={<Placeholder title="Leaderboard" />} />
              <Route
                path="/profile"
                element={
                  <AppShell>
                    <div className={styles.placeholder}>
                      <span className={styles.placeholderOverline}>Active Session</span>
                      <h1 className={styles.placeholderTitle}>
                        {formatDisplayName(currentUser) || currentUser.email || currentUser.username}
                      </h1>
                      <p className={styles.placeholderText}>
                        {currentUser.email ? `${currentUser.email} · ` : ''}
                        Authenticated operative ID: <code>UID: {currentUser.id}</code>
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
        </UserProgressProvider>
      </AuthContext.Provider>
    );
  }

  return (
    <>
      <Suspense fallback={showLoader ? null : <TuxLoader />}>
        {content}
      </Suspense>
      {showLoader && (
        <TuxLoader
          isDone={!isInitializing}
          onExited={() => setShowLoader(false)}
        />
      )}
    </>
  );
}

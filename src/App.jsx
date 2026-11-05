import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './features/dashboard/DashboardPage';

/**
 * App — root router.
 * The dashboard is the primary destination.
 * Other routes (Terminal, Badges, etc.) are placeholders ready to be filled in.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard — main feature */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Placeholder routes — ready for future pages */}
        <Route path="/terminal"    element={<Placeholder title="Terminal" />} />
        <Route path="/badges"      element={<Placeholder title="Badges" />} />
        <Route path="/bosses"      element={<Placeholder title="Boss Challenges" />} />
        <Route path="/leaderboard" element={<Placeholder title="Leaderboard" />} />
        <Route path="/profile"     element={<Placeholder title="Profile" />} />
        <Route path="/settings"    element={<Placeholder title="Settings" />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Placeholder — temporary page shell for routes not yet implemented.
 * Uses the same AppShell so the sidebar + layout is always visible.
 */
import AppShell from './components/layout/AppShell';
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

export default App;

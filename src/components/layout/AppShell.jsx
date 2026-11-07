import Sidebar from './Sidebar';
import styles from './AppShell.module.css';

/**
 * AppShell — 3-column layout: sidebar | main content | right rail.
 * The sidebar is fixed; main and rail scroll independently.
 *
 * @param {React.ReactNode} children    — center column content
 * @param {React.ReactNode} [rail]      — optional right-rail content
 * @param {object}          [currentUser] — authenticated user object
 * @param {Function}        [onSignOut]   — sign-out handler
 */
export default function AppShell({ children, rail, currentUser, onSignOut }) {
  return (
    <div className={styles.shell}>
      <Sidebar currentUser={currentUser} onSignOut={onSignOut} />

      <div className={styles.body}>
        {/* ── Center / Main ────────────────────────────────────────── */}
        <main className={styles.main} id="main-content" tabIndex={-1}>
          {children}
        </main>

        {/* ── Right Rail ───────────────────────────────────────────── */}
        {rail && (
          <aside className={styles.rail} aria-label="Stats and activity">
            {rail}
          </aside>
        )}
      </div>
    </div>
  );
}

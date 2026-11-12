import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Check, Pencil } from 'lucide-react';
import TuxModel from '../TuxModel';
import { useAuth } from '../../context/AuthContext';
import { getStoredToken } from '../../utils/auth';
import { validateDisplayName } from '../../utils/user';
import styles from './NameSetupPage.module.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * NameSetupPage — onboarding screen shown after OTP signup when name is empty,
 * or after first-time Google OAuth to confirm/edit the Google displayName.
 */
export default function NameSetupPage({ onComplete }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, updateCurrentUser } = useAuth();

  const initialPrefill = (
    location.state?.prefill ||
    (currentUser?.isNewGoogleUser
      ? currentUser?.googleName || currentUser?.displayName || currentUser?.name
      : '') ||
    ''
  ).trim();

  const [mode, setMode] = useState(() => (initialPrefill ? 'confirm' : 'edit'));
  const [nameInput, setNameInput] = useState(initialPrefill);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === 'edit') {
      inputRef.current?.focus();
    }
  }, [mode]);

  const saveName = async (candidateName, { fromConfirm = false } = {}) => {
    if (submitting) return;

    const validation = validateDisplayName(candidateName);
    if (!validation.valid) {
      setError(validation.error);
      if (fromConfirm) {
        setNameInput(candidateName);
        setMode('edit');
      } else {
        inputRef.current?.focus();
      }
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE}/api/user/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: validation.value }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not save your name. Please try again.');
      }

      if (updateCurrentUser) {
        const updated = data.user
          ? {
              ...currentUser,
              ...data.user,
              displayName: data.user.displayName ?? validation.value,
              name: data.user.name ?? validation.value,
              isNewGoogleUser: false,
            }
          : {
              ...currentUser,
              displayName: validation.value,
              name: validation.value,
              isNewGoogleUser: false,
            };
        updateCurrentUser(updated);
      }

      onComplete?.();
      navigate('/dashboard', { replace: true, state: null });
    } catch (err) {
      setError(err.message || 'Could not save your name. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    void saveName(nameInput);
  };

  return (
    <div className={styles.stage}>
      <main className={styles.cardWrapper}>
        <div className={styles.card}>
          <div className={styles.logoLockup}>
            <TuxModel size={40} animate={false} interactive />
            <span className={styles.brandName}>TUX TUTOR</span>
          </div>

          {mode === 'confirm' ? (
            <>
              <header className={styles.cardHeader}>
                <h1 className={styles.title}>Is this your name?</h1>
                <p className={styles.subtitle}>
                  This is how you&apos;ll appear on leaderboards and your profile.
                </p>
              </header>

              <div className={styles.nameCard} data-testid="google-name-card">
                <span className={styles.nameCardValue}>{initialPrefill}</span>
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <AlertCircle size={16} strokeWidth={2} className={styles.errorIcon} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.confirmActions}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void saveName(initialPrefill, { fromConfirm: true })}
                  className={styles.submitButton}
                >
                  <Check size={16} strokeWidth={2.3} aria-hidden="true" />
                  <span>{submitting ? 'Saving...' : "Yes, that's me"}</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setError('');
                    setNameInput(initialPrefill);
                    setMode('edit');
                  }}
                  className={styles.secondaryButton}
                >
                  <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                  <span>Edit name</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <header className={styles.cardHeader}>
                <h1 className={styles.title}>What should we call you?</h1>
                <p className={styles.subtitle}>
                  This is how you&apos;ll appear on leaderboards and your profile.
                </p>
              </header>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <AlertCircle size={16} strokeWidth={2} className={styles.errorIcon} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label htmlFor="onboarding-name-input" className={styles.visuallyHidden}>
                    Your name
                  </label>
                  <input
                    ref={inputRef}
                    id="onboarding-name-input"
                    name="name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your name"
                    autoComplete="name"
                    disabled={submitting}
                    aria-invalid={Boolean(error)}
                    className={`${styles.input} ${error ? styles.inputInvalid : ''}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitButton}
                >
                  <span>{submitting ? 'Saving...' : "Let's go"}</span>
                  {!submitting && <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Eye, EyeOff, Info, CheckCircle2, AlertTriangle, SquareChevronRight } from "lucide-react"
import tuxLogo from "../../assets/logo.png"

const API_BASE_URL = "http://localhost:5000/api/auth"

const PASSWORD_RULES = [
    { id: "length", label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
]

function CrimsonSpinner({ size = 16, color = "currentColor" }) {
    return (
        <span
            className="apple-spinner"
            style={{ width: size, height: size, borderTopColor: color }}
            aria-hidden="true"
        />
    )
}

export default function ResetPasswordPage({ token, onNavigateToLogin }) {
    // Token verification state
    const [isVerifying, setIsVerifying] = useState(true)
    const [tokenError, setTokenError] = useState("")
    const [targetEmail, setTargetEmail] = useState("")

    // Form fields
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Form submit states
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    // Verify token on mount
    useEffect(() => {
        let isMounted = true

        const verifyToken = async () => {
            if (!token || typeof token !== "string" || !token.trim()) {
                if (isMounted) {
                    setTokenError("No password reset token was provided.")
                    setIsVerifying(false)
                }
                return
            }

            try {
                const res = await fetch(`${API_BASE_URL}/verify-reset-token?token=${encodeURIComponent(token.trim())}`)
                const data = await res.json()

                if (!res.ok || !data.success) {
                    throw new Error(data.error || "This password reset link is invalid or has expired.")
                }

                if (isMounted) {
                    setTargetEmail(data.email || "")
                    setIsVerifying(false)
                }
            } catch (err) {
                if (isMounted) {
                    setTokenError(err.message || "This password reset link is invalid or has expired.")
                    setIsVerifying(false)
                }
            }
        }

        verifyToken()

        return () => {
            isMounted = false
        }
    }, [token])

    // Password criteria evaluation (min 8 characters)
    const rulesMet = PASSWORD_RULES.map((rule) => ({
        ...rule,
        met: rule.test(newPassword),
    }))
    const hasSpaces = /\s/.test(newPassword)
    const isNewPasswordValid = newPassword.length >= 8 && !hasSpaces

    let strengthLabel = ""
    let strengthColor = "transparent"
    let barWidthPercent = 0

    if (newPassword.length > 0) {
        if (newPassword.length < 8) {
            strengthLabel = "Too short"
            strengthColor = "#DC2626"
            barWidthPercent = Math.min(85, Math.round((newPassword.length / 8) * 100))
        } else {
            strengthLabel = "Valid"
            strengthColor = "#15803D"
            barWidthPercent = 100
        }
    }

    const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!newPassword || !isNewPasswordValid) {
            setError(hasSpaces ? "Password cannot contain spaces." : "Password must be at least 8 characters long.")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Confirm password does not match new password.")
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token.trim(),
                    newPassword,
                    confirmPassword,
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset password. Please try again.")
            }

            setIsSuccess(true)

            // Transition to sign in after brief feedback
            setTimeout(() => {
                if (onNavigateToLogin) {
                    onNavigateToLogin(targetEmail, "Your password has been successfully reset. Please sign in with your new password.")
                }
            }, 1200)
        } catch (err) {
            setError(err.message || "Failed to reset password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="apple-auth-stage">
            {/* Top Apple-Style Frosted Header */}
            <header className="apple-global-header">
                <div className="apple-header-inner">
                    <div className="apple-logo-lockup">
                        <img
                            src={tuxLogo}
                            alt="TUX TUTOR Mascot"
                            className="apple-logo-img"
                        />
                        <span className="apple-brand-name">TUX TUTOR</span>
                    </div>
                    <div className="apple-header-badge">
                        <span className="apple-eyebrow">Linux Learning Platform</span>
                    </div>
                </div>
            </header>

            {/* Split Content Layout */}
            <main className="apple-auth-layout">
                {/* LEFT COLUMN (50%): Brand Panel */}
                <section className="apple-brand-panel">
                    <div className="apple-brand-content">
                        <div className="apple-brand-hero">
                            <span className="apple-eyebrow">{"ACCOUNT RECOVERY \u00B7 SECURE RESET"}</span>
                            <h1 className="apple-display-headline">
                                <span className="headline-accent">Learn Linux.</span>
                                <span className="headline-rest"> The right way.</span>
                            </h1>
                            <p className="apple-body-lead">
                                Hands-on labs, guided paths, and real terminal practice — from complete beginner to production-ready developer.
                            </p>
                        </div>

                        <ul className="apple-features-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            <li style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
                                <SquareChevronRight size={20} color="#DC2626" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: "2px" }} />
                                <div>
                                    <strong style={{ fontSize: "15px", color: "#1D1D1F", display: "block" }}>
                                        Interactive terminal sandbox
                                    </strong>
                                    <span style={{ fontSize: "14px", color: "#6E6E73", lineHeight: "1.55" }}>
                                        A real Linux environment running directly in your browser.
                                    </span>
                                </div>
                            </li>
                            <li style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
                                <SquareChevronRight size={20} color="#DC2626" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: "2px" }} />
                                <div>
                                    <strong style={{ fontSize: "15px", color: "#1D1D1F", display: "block" }}>
                                        Encrypted Credentials
                                    </strong>
                                    <span style={{ fontSize: "14px", color: "#6E6E73", lineHeight: "1.55" }}>
                                        Industry-grade cryptographic hashing and single-use time-expiring reset tokens.
                                    </span>
                                </div>
                            </li>
                        </ul>

                        <div className="apple-terminal-card" aria-hidden="true">
                            <div className="apple-terminal-titlebar">
                                <div className="apple-terminal-dots">
                                    <span className="term-dot dot-red" />
                                    <span className="term-dot dot-yellow" />
                                    <span className="term-dot dot-green" />
                                </div>
                                <span className="apple-terminal-label">Security Protocol: Active</span>
                            </div>
                            <pre className="apple-terminal-code">
                                <span className="t-prompt">$</span> tux auth verify-token --scope=password-reset{'\n'}
                                <span className="t-success">✓ Cryptographic token validated (TLS 1.3 / bcrypt)</span>{'\n'}
                                <span className="t-prompt">$</span> <span className="t-cursor" />
                            </pre>
                        </div>
                    </div>
                </section>

                {/* RIGHT COLUMN (50%): Reset Form Card */}
                <section className="apple-auth-panel">
                    <div className="apple-card-wrapper">
                        {isVerifying ? (
                            <motion.div
                                key="verifying-card"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="apple-auth-card"
                                style={{ textAlign: "center", padding: "48px 38px" }}
                            >
                                <CrimsonSpinner size={28} color="#DC2626" />
                                <h2 className="apple-card-title" style={{ marginTop: "18px", fontSize: "20px" }}>
                                    Verifying Security Link...
                                </h2>
                                <p className="apple-body" style={{ color: "#6E6E73", margin: "8px 0 0 0" }}>
                                    Checking the validity and expiration of your password reset token.
                                </p>
                            </motion.div>
                        ) : tokenError ? (
                            <motion.div
                                key="invalid-token-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="apple-auth-card"
                            >
                                <div className="apple-card-header">
                                    <span className="apple-eyebrow" style={{ color: "#DC2626" }}>SECURITY NOTICE</span>
                                    <h2 className="apple-card-title">Link Expired or Invalid</h2>
                                </div>

                                <div className="apple-alert-box apple-alert-error" style={{ marginBottom: "20px" }}>
                                    <AlertTriangle size={18} strokeWidth={2} className="apple-alert-icon" style={{ flexShrink: 0 }} />
                                    <span>{tokenError}</span>
                                </div>

                                <p className="apple-body" style={{ color: "#6E6E73", marginBottom: "24px", lineHeight: 1.55 }}>
                                    For your security, password reset links expire after 15 minutes and can only be used once. Please return to the login page and request a new password reset link.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => onNavigateToLogin && onNavigateToLogin()}
                                    className="apple-btn-primary full-width"
                                >
                                    Back to Sign In &rarr;
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reset-form-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="apple-auth-card"
                            >
                                <div className="apple-card-header">
                                    <span className="apple-eyebrow">PASSWORD RESET</span>
                                    <h2 className="apple-card-title">Choose a new password</h2>
                                    {targetEmail && (
                                        <p className="apple-body" style={{ margin: "4px 0 0 0", color: "#6E6E73", fontSize: "14px" }}>
                                            Resetting credentials for <strong style={{ color: "#1D1D1F" }}>{targetEmail}</strong>
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="apple-alert-box apple-alert-error" role="alert">
                                        <Info size={16} strokeWidth={2} className="apple-alert-icon" style={{ flexShrink: 0 }} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {isSuccess && (
                                    <div className="apple-alert-box apple-alert-success" role="status">
                                        <CheckCircle2 size={16} strokeWidth={2} className="apple-alert-icon" style={{ color: "#16A34A", flexShrink: 0 }} />
                                        <span>Password updated successfully! Redirecting to sign in...</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="apple-form-body" noValidate>
                                    {/* Field 1: New Password */}
                                    <div className="apple-form-field">
                                        <label htmlFor="reset-new-password" className="apple-label">
                                            New Password
                                        </label>
                                        <div className="apple-input-container">
                                            <input
                                                id="reset-new-password"
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setNewPassword(e.target.value)
                                                    if (error) setError("")
                                                }}
                                                placeholder="At least 8 characters"
                                                autoComplete="new-password"
                                                required
                                                disabled={loading || isSuccess}
                                                className="apple-input has-toggle"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="apple-password-toggle"
                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff size={18} strokeWidth={1.75} />
                                                ) : (
                                                    <Eye size={18} strokeWidth={1.75} />
                                                )}
                                            </button>
                                        </div>

                                        {/* Strength Bar */}
                                        {newPassword.length > 0 && (
                                            <div className="apple-strength-section">
                                                <div className="apple-strength-header">
                                                    <span className="apple-caption">Security:</span>
                                                    <span className="apple-eyebrow" style={{ color: strengthColor }}>
                                                        {strengthLabel}
                                                    </span>
                                                </div>
                                                <div className="apple-strength-track">
                                                    <div
                                                        className="apple-strength-fill"
                                                        style={{
                                                            width: `${barWidthPercent}%`,
                                                            backgroundColor: strengthColor,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Security Rules Checklist */}
                                        {newPassword.length > 0 && (
                                            <div className="apple-rules-checklist">
                                                {rulesMet.map((rule) => (
                                                    <div
                                                        key={rule.id}
                                                        className={`apple-rule-row ${rule.met ? "is-met" : "is-unmet"}`}
                                                    >
                                                        <span className="apple-rule-icon">
                                                            {rule.met ? "✓" : "○"}
                                                        </span>
                                                        <span className="apple-caption">{rule.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Field 2: Confirm Password */}
                                    <div className="apple-form-field">
                                        <div className="apple-label-row">
                                            <label htmlFor="reset-confirm-password" className="apple-label">
                                                Confirm Password
                                            </label>
                                            {confirmPassword.length > 0 && (
                                                <span
                                                    className="apple-caption"
                                                    style={{
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        color: passwordsMatch ? "#15803D" : "#DC2626",
                                                    }}
                                                >
                                                    {passwordsMatch ? "✓ Passwords match" : "Does not match"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="apple-input-container">
                                            <input
                                                id="reset-confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value)
                                                    if (error) setError("")
                                                }}
                                                placeholder="Re-enter your new password"
                                                autoComplete="new-password"
                                                required
                                                disabled={loading || isSuccess}
                                                className="apple-input has-toggle"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="apple-password-toggle"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={18} strokeWidth={1.75} />
                                                ) : (
                                                    <Eye size={18} strokeWidth={1.75} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Action */}
                                    <button
                                        type="submit"
                                        disabled={loading || isSuccess || !isNewPasswordValid || !passwordsMatch}
                                        className="apple-btn-primary full-width"
                                        style={{ marginTop: "6px" }}
                                    >
                                        {loading ? (
                                            <>
                                                <CrimsonSpinner size={16} color="#FFFFFF" />
                                                <span>Updating password...</span>
                                            </>
                                        ) : isSuccess ? (
                                            <span>Password Updated ✓</span>
                                        ) : (
                                            "Update password"
                                        )}
                                    </button>
                                </form>

                                <div className="apple-card-footer">
                                    <button
                                        type="button"
                                        onClick={() => onNavigateToLogin && onNavigateToLogin(targetEmail)}
                                        className="apple-link apple-caption"
                                    >
                                        &larr; Back to sign in
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>
            </main>

            <style>{`
                .apple-auth-stage {
                    min-height: 100vh;
                    height: 100vh;
                    max-height: 100vh;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--color-bg-base);
                    color: var(--color-text-primary);
                    font-family: var(--font-body);
                    overflow: hidden;
                }

                .apple-global-header {
                    flex-shrink: 0;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background-color: rgba(251, 251, 253, 0.82);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 0.5px solid var(--color-border-subtle);
                    padding: 12px 48px;
                }

                .apple-header-inner {
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .apple-logo-lockup {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .apple-logo-img {
                    height: 32px;
                    width: auto;
                    object-fit: contain;
                    border-radius: 6px;
                }

                .apple-brand-name {
                    font-family: var(--font-display);
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: var(--color-text-primary);
                }

                .apple-auth-layout {
                    flex: 1;
                    display: flex;
                    width: 100%;
                    min-height: 0;
                    overflow: hidden;
                }

                .apple-brand-panel {
                    flex: 0 0 50%;
                    max-width: 50%;
                    padding: 20px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border-right: 0.5px solid var(--color-border-subtle);
                    overflow: hidden;
                }

                .apple-brand-content {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    max-width: 560px;
                    width: 100%;
                }

                .apple-brand-hero {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .apple-display-headline {
                    font-family: var(--font-display) !important;
                    font-size: clamp(26px, 2.7vw, 38px) !important;
                    line-height: 1.15 !important;
                    letter-spacing: -0.025em !important;
                    margin: 0 !important;
                    white-space: nowrap !important;
                }

                .apple-display-headline span {
                    font-size: inherit !important;
                    line-height: inherit !important;
                    letter-spacing: inherit !important;
                    display: inline !important;
                }

                .headline-accent {
                    color: #DC2626 !important;
                    font-weight: 700 !important;
                }

                .headline-rest {
                    color: var(--color-text-primary) !important;
                    font-weight: 700 !important;
                }

                .apple-body-lead {
                    font-family: var(--font-body);
                    font-size: 15.5px;
                    font-weight: 400;
                    line-height: 1.5;
                    color: var(--color-text-secondary);
                    margin: 2px 0 0 0;
                }

                .apple-features-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                }

                .apple-terminal-card {
                    background-color: #161617;
                    border: 0.5px solid var(--color-border-subtle);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
                    margin-top: 6px;
                }

                .apple-terminal-titlebar {
                    background-color: #1F1F21;
                    padding: 8px 14px;
                    display: flex;
                    align-items: center;
                    border-bottom: 0.5px solid #2C2C2E;
                }

                .apple-terminal-dots {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .term-dot {
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                }

                .dot-red { background-color: #FF5F56; }
                .dot-yellow { background-color: #FFBD2E; }
                .dot-green { background-color: #27C93F; }

                .apple-terminal-label {
                    margin-left: auto;
                    font-family: var(--font-mono);
                    font-size: 11px;
                    color: #8E8E93;
                }

                .apple-terminal-code {
                    margin: 0;
                    padding: 12px 16px;
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    line-height: 1.55;
                    color: #F5F5F7;
                    background: transparent;
                    white-space: pre;
                    overflow-x: auto;
                }

                .t-prompt {
                    color: var(--color-accent);
                    margin-right: 6px;
                    font-weight: 600;
                }

                .t-success { color: #34C759; }
                .t-cursor {
                    display: inline-block;
                    width: 7px;
                    height: 13px;
                    background-color: var(--color-accent);
                    vertical-align: middle;
                    animation: apple-blink 1s infinite;
                }

                @keyframes apple-blink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                }

                .apple-auth-panel {
                    flex: 0 0 50%;
                    max-width: 50%;
                    padding: 24px 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .apple-card-wrapper {
                    width: 100%;
                    max-width: 480px;
                }

                .apple-auth-card {
                    background-color: var(--color-bg-surface);
                    border: 0.5px solid var(--color-border-subtle);
                    border-radius: 20px;
                    padding: 34px 38px;
                    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
                }

                .apple-card-header {
                    margin-bottom: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .apple-card-title {
                    font-family: var(--font-display);
                    font-size: 26px;
                    font-weight: 700;
                    letter-spacing: -0.018em;
                    line-height: 1.2;
                    color: var(--color-text-primary);
                    margin: 0;
                }

                .apple-link {
                    color: var(--color-accent);
                    text-decoration: none;
                    font-family: var(--font-body);
                    background: transparent;
                    border: none;
                    padding: 0;
                    margin: 0;
                    cursor: pointer;
                    display: inline;
                    transition: opacity 0.2s var(--ease-apple);
                }

                .apple-link:hover {
                    opacity: 0.8;
                }

                .apple-form-body {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .apple-form-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .apple-label {
                    font-family: var(--font-body);
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                    text-transform: none;
                }

                .apple-label-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .apple-input-container {
                    position: relative;
                    width: 100%;
                }

                .apple-input {
                    width: 100%;
                    height: 48px;
                    background-color: #FFFFFF;
                    border: 1px solid var(--color-border-subtle);
                    border-radius: 12px;
                    padding: 0 16px;
                    font-family: var(--font-body);
                    font-size: 15.5px;
                    font-weight: 400;
                    color: var(--color-text-primary);
                    outline: none;
                    transition: border-color 0.2s var(--ease-apple), box-shadow 0.2s var(--ease-apple);
                }

                .apple-input::placeholder {
                    color: var(--color-text-secondary);
                    opacity: 0.7;
                    font-size: 14px;
                }

                .apple-input:focus {
                    border-color: var(--color-accent);
                    box-shadow: 0 0 0 3px var(--color-accent-glow);
                }

                .apple-input.has-toggle {
                    padding-right: 44px;
                }

                .apple-password-toggle {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }

                .apple-password-toggle:hover {
                    color: var(--color-text-primary);
                }

                .apple-strength-section {
                    margin-top: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .apple-strength-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .apple-strength-track {
                    width: 100%;
                    height: 4px;
                    background-color: #E5E5EA;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .apple-strength-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 300ms var(--ease-apple), background-color 300ms var(--ease-apple);
                }

                .apple-rules-checklist {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3px 10px;
                    margin-top: 4px;
                    padding: 6px 10px;
                    background-color: var(--color-bg-elevated);
                    border: 0.5px solid var(--color-border-subtle);
                    border-radius: 10px;
                }

                .apple-rule-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .apple-rule-row.is-met {
                    color: var(--color-text-primary);
                }

                .apple-rule-row.is-unmet {
                    color: #8E8E93;
                }

                .apple-rule-icon {
                    font-size: 11px;
                    font-weight: 700;
                }

                .apple-rule-row.is-met .apple-rule-icon {
                    color: var(--color-accent);
                }

                .full-width {
                    width: 100%;
                    height: 48px;
                    font-size: 16px;
                    font-weight: 600;
                }

                .apple-card-footer {
                    margin-top: 18px;
                    text-align: center;
                    font-size: 14.5px;
                }

                .apple-alert-box {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 13px;
                    border-radius: 11px;
                    font-size: 13px;
                    margin-bottom: 12px;
                    line-height: 1.35;
                }

                .apple-alert-error {
                    background-color: #FEF2F2;
                    border: 0.5px solid #FECACA;
                    color: var(--color-accent);
                }

                .apple-alert-success {
                    background-color: #F0FDF4;
                    border: 0.5px solid #BBF7D0;
                    color: #15803D;
                }

                .apple-alert-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }

                .apple-spinner {
                    display: inline-block;
                    border: 2px solid rgba(220, 38, 38, 0.2);
                    border-radius: 50%;
                    animation: apple-spin 0.65s linear infinite;
                }

                @keyframes apple-spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 960px) {
                    .apple-display-headline {
                        white-space: normal !important;
                    }
                    .apple-auth-stage {
                        height: auto;
                        min-height: 100vh;
                        overflow-y: auto;
                    }
                    .apple-auth-layout {
                        flex-direction: column;
                    }
                    .apple-brand-panel {
                        flex: none;
                        max-width: 100%;
                        width: 100%;
                        padding: 32px 20px;
                        border-right: none;
                        border-bottom: 0.5px solid var(--color-border-subtle);
                    }
                    .apple-auth-panel {
                        flex: none;
                        max-width: 100%;
                        width: 100%;
                        padding: 32px 16px;
                    }
                    .apple-terminal-card {
                        display: none;
                    }
                }
            `}</style>
        </div>
    )
}


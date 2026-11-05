import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Eye, EyeOff, Info, SquareChevronRight } from "lucide-react"
import tuxLogo from "../../assets/logo.png"

const API_BASE_URL = "http://localhost:5000/api/auth"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

const PASSWORD_RULES = [
    { id: "length", label: "8+ characters", test: (pwd) => pwd.length >= 8 },
    { id: "uppercase", label: "Uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
    { id: "lowercase", label: "Lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
    { id: "number", label: "Number", test: (pwd) => /\d/.test(pwd) },
    { id: "symbol", label: "Symbol (!@#$%...)", test: (pwd) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd) },
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

function SixBoxOTP({ value = "", onChange, onComplete, disabled }) {
    const inputsRef = useRef([])
    const chars = value.split("").slice(0, 6)
    while (chars.length < 6) chars.push("")

    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, "")
        if (!val) {
            const next = [...chars]
            next[idx] = ""
            onChange(next.join(""))
            return
        }

        const char = val[val.length - 1]
        const next = [...chars]
        next[idx] = char
        const newCode = next.join("")
        onChange(newCode)

        if (idx < 5) {
            inputsRef.current[idx + 1]?.focus()
        }

        if (newCode.length === 6 && onComplete) {
            onComplete(newCode)
        }
    }

    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace") {
            if (!chars[idx] && idx > 0) {
                e.preventDefault()
                const next = [...chars]
                next[idx - 1] = ""
                onChange(next.join(""))
                inputsRef.current[idx - 1]?.focus()
            }
        } else if (e.key === "ArrowLeft" && idx > 0) {
            e.preventDefault()
            inputsRef.current[idx - 1]?.focus()
        } else if (e.key === "ArrowRight" && idx < 5) {
            e.preventDefault()
            inputsRef.current[idx + 1]?.focus()
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (value.length === 6 && onComplete) {
                onComplete(value)
            }
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (!pasted) return
        onChange(pasted)
        const targetIdx = Math.min(pasted.length, 5)
        inputsRef.current[targetIdx]?.focus()
        if (pasted.length === 6 && onComplete) {
            onComplete(pasted)
        }
    }

    return (
        <div className="otp-six-grid" onPaste={handlePaste}>
            {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={chars[idx]}
                    disabled={disabled}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="otp-single-box"
                    aria-label={`Digit ${idx + 1}`}
                />
            ))}
        </div>
    )
}

export default function AuthPage({ onAuthSuccess, initialEmail = "", initialNotice = "" }) {
    // Mode: 'login' | 'signup' | 'otp'
    const [mode, setMode] = useState("login")

    // Form fields
    const [email, setEmail] = useState(initialEmail)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordField, setShowPasswordField] = useState(!!initialEmail)

    // Flow states
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [loginNotice, setLoginNotice] = useState(initialNotice)
    const [resetNotice, setResetNotice] = useState("")
    const [isSendingReset, setIsSendingReset] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const loginPasswordInputRef = useRef(null)
    const signupPasswordInputRef = useRef(null)
    const emailInputRef = useRef(null)

    // Duplicate email check states
    const [isCheckingEmail, setIsCheckingEmail] = useState(false)
    const [emailExistsState, setEmailExistsState] = useState(null) // null | 'EXISTS' | 'UNVERIFIED'

    // OTP states
    const [otpCode, setOtpCode] = useState("")
    const [resendCountdown, setResendCountdown] = useState(0)

    // Password validation
    const rulesMet = PASSWORD_RULES.map((rule) => ({
        ...rule,
        met: rule.test(password),
    }))
    const rulesMetCount = rulesMet.filter((r) => r.met).length
    const hasSpaces = /\s/.test(password)
    const isPasswordValid = PASSWORD_REGEX.test(password) && !hasSpaces

    let strengthLabel = ""
    let strengthColor = "transparent"
    let barWidthPercent = 0

    if (password.length > 0) {
        if (rulesMetCount <= 2) {
            strengthLabel = "Weak"
            strengthColor = "#DC2626"
            barWidthPercent = rulesMetCount === 1 ? 25 : 40
        } else if (rulesMetCount <= 4) {
            strengthLabel = "Fair"
            strengthColor = "#D97706"
            barWidthPercent = rulesMetCount === 3 ? 65 : 80
        } else {
            strengthLabel = "Strong"
            strengthColor = "#15803D"
            barWidthPercent = 100
        }
    }

    // Resend countdown timer
    useEffect(() => {
        if (resendCountdown <= 0) return
        const timer = setInterval(() => {
            setResendCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCountdown])

    const formatCooldown = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    // Duplicate email check for signup (on blur or before submit)
    const checkEmailAvailability = async (emailToCheck) => {
        const clean = emailToCheck.trim().toLowerCase()
        if (!clean || !EMAIL_REGEX.test(clean)) return null

        setIsCheckingEmail(true)
        setEmailExistsState(null)
        try {
            const res = await fetch(`${API_BASE_URL}/check-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: clean }),
            })
            const data = await res.json()
            if (data.exists) {
                if (data.isUnverified || data.status === "UNVERIFIED") {
                    setEmailExistsState("UNVERIFIED")
                } else {
                    setEmailExistsState(null)
                    setMode("login")
                    setLoginNotice("An account with this email already exists. Sign in →")
                    setPassword("")
                    setError("")
                    setShowPasswordField(true)
                    setTimeout(() => {
                        loginPasswordInputRef.current?.focus()
                    }, 250)
                }
                return false
            } else {
                setEmailExistsState(null)
                return true
            }
        } catch {
            return null
        } finally {
            setIsCheckingEmail(false)
        }
    }

    // Step 1: User enters email, clicks Continue (or presses Enter)
    const handleEmailContinue = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        setError("")

        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail) {
            setError("Please enter your email address.")
            return
        }
        if (!EMAIL_REGEX.test(cleanEmail)) {
            setError("Please enter a valid email address.")
            return
        }

        if (mode === "signup") {
            const isAvail = await checkEmailAvailability(cleanEmail)
            if (isAvail === true) {
                setShowPasswordField(true)
                setTimeout(() => {
                    signupPasswordInputRef.current?.focus()
                }, 250)
            }
        } else if (mode === "login") {
            setShowPasswordField(true)
            setTimeout(() => {
                loginPasswordInputRef.current?.focus()
            }, 250)
        }
    }

    // Switch view mode
    const handleSwitchMode = (newMode) => {
        setMode(newMode)
        setShowPasswordField(false)
        setPassword("")
        setError("")
        setLoginNotice("")
        setResetNotice("")
        setEmailExistsState(null)
        setIsCheckingEmail(false)
        setIsSendingReset(false)
        setIsSuccess(false)
        setOtpCode("")
    }

    // Forgot Password Dispatch Flow
    const handleForgotPassword = async () => {
        if (isSendingReset || loading) return
        setError("")
        setLoginNotice("")
        setResetNotice("")

        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail) {
            setError("Please enter your email address to reset your password.")
            emailInputRef.current?.focus()
            return
        }
        if (!EMAIL_REGEX.test(cleanEmail)) {
            setError("Please enter a valid email address.")
            emailInputRef.current?.focus()
            return
        }

        setIsSendingReset(true)
        try {
            const res = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Unable to send reset email. Please try again.")
            }

            setResetNotice("Reset link sent to your registered email — check your inbox. Expires in 15 minutes.")
        } catch (err) {
            setError(err.message || "Failed to send password reset email. Please try again.")
        } finally {
            setIsSendingReset(false)
        }
    }

    // Resume verification for unverified account
    const handleResumeVerification = async () => {
        if (loading || isCheckingEmail) return
        setError("")
        setLoading(true)
        try {
            const cleanEmail = email.trim().toLowerCase()
            const res = await fetch(`${API_BASE_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail }),
            })
            const data = await res.json()
            setMode("otp")
            setOtpCode("")
            setResendCountdown(data.cooldownSeconds || 30)
        } catch (err) {
            setError(err.message || "Failed to dispatch verification code.")
        } finally {
            setLoading(false)
        }
    }

    // Handle Login Submit
    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
            setError("Please enter a valid email address.")
            return
        }

        if (!password) {
            setError("Please enter your password.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail, password }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login failed. Check your email and password.")
            }

            if (data.token) {
                localStorage.setItem("tux_token", data.token)
            }

            setIsSuccess(true)
            setTimeout(() => {
                if (onAuthSuccess) {
                    onAuthSuccess(data.user)
                }
            }, 500)
        } catch (err) {
            setError(err.message || "Unable to sign in. Please verify your credentials.")
        } finally {
            setLoading(false)
        }
    }

    // Handle Sign Up Submit
    const handleSignUpSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
            setError("Please enter a valid email address.")
            return
        }

        if (!password || !isPasswordValid) {
            setError("Please choose a password meeting all security requirements.")
            return
        }

        setLoading(true)
        try {
            const isAvail = await checkEmailAvailability(cleanEmail)
            if (isAvail === false) {
                setLoading(false)
                return
            }

            const res = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail }),
            })
            const data = await res.json()

            if (res.status === 409 || data.code === "EMAIL_ALREADY_EXISTS") {
                setEmailExistsState(null)
                setMode("login")
                setLoginNotice("An account with this email already exists. Sign in →")
                setPassword("")
                setError("")
                setShowPasswordField(true)
                setTimeout(() => {
                    loginPasswordInputRef.current?.focus()
                }, 250)
                return
            }

            if (!res.ok) {
                if (res.status === 429 && data.retryAfter) {
                    setResendCountdown(data.retryAfter)
                }
                throw new Error(data.error || "Failed to initiate registration.")
            }

            setMode("otp")
            setOtpCode("")
            setResendCountdown(data.cooldownSeconds || 30)
        } catch (err) {
            setError(err.message || "Failed to dispatch verification code.")
        } finally {
            setLoading(false)
        }
    }

    // Handle OTP Verify
    const handleVerifyOtpSubmit = async (codeOverride) => {
        const codeToVerify = typeof codeOverride === "string" ? codeOverride : otpCode
        setError("")

        if (!codeToVerify || codeToVerify.length < 6) {
            setError("Please enter the complete 6-digit verification code.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    otp: codeToVerify.trim(),
                    password: password || undefined,
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Invalid verification code.")
            }

            setIsSuccess(true)
            if (data.token) {
                localStorage.setItem("tux_token", data.token)
            }

            setTimeout(() => {
                if (onAuthSuccess) {
                    onAuthSuccess(data.user)
                }
            }, 600)
        } catch (err) {
            setError(err.message || "Verification failed. Check the code and try again.")
        } finally {
            setLoading(false)
        }
    }

    // Handle Resend OTP Code
    const handleResendCode = async () => {
        if (resendCountdown > 0 || loading) return
        setError("")
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            })
            const data = await res.json()
            if (!res.ok) {
                if (res.status === 429 && data.retryAfter) {
                    setResendCountdown(data.retryAfter)
                }
                throw new Error(data.error || "Failed to resend code.")
            }
            setResendCountdown(data.cooldownSeconds || 30)
        } catch (err) {
            setError(err.message || "Failed to resend verification code.")
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
                {/* =========================================================
                    LEFT COLUMN (55%): Apple Brand Panel & Value Proposition
                   ========================================================= */}
                <section className="apple-brand-panel">
                    <div className="apple-brand-content">
                        <div className="apple-brand-hero">
                            <span className="apple-eyebrow">LEARN BY DOING · FREE TO START</span>
                            
                            {/* Apple's Mixed-Weight Headline Trick */}
                            <h1 className="apple-display-headline">
                                <span className="headline-accent">Learn Linux.</span>
                                <span className="headline-rest"> The right way.</span>
                            </h1>

                            <p className="apple-body-lead">
                                Hands-on labs, guided paths, and real terminal practice — from complete beginner to production-ready developer. Perfect for CS students, developers switching to Linux, and anyone who learns best by doing.
                            </p>
                        </div>

                        <ul className="apple-features-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <SquareChevronRight 
                                    size={20} 
                                    color="#DC2626" 
                                    strokeWidth={1.5}
                                    style={{ flexShrink: 0, marginTop: '2px' }} 
                                />
                                <div>
                                    <strong style={{ fontSize: '15px', color: '#1D1D1F', display: 'block' }}>
                                        Interactive terminal sandbox
                                    </strong>
                                    <span style={{ fontSize: '14px', color: '#6E6E73', lineHeight: '1.55' }}>
                                        A real Linux environment running directly in your browser. No installation, no setup — just open and start typing.
                                    </span>
                                </div>
                            </li>

                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <SquareChevronRight 
                                    size={20} 
                                    color="#DC2626" 
                                    strokeWidth={1.5}
                                    style={{ flexShrink: 0, marginTop: '2px' }} 
                                />
                                <div>
                                    <strong style={{ fontSize: '15px', color: '#1D1D1F', display: 'block' }}>
                                        Learning paths from beginner to advanced
                                    </strong>
                                    <span style={{ fontSize: '14px', color: '#6E6E73', lineHeight: '1.55' }}>
                                        Clear progressions covering core commands, shell scripting, networking, and package management.
                                    </span>
                                </div>
                            </li>

                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <SquareChevronRight 
                                    size={20} 
                                    color="#DC2626" 
                                    strokeWidth={1.5}
                                    style={{ flexShrink: 0, marginTop: '2px' }} 
                                />
                                <div>
                                    <strong style={{ fontSize: '15px', color: '#1D1D1F', display: 'block' }}>
                                        Project-based assessments
                                    </strong>
                                    <span style={{ fontSize: '14px', color: '#6E6E73', lineHeight: '1.55' }}>
                                        Solve real-world outages, configure servers, and build automated test suites to prove your skills.
                                    </span>
                                </div>
                            </li>
                        </ul>

                        {/* Apple-Style Terminal Preview Card (Monospace ONLY inside code block) */}
                        <div className="apple-terminal-card" aria-hidden="true">
                            <div className="apple-terminal-titlebar">
                                <div className="apple-terminal-dots">
                                    <span className="term-dot dot-red" />
                                    <span className="term-dot dot-yellow" />
                                    <span className="term-dot dot-green" />
                                </div>
                                <span className="apple-terminal-label">Your sandbox, live in seconds:</span>
                            </div>
                            <pre className="apple-terminal-code">
                                <span className="t-prompt">$</span> tux lab start linux-fundamentals{'\n'}
                                <span className="t-success">✓ Sandbox ready (kernel 6.8.0-tux-x86_64)</span>{'\n'}
                                <span className="t-prompt">$</span> uname -srmo{'\n'}
                                <span className="t-out">Linux 6.8.0-tux-x86_64 GNU/Linux</span>{'\n'}
                                <span className="t-prompt">$</span> <span className="t-cursor" />
                            </pre>
                        </div>


                    </div>
                </section>

                {/* =========================================================
                    RIGHT COLUMN (45%): Apple Store Auth Form Card
                   ========================================================= */}
                <section className="apple-auth-panel">
                    <div className="apple-card-wrapper">
                        <AnimatePresence mode="wait">
                            {mode === "login" && (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
                                    className="apple-auth-card"
                                >
                                    <div className="apple-card-header">
                                        <span className="apple-eyebrow">Welcome Back</span>
                                        <h2 className="apple-card-title">Sign in to TUX TUTOR</h2>
                                    </div>

                                    {loginNotice && (
                                        <div className="apple-alert-box apple-alert-info" role="status">
                                            <Info size={16} strokeWidth={2} className="apple-alert-icon" style={{ flexShrink: 0 }} />
                                            <span>{loginNotice}</span>
                                        </div>
                                    )}

                                    {resetNotice && (
                                        <div className="apple-alert-box apple-alert-success" role="status">
                                            <Info size={16} strokeWidth={2} className="apple-alert-icon" style={{ color: "#16A34A", flexShrink: 0 }} />
                                            <span>{resetNotice}</span>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="apple-alert-box apple-alert-error" role="alert">
                                            <svg className="apple-alert-icon" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={!showPasswordField ? handleEmailContinue : handleLoginSubmit} className="apple-form-body" noValidate>
                                        <div className="apple-form-field">
                                            <label htmlFor="login-email" className="apple-label">
                                                Email
                                            </label>
                                            <div className="apple-input-container">
                                                <input
                                                    ref={emailInputRef}
                                                    id="login-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value)
                                                        if (error) setError("")
                                                        if (loginNotice) setLoginNotice("")
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !showPasswordField) {
                                                            e.preventDefault()
                                                            handleEmailContinue(e)
                                                        }
                                                    }}
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
                                                    required
                                                    className={`apple-input ${loginNotice ? "is-existing-account" : ""}`}
                                                    disabled={loading || isSuccess}
                                                />
                                            </div>
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {showPasswordField && (
                                                <motion.div
                                                    key="login-password-slide"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] }}
                                                    className="apple-password-slide-wrap"
                                                >
                                                    <div className="apple-form-field" style={{ paddingTop: "2px" }}>
                                                        <div className="apple-label-row">
                                                            <label htmlFor="login-password" className="apple-label">
                                                                Password
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={handleForgotPassword}
                                                                disabled={isSendingReset || loading}
                                                                className="apple-link apple-caption"
                                                            >
                                                                {isSendingReset ? "Sending link..." : "Forgot password?"}
                                                            </button>
                                                        </div>
                                                        <div className="apple-input-container">
                                                            <input
                                                                ref={loginPasswordInputRef}
                                                                id="login-password"
                                                                type={showPassword ? "text" : "password"}
                                                                value={password}
                                                                onChange={(e) => {
                                                                    setPassword(e.target.value)
                                                                    if (error) setError("")
                                                                }}
                                                                placeholder="Enter your password"
                                                                autoComplete="current-password"
                                                                required
                                                                className="apple-input has-toggle"
                                                                disabled={loading || isSuccess}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="apple-password-toggle"
                                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff size={18} strokeWidth={1.75} />
                                                                ) : (
                                                                    <Eye size={18} strokeWidth={1.75} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            type="submit"
                                            disabled={loading || isSuccess}
                                            className="apple-btn-primary full-width"
                                        >
                                            {!showPasswordField ? (
                                                "Continue →"
                                            ) : loading ? (
                                                <>
                                                    <CrimsonSpinner size={16} color="#FFFFFF" />
                                                    <span>Signing in...</span>
                                                </>
                                            ) : isSuccess ? (
                                                <span>Redirecting...</span>
                                            ) : (
                                                "Sign In"
                                            )}
                                        </button>
                                    </form>

                                    <div className="apple-card-footer">
                                        <span className="apple-caption">Don’t have an account?</span>{" "}
                                        <button
                                            type="button"
                                            onClick={() => handleSwitchMode("signup")}
                                            className="apple-link apple-caption"
                                        >
                                            Sign up for free →
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {mode === "signup" && (
                                <motion.div
                                    key="signup-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
                                    className="apple-auth-card"
                                >
                                    <div className="apple-card-header">
                                        <span className="apple-eyebrow">JOIN FREE</span>
                                        <h2 className="apple-card-title">Create your account</h2>
                                        <p className="apple-body" style={{ margin: "4px 0 0 0" }}>
                                            Get instant access to your Linux sandbox.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="apple-alert-box apple-alert-error" role="alert">
                                            <svg className="apple-alert-icon" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    )}



                                    {emailExistsState === "UNVERIFIED" && (
                                        <div className="apple-alert-box apple-alert-warning">
                                            <div className="apple-dup-text">
                                                <strong style={{ fontWeight: 600 }}>Verification pending</strong>
                                                <span className="apple-caption">This email has not finished verification yet.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleResumeVerification}
                                                className="apple-btn-primary apple-caption"
                                                style={{ padding: "6px 14px", height: "auto" }}
                                            >
                                                Verify Now →
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={!showPasswordField ? handleEmailContinue : handleSignUpSubmit} className="apple-form-body" noValidate>
                                        <div className="apple-form-field">
                                            <label htmlFor="signup-email" className="apple-label">
                                                Email
                                            </label>
                                            <div className="apple-input-container">
                                                <input
                                                    ref={emailInputRef}
                                                    id="signup-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value)
                                                        if (emailExistsState) setEmailExistsState(null)
                                                        if (error) setError("")
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !showPasswordField) {
                                                            e.preventDefault()
                                                            handleEmailContinue(e)
                                                        }
                                                    }}
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
                                                    required
                                                    className={`apple-input ${isCheckingEmail ? "has-addon" : ""}`}
                                                    disabled={loading || isCheckingEmail}
                                                />
                                                {isCheckingEmail && (
                                                    <div className="apple-input-addon">
                                                        <CrimsonSpinner size={14} color="#6E6E73" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {showPasswordField && (
                                                <motion.div
                                                    key="signup-password-slide"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] }}
                                                    className="apple-password-slide-wrap"
                                                >
                                                    <div className="apple-form-field" style={{ paddingTop: "2px" }}>
                                                        <label htmlFor="signup-password" className="apple-label">
                                                            Password
                                                        </label>
                                                        <div className="apple-input-container">
                                                            <input
                                                                ref={signupPasswordInputRef}
                                                                id="signup-password"
                                                                type={showPassword ? "text" : "password"}
                                                                value={password}
                                                                onChange={(e) => {
                                                                    setPassword(e.target.value)
                                                                    if (error) setError("")
                                                                }}
                                                                placeholder="At least 8 characters"
                                                                autoComplete="new-password"
                                                                required
                                                                className="apple-input has-toggle"
                                                                disabled={loading}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="apple-password-toggle"
                                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff size={18} strokeWidth={1.75} />
                                                                ) : (
                                                                    <Eye size={18} strokeWidth={1.75} />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* Apple-Style Strength Indicator Bar */}
                                                        {password.length > 0 && (
                                                            <div className="apple-strength-section">
                                                                <div className="apple-strength-header">
                                                                    <span className="apple-caption">Security:</span>
                                                                    <span
                                                                        className="apple-eyebrow"
                                                                        style={{ color: strengthColor }}
                                                                    >
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

                                                        {/* Apple-Style Rule Checklist */}
                                                        {password.length > 0 && (
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            type="submit"
                                            disabled={loading || emailExistsState === "EXISTS" || isCheckingEmail}
                                            className="apple-btn-primary full-width"
                                        >
                                            {!showPasswordField ? (
                                                isCheckingEmail ? (
                                                    <>
                                                        <CrimsonSpinner size={16} color="#FFFFFF" />
                                                        <span>Checking email...</span>
                                                    </>
                                                ) : (
                                                    "Continue →"
                                                )
                                            ) : loading ? (
                                                <>
                                                    <CrimsonSpinner size={16} color="#FFFFFF" />
                                                    <span>Creating account...</span>
                                                </>
                                            ) : (
                                                "Create free account"
                                            )}
                                        </button>
                                    </form>

                                    <div className="apple-card-footer">
                                        <span className="apple-caption">Already have an account?</span>{" "}
                                        <button
                                            type="button"
                                            onClick={() => handleSwitchMode("login")}
                                            className="apple-link apple-caption"
                                        >
                                            Sign in →
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {mode === "otp" && (
                                <motion.div
                                    key="otp-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
                                    className="apple-auth-card"
                                >
                                    <div className="apple-card-header">
                                        <span className="apple-eyebrow">Verification Code</span>
                                        <h2 className="apple-card-title">Verify your email</h2>
                                        <p className="apple-body" style={{ margin: "4px 0 0 0" }}>
                                            We sent a 6-digit verification code to{" "}
                                            <strong style={{ color: "#1D1D1F", fontWeight: 600 }}>{email}</strong>.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="apple-alert-box apple-alert-error" role="alert">
                                            <svg className="apple-alert-icon" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="apple-form-body">
                                        <div className="apple-form-field">
                                            <label className="apple-label">
                                                Enter 6-digit code
                                            </label>
                                            <SixBoxOTP
                                                value={otpCode}
                                                onChange={(val) => {
                                                    setOtpCode(val)
                                                    if (error) setError("")
                                                }}
                                                onComplete={(code) => handleVerifyOtpSubmit(code)}
                                                disabled={loading || isSuccess}
                                            />
                                        </div>

                                        <div className="apple-otp-actions">
                                            {resendCountdown > 0 ? (
                                                <span className="apple-caption">
                                                    Resend code in {formatCooldown(resendCountdown)}
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleResendCode}
                                                    disabled={loading || isSuccess}
                                                    className="apple-link apple-caption"
                                                >
                                                    Resend verification code →
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleVerifyOtpSubmit(otpCode)}
                                            disabled={loading || isSuccess || otpCode.length < 6}
                                            className="apple-btn-primary full-width"
                                        >
                                            {loading ? (
                                                <>
                                                    <CrimsonSpinner size={16} color="#FFFFFF" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : isSuccess ? (
                                                <span>Email verified ✓</span>
                                            ) : (
                                                "Verify email"
                                            )}
                                        </button>
                                    </div>

                                    <div className="apple-card-footer">
                                        <button
                                            type="button"
                                            onClick={() => handleSwitchMode("login")}
                                            className="apple-link apple-caption"
                                        >
                                            ← Back to sign in
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </main>

            {/* Apple Store-Style Scoped Styles */}
            <style>{`
                .apple-auth-stage {
                    min-height: 100vh;
                    height: 100vh;
                    max-height: 100vh;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--color-bg-base); /* #FBFBFD */
                    color: var(--color-text-primary);        /* #1D1D1F */
                    font-family: var(--font-body);
                    overflow: hidden; /* No scrolling on desktop */
                }

                /* Apple Frosted Global Header */
                .apple-global-header {
                    flex-shrink: 0;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background-color: rgba(251, 251, 253, 0.82);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 0.5px solid var(--color-border-subtle); /* #D2D2D7 */
                    padding: 12px 48px;
                }

                .apple-header-inner {
                    width: 100%;
                    max-width: 100%;
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
                    color: var(--color-text-primary); /* #1D1D1F */
                }

                /* Main Split Layout — 50/50 Equal Halves */
                .apple-auth-layout {
                    flex: 1;
                    display: flex;
                    width: 100%;
                    max-width: 100%;
                    min-height: 0;
                    overflow: hidden;
                }

                /* =========================================================
                   LEFT COLUMN (50% Half Division): Brand Panel
                   ========================================================= */
                .apple-brand-panel {
                    flex: 0 0 50%;
                    max-width: 50%;
                    padding: 24px 60px;
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
                    gap: 16px;
                    max-width: 520px;
                    width: 100%;
                }

                .apple-brand-hero {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                /* Display Heading with Apple Mixed-Weight Trick */
                .apple-display-headline {
                    font-family: var(--font-display);
                    font-size: clamp(34px, 3.8vw, 48px);
                    line-height: 1.08;
                    letter-spacing: var(--tracking-display); /* -0.025em */
                    margin: 0;
                }

                .headline-accent {
                    color: var(--color-accent); /* #DC2626 */
                    font-weight: 700;
                }

                .headline-rest {
                    color: var(--color-text-primary); /* #1D1D1F */
                    font-weight: 300; /* Apple's 300 light weight */
                }

                .apple-body-lead {
                    font-family: var(--font-body);
                    font-size: 15.5px;
                    font-weight: 400;
                    line-height: 1.5;
                    letter-spacing: 0;
                    color: var(--color-text-secondary); /* #6E6E73 */
                    margin: 2px 0 0 0;
                }

                /* Features List */
                .apple-features-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                }

                /* Terminal Preview Card */
                .apple-terminal-card {
                    background-color: #161617; /* High-contrast dark window inside light page */
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
                    font-family: var(--font-mono); /* Strictly for terminal code blocks */
                    font-size: 12.5px;
                    line-height: 1.55;
                    color: #F5F5F7;
                    background: transparent;
                    white-space: pre;
                    overflow-x: auto;
                }

                .t-prompt {
                    color: var(--color-accent); /* #DC2626 */
                    margin-right: 6px;
                    font-weight: 600;
                }

                .t-success { color: #34C759; }
                .t-out { color: #E5E5EA; }

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



                /* =========================================================
                   RIGHT COLUMN (50% Half Division): Auth Panel
                   ========================================================= */
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
                    background-color: var(--color-bg-surface); /* #FFFFFF */
                    border: 0.5px solid var(--color-border-subtle); /* #D2D2D7 */
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
                    color: var(--color-text-primary); /* #1D1D1F */
                    margin: 0;
                }

                .apple-link {
                    color: var(--color-accent); /* #DC2626 */
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

                /* Form Layout */
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

                .apple-password-slide-wrap {
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .apple-label {
                    font-family: var(--font-body);
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text-primary); /* #1D1D1F */
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
                    border: 1px solid var(--color-border-subtle); /* #D2D2D7 */
                    border-radius: 12px;
                    padding: 0 16px;
                    font-family: var(--font-body);
                    font-size: 15.5px;
                    font-weight: 400;
                    color: var(--color-text-primary); /* #1D1D1F */
                    outline: none;
                    transition: border-color 0.2s var(--ease-apple), box-shadow 0.2s var(--ease-apple);
                }

                .apple-input::placeholder {
                    color: var(--color-text-secondary); /* #6E6E73 */
                    opacity: 0.7;
                    font-size: 14px;
                }

                .apple-input:focus {
                    border-color: var(--color-accent); /* #DC2626 */
                    box-shadow: 0 0 0 3px var(--color-accent-glow);
                }

                .apple-input.has-toggle {
                    padding-right: 44px;
                }

                .apple-input.has-addon {
                    padding-right: 42px;
                }

                .apple-password-toggle {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text-secondary); /* #6E6E73 */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }

                .apple-password-toggle:hover {
                    color: var(--color-text-primary);
                }

                .apple-input-addon {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                }

                /* Strength Bar */
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
                    background-color: var(--color-bg-elevated); /* #F5F5F7 */
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
                    color: var(--color-accent); /* #DC2626 */
                }

                /* Buttons */
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

                .apple-card-footer .apple-caption,
                .apple-card-footer .apple-link {
                    font-size: 14.5px;
                }

                /* Alerts */
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
                    color: var(--color-accent); /* #DC2626 */
                }

                .apple-alert-info {
                    background-color: #FEF2F2;
                    border: 0.5px solid #FECACA;
                    color: var(--color-accent); /* #DC2626 */
                    font-weight: 500;
                }

                .apple-alert-success {
                    background-color: #F0FDF4;
                    border: 0.5px solid #BBF7D0;
                    color: #15803D;
                    font-weight: 500;
                }

                .apple-input.is-existing-account {
                    border-color: #DC2626;
                    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.2);
                }

                .apple-alert-warning {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #FEF2F2;
                    border: 0.5px solid #FECACA;
                    color: var(--color-text-primary);
                }

                .apple-dup-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .apple-alert-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                    color: var(--color-accent);
                }

                /* OTP Grid */
                .otp-six-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 7px;
                    width: 100%;
                }

                .otp-single-box {
                    width: 100%;
                    height: 48px;
                    background-color: #FFFFFF;
                    border: 1px solid var(--color-border-subtle); /* #D2D2D7 */
                    border-radius: 12px;
                    color: var(--color-text-primary);
                    font-family: var(--font-body);
                    font-size: 19px;
                    font-weight: 600;
                    text-align: center;
                    outline: none;
                    transition: border-color 0.2s var(--ease-apple), box-shadow 0.2s var(--ease-apple);
                }

                .otp-single-box:focus {
                    border-color: var(--color-accent); /* #DC2626 */
                    box-shadow: 0 0 0 3px var(--color-accent-glow);
                }

                .apple-otp-actions {
                    display: flex;
                    justify-content: center;
                    margin: 4px 0 10px 0;
                }

                /* Spinner */
                .apple-spinner {
                    display: inline-block;
                    border: 2px solid rgba(220, 38, 38, 0.2);
                    border-radius: 50%;
                    animation: apple-spin 0.65s linear infinite;
                }

                @keyframes apple-spin {
                    to { transform: rotate(360deg); }
                }

                /* Responsive Breakpoints */
                @media (max-width: 960px) {
                    .apple-auth-stage {
                        height: auto;
                        min-height: 100vh;
                        overflow-y: auto;
                    }
                    .apple-auth-layout {
                        flex-direction: column;
                        overflow: visible;
                    }
                    .apple-brand-panel {
                        flex: none;
                        max-width: 100%;
                        width: 100%;
                        padding: 32px 20px;
                        border-right: none;
                        border-bottom: 0.5px solid var(--color-border-subtle);
                        overflow: visible;
                    }
                    .apple-auth-panel {
                        flex: none;
                        max-width: 100%;
                        width: 100%;
                        padding: 32px 16px;
                        overflow: visible;
                    }
                    .apple-terminal-card {
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                    .apple-auth-card {
                        padding: 20px 16px;
                    }
                    .apple-rules-checklist {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

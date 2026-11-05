import { useState, useEffect } from "react"
import AuthPage from "./components/auth/AuthPage"
import ResetPasswordPage from "./components/auth/ResetPasswordPage"
import HomePage from "./components/home/HomePage"
import tuxLogo from "./assets/logo.png"

function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("tux_user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // URL route parsing for password reset link
  const [resetToken, setResetToken] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      return params.get("token") || ""
    } catch {
      return ""
    }
  })
  const [isResetRoute, setIsResetRoute] = useState(() => {
    try {
      const isPath = window.location.pathname.includes("reset-password")
      const params = new URLSearchParams(window.location.search)
      return isPath || params.has("token")
    } catch {
      return false
    }
  })

  // Auth notices after redirects (e.g. password reset success)
  const [authNotice, setAuthNotice] = useState("")
  const [prefilledEmail, setPrefilledEmail] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("tux_user", JSON.stringify(currentUser))
      } else {
        localStorage.removeItem("tux_user")
      }
    } catch {
      // storage unavailable
    }
  }, [currentUser])

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData)
  }

  const handleSignOut = () => {
    setCurrentUser(null)
  }

  const handleNavigateToLoginFromReset = (email = "", notice = "") => {
    // Clear URL query without reload
    try {
      const cleanPath = window.location.pathname.replace("/reset-password", "") || "/"
      window.history.replaceState({}, document.title, cleanPath)
    } catch {
      // ignore
    }
    setPrefilledEmail(email)
    setAuthNotice(notice)
    setIsResetRoute(false)
    setResetToken("")
  }

  if (isInitializing) {
    return (
      <div
        className="tux-splash-screen"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--color-bg-base)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <img
          src={tuxLogo}
          alt="TUX TUTOR"
          className="tux-logo-pulse"
          style={{
            width: "100px",
            height: "100px",
            objectFit: "contain",
            filter: "drop-shadow(0 4px 16px rgba(220, 38, 38, 0.25))",
          }}
        />
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            className="apple-eyebrow"
          >
            Tux Tutor — Initializing Sandbox
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentUser ? (
        <HomePage user={currentUser} onSignOut={handleSignOut} />
      ) : isResetRoute ? (
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
      )}
    </>
  )
}

export default App

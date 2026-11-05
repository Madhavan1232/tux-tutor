import { useState } from "react"
import { WORLDS } from "../../theme/tokens"
import tuxLogo from "../../assets/logo.png"

export default function HomePage({ user, onSignOut }) {
  const [terminalInput, setTerminalInput] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [terminalHistory, setTerminalHistory] = useState([
    { type: "system", text: "TUX TUTOR [KERNEL v6.12.0-arch1]" },
    { type: "system", text: "AUTHENTICATED: " + (user?.email || "operative@kernel.org") + " (UID: 1000)" },
    { type: "system", text: "MODULE 001 ACTIVE // Run 'help' or inspect commands below." },
  ])

  const handleCommandSubmit = (e) => {
    e.preventDefault()
    const cmd = terminalInput.trim()
    if (!cmd) return

    const newHistory = [...terminalHistory, { type: "user", text: cmd }]

    if (cmd === "clear") {
      setTerminalHistory([])
      setTerminalInput("")
      return
    }

    let response = ""
    switch (cmd.toLowerCase()) {
      case "help":
        response = "Available: pwd, ls -la, whoami, uname -r, cat mission.txt, status, clear"
        break
      case "pwd":
        response = "/home/tux/academy"
        break
      case "ls":
      case "ls -la":
        response = "drwxr-xr-x 2 tux tux 4096 Nov 3 20:50 .\ndrwxr-xr-x 4 root root 4096 Nov 3 20:45 ..\n-rw-r--r-- 1 tux tux  128 Nov 3 20:51 mission.txt\n-rwxr-xr-x 1 tux tux  512 Nov 3 20:50 init_shell.sh"
        break
      case "whoami":
        response = (user?.email || "tux_operative") + " (uid=1000 gid=1000 groups=1000(tux),27(sudo))"
        break
      case "uname -r":
      case "uname -a":
        response = "Linux tux-tutor 6.12.0-arch1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux"
        break
      case "cat mission.txt":
        response = "MODULE 001: Traverse directory tree using 'cd /var/log' and inspect 'dmesg'."
        break
      case "status":
        response = "OPERATIVE LEVEL: 01 | XP: 0/100 | STREAK: 1 DAY | ARCH: x86_64"
        break
      default:
        response = `bash: ${cmd}: command not found. Type 'help' for guidance.`
    }

    newHistory.push({ type: "output", text: response })
    setTerminalHistory(newHistory)
    setTerminalInput("")
  }

  const handleQuickCommand = (cmd) => {
    setTerminalInput(cmd)
  }

  return (
    <div className="brutalist-stage">
      {/* Floating Vertical Section Indicators */}
      <aside className="sidebar-vertical-left">
        <span className="text-vertical">TUX TUTOR // HIGH-CONTRAST EDITORIAL</span>
      </aside>
      <aside className="sidebar-vertical-right">
        <span className="text-vertical">ARCHITECTURE: LINUX POSIX 001.</span>
      </aside>

      {/* Top Editorial Nav Header */}
      <header className="bento-header">
        <div className="brand-group" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={tuxLogo}
            alt="TUX TUTOR"
            style={{
              height: "36px",
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 0 8px rgba(232, 25, 44, 0.45))",
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="brand-title">TUX TUTOR</span>
              <span className="module-num">001.</span>
            </div>
            <span className="micro-label">MAGAZINE BRUTALIST EDITION</span>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="nav-pills">
          <button
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "btn-pill-primary" : "btn-pill-secondary"}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab("curriculum")}
            className={activeTab === "curriculum" ? "btn-pill-primary" : "btn-pill-secondary"}
          >
            MODULES
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={activeTab === "terminal" ? "btn-pill-primary" : "btn-pill-secondary"}
          >
            TERMINAL
          </button>
        </nav>

        {/* User Badge & Signout Pill */}
        <div className="user-controls">
          <div className="user-identity-badge">
            <span className="micro-label" style={{ color: "var(--color-accent)" }}>● ACTIVE</span>
            <span className="user-email-text">{user?.email || "operative@tux"}</span>
          </div>
          <button onClick={onSignOut} className="btn-pill-secondary" style={{ padding: "var(--space-2) var(--space-5)", fontSize: "var(--text-sm)" }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content: Asymmetric Bento Grid */}
      <main className="bento-container">
        {/* Row 1: Giant Editorial Headline + Module Highlight Banner */}
        <section className="bento-row bento-hero">
          {/* Card 1: Oversized Headline with Overlapping Anchor (Col 1-8) */}
          <div className="bento-card bento-card--large hero-card">
            {/* Giant Overlapping Typographic Anchor */}
            <div className="typographic-anchor hero-anchor">&gt;</div>

            <div className="card-top-meta">
              <span className="micro-label">SYSTEM MANIFESTO // 001.</span>
              <span className="module-num">ISSUE 26</span>
            </div>

            <h1 className="hero-editorial-title">
              COMMAND THE KERNEL.
            </h1>

            <p className="hero-editorial-lead">
              A high-contrast, minimalist Linux command simulation. Master POSIX fundamentals,
              pipeline architecture, and operating system mechanics through structured terminal challenges.
            </p>

            <div className="hero-pill-actions">
              <a href="#terminal" className="btn-pill-primary">
                Launch Active Shell →
              </a>
              <a href="#cheatsheet" className="btn-pill-secondary">
                View Command Index
              </a>
            </div>
          </div>

          {/* Card 2: Highlight Card in var(--color-accent-muted) (Active Module) (Col 9-12) */}
          <div className="bento-card bento-card--highlight module-card">
            <div className="typographic-anchor module-anchor">#</div>

            <div className="card-top-meta">
              <span className="micro-label" style={{ color: "var(--color-text-primary)" }}>ACTIVE MODULE</span>
              <span className="module-num" style={{ borderColor: "var(--color-text-primary)" }}>001.</span>
            </div>

            <h2 className="module-card-title">DIRECTORY TRAVERSAL</h2>
            <p className="module-card-desc">
              Navigation mechanics: Master <code>cd</code>, <code>pwd</code>, <code>ls -la</code>, and absolute vs relative path hierarchies.
            </p>

            <div className="module-metrics-stack">
              <div className="metric-row">
                <span className="micro-label" style={{ color: "var(--color-text-primary)", opacity: 0.8 }}>PROGRESS</span>
                <span className="metric-val">0 / 10 MISSIONS</span>
              </div>
              <div className="metric-track">
                <div className="metric-fill" style={{ width: "10%" }}></div>
              </div>
            </div>

            <div style={{ marginTop: "var(--space-6)" }}>
              <button
                onClick={() => handleQuickCommand("pwd && ls -la")}
                className="btn-pill-primary"
                style={{ backgroundColor: "var(--color-bg-surface)", borderColor: "var(--color-text-primary)", color: "var(--color-text-primary)", width: "100%" }}
              >
                Execute Task 1.1 [pwd]
              </button>
            </div>
          </div>
        </section>

        {/* Row 2: Status Bento Grid (4 metrics) */}
        <section className="bento-stats-row">
          <div className="bento-card stat-card">
            <span className="micro-label">LEVEL RANK</span>
            <div className="stat-number-wrap">
              <span className="stat-giant-num">01</span>
              <span className="stat-unit-label">INITIATE</span>
            </div>
            <span className="micro-label" style={{ color: "var(--color-text-muted)" }}>NEXT MILESTONE: 100 XP</span>
          </div>

          <div className="bento-card stat-card">
            <span className="micro-label">EXPERIENCE POINTS</span>
            <div className="stat-number-wrap">
              <span className="stat-giant-num">00</span>
              <span className="stat-unit-label">XP</span>
            </div>
            <span className="micro-label" style={{ color: "var(--color-accent)" }}>+50 XP ON TASK 1</span>
          </div>

          <div className="bento-card stat-card">
            <span className="micro-label">CONSECUTIVE STREAK</span>
            <div className="stat-number-wrap">
              <span className="stat-giant-num">01</span>
              <span className="stat-unit-label">DAY</span>
            </div>
            <span className="micro-label" style={{ color: "var(--color-text-muted)" }}>CADENCE // ACTIVE</span>
          </div>

          <div className="bento-card stat-card">
            <span className="micro-label">CURRICULUM MODULES</span>
            <div className="stat-number-wrap">
              <span className="stat-giant-num">08</span>
              <span className="stat-unit-label">WORLDS</span>
            </div>
            <span className="micro-label" style={{ color: "var(--color-accent)" }}>1 UNLOCKED // 7 LOCKED</span>
          </div>
        </section>

        {/* Row 3: Interactive Terminal (Col 1-8) + Command Cheatsheet (Col 9-12) */}
        <section id="terminal" className="bento-row bento-terminal-section">
          {/* Asymmetric Terminal Card in var(--color-bg-surface) */}
          <div className="bento-card bento-card--large terminal-card">
            <div className="terminal-topbar">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="terminal-dot"></span>
                <span className="terminal-label">ARCH LINUX SANDBOX // POSIX COMPLIANT</span>
              </div>
              <span className="module-num">SYS_SHELL</span>
            </div>

            <div className="terminal-display">
              {terminalHistory.map((item, idx) => (
                <div key={idx} className={`term-row term-row--${item.type}`}>
                  {item.type === "user" ? (
                    <span>
                      <span className="term-prompt">tux@archlinux:~$</span>
                      <span className="term-cmd">{item.text}</span>
                    </span>
                  ) : (
                    <span className="term-text">{item.text}</span>
                  )}
                </div>
              ))}

              <form onSubmit={handleCommandSubmit} className="term-input-form">
                <span className="term-prompt">tux@archlinux:~$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="type 'pwd', 'ls -la', 'whoami', or 'help'..."
                  autoFocus
                  className="term-cli-input"
                />
              </form>
            </div>
          </div>

          {/* Quick Cheatsheet Sidebar */}
          <div id="cheatsheet" className="bento-card cheatsheet-card">
            <div className="typographic-anchor cheatsheet-anchor">&amp;</div>

            <div className="card-top-meta">
              <span className="micro-label">COMMAND REFERENCE</span>
              <span className="module-num">001.</span>
            </div>

            <h3 className="cheatsheet-title">QUICK INJECTIONS</h3>
            <p className="micro-label" style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
              CLICK PILL TO POPULATE TERMINAL INPUT
            </p>

            <div className="cheatsheet-pills">
              <button onClick={() => handleQuickCommand("pwd")} className="pill-cmd">
                <code>pwd</code> — print working dir
              </button>
              <button onClick={() => handleQuickCommand("ls -la")} className="pill-cmd">
                <code>ls -la</code> — list details
              </button>
              <button onClick={() => handleQuickCommand("whoami")} className="pill-cmd">
                <code>whoami</code> — current user
              </button>
              <button onClick={() => handleQuickCommand("uname -r")} className="pill-cmd">
                <code>uname -r</code> — kernel release
              </button>
              <button onClick={() => handleQuickCommand("cat mission.txt")} className="pill-cmd">
                <code>cat mission.txt</code> — inspect task
              </button>
              <button onClick={() => handleQuickCommand("clear")} className="pill-cmd">
                <code>clear</code> — reset screen
              </button>
            </div>
          </div>
        </section>

        {/* Row 4: The 8 Modular Worlds (Bento Grid of Asymmetric Cards) */}
        <section id="curriculum" className="bento-curriculum-section">
          <div className="curriculum-header">
            <div>
              <span className="micro-label">CURRICULUM MANIFEST // 8 MODULES</span>
              <h2 className="curriculum-title">THE LINUX EXPEDITION</h2>
            </div>
            <span className="module-num">001 → 008.</span>
          </div>

          <div className="curriculum-bento-grid">
            {WORLDS.map((world) => (
              <div
                key={world.id}
                className={`bento-card world-bento-card ${world.active ? "world-bento-card--active" : "world-bento-card--muted"}`}
              >
                <div className="world-card-top">
                  <span className="module-num">{world.id}</span>
                  <span
                    className="micro-label"
                    style={{ color: world.active ? "var(--color-accent)" : "var(--color-text-muted)", fontWeight: 600 }}
                  >
                    {world.active ? "UNLOCKED" : "RESTRICTED"}
                  </span>
                </div>

                <h3 className="world-bento-title">{world.title}</h3>
                <p className="world-bento-desc">{world.description}</p>

                <div className="world-cmd-preview">
                  <span className="micro-label" style={{ color: "var(--color-text-secondary)" }}>CORE SYNTAX:</span>
                  <code className="world-code">{world.commandPreview}</code>
                </div>

                <div className="world-bento-footer">
                  <span className="micro-label">{world.totalMissions} TASKS</span>
                  {world.active ? (
                    <button
                      onClick={() => handleQuickCommand(world.commandPreview)}
                      className="btn-pill-primary"
                      style={{ padding: "var(--space-2) var(--space-4)", fontSize: "var(--text-xs)" }}
                    >
                      Enter Module →
                    </button>
                  ) : (
                    <span className="micro-label" style={{ color: "var(--color-text-muted)" }}>LOCKED // REQ {world.id}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Editorial Brutalist Footer */}
      <footer className="bento-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span className="brand-title" style={{ fontSize: "var(--text-xs)" }}>TUX TUTOR</span>
          <span className="module-num">000.</span>
          <span className="micro-label">MAGAZINE BRUTALIST ARCHITECTURE</span>
        </div>
        <div>
          <span className="micro-label">CRIMSON & PITCH BLACK EDITION // RESEND AUTH</span>
        </div>
      </footer>

      <style>{`
        .brutalist-stage {
          min-height: 100vh;
          background-color: var(--color-bg-base);
          color: var(--color-text-primary);
          font-family: var(--font-body);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .sidebar-vertical-left {
          position: fixed;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        .sidebar-vertical-right {
          position: fixed;
          right: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }

        .bento-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px var(--space-8);
          background-color: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 0.5px solid var(--color-border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .brand-title {
          font-family: var(--font-display);
          font-weight: var(--weight-bold);
          letter-spacing: var(--tracking-wide);
          font-size: var(--text-md);
          color: var(--color-text-primary);
        }

        .nav-pills {
          display: flex;
          gap: var(--space-2);
        }
        .nav-pills .btn-pill-primary,
        .nav-pills .btn-pill-secondary {
          padding: var(--space-2) var(--space-5);
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
        }

        .user-controls {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .user-identity-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .user-email-text {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-text-primary);
        }

        .bento-container {
          flex: 1;
          max-width: 1360px;
          margin: 0 auto;
          width: 100%;
          padding: var(--space-10);
        }

        .bento-row {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .hero-card {
          padding: var(--space-8);
          min-height: 22rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: var(--color-bg-surface);
          border-radius: var(--radius-card);
          border: 0.5px solid var(--color-border-subtle);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }
        .hero-anchor {
          right: var(--space-6);
          top: 0;
          font-size: 14rem;
          color: var(--color-accent);
          opacity: 0.04;
        }
        .hero-editorial-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, var(--text-4xl));
          font-weight: var(--weight-bold);
          letter-spacing: var(--tracking-display);
          line-height: var(--leading-display);
          margin: var(--space-6) 0 var(--space-3) 0;
          color: var(--color-text-primary);
        }
        .hero-editorial-lead {
          font-family: var(--font-body);
          font-size: var(--text-body);
          line-height: var(--leading-body);
          font-weight: var(--weight-regular);
          color: var(--color-text-secondary);
          max-width: 36rem;
          margin-bottom: var(--space-8);
        }
        .hero-pill-actions {
          display: flex;
          gap: var(--space-4);
          z-index: 2;
        }

        .module-card {
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: var(--color-bg-surface);
          border: 0.5px solid var(--color-border-subtle);
          border-radius: var(--radius-card);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }
        .module-anchor {
          right: var(--space-4);
          top: -1rem;
          font-size: 10rem;
          color: var(--color-accent);
          opacity: 0.04;
        }
        .module-card-title {
          font-family: var(--font-display);
          font-size: var(--text-h3);
          font-weight: var(--weight-semibold);
          letter-spacing: var(--tracking-h3);
          line-height: var(--leading-h3);
          color: var(--color-text-primary);
          margin: var(--space-5) 0 var(--space-2) 0;
        }
        .module-card-desc {
          font-family: var(--font-body);
          font-size: var(--text-caption);
          line-height: var(--leading-body);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-6);
        }
        .module-card-desc code {
          background: var(--color-bg-elevated);
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-text-primary);
        }
        .module-metrics-stack {
          margin-top: auto;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          margin-bottom: var(--space-2);
        }
        .metric-val {
          color: var(--color-accent);
          font-weight: var(--weight-semibold);
        }
        .metric-track {
          width: 100%;
          height: 4px;
          border-radius: var(--radius-pill);
          overflow: hidden;
          background-color: var(--color-bg-elevated);
        }
        .metric-fill {
          height: 100%;
          border-radius: var(--radius-pill);
          background-color: var(--color-accent);
        }

        .card-top-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--space-3);
          border-bottom: 0.5px solid var(--color-border-subtle);
          z-index: 2;
        }

        /* 4 Bento Stat Cards */
        .bento-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-5);
          margin-bottom: var(--space-8);
        }
        .stat-card {
          padding: var(--space-6) var(--space-8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 8.5rem;
          background-color: var(--color-bg-surface);
          border-radius: var(--radius-card);
          border: 0.5px solid var(--color-border-subtle);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }
        .stat-number-wrap {
          display: flex;
          align-items: baseline;
          gap: var(--space-2);
          margin: var(--space-2) 0;
        }
        .stat-giant-num {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: var(--weight-light);
          letter-spacing: var(--tracking-tight);
          color: var(--color-text-primary);
          line-height: var(--leading-tight);
        }
        .stat-unit-label {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-accent);
          font-weight: var(--weight-semibold);
          letter-spacing: var(--tracking-wide);
        }

        /* Terminal & Cheatsheet */
        .bento-terminal-section {
          grid-template-columns: 1.35fr 0.65fr;
        }
        .terminal-card {
          background-color: #161617;
          padding: 0;
          border-radius: var(--radius-card);
          overflow: hidden;
          border: 0.5px solid var(--color-border-subtle);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }
        .terminal-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) var(--space-6);
          background-color: #1F1F21;
          border-bottom: 0.5px solid #2C2C2E;
          border-top-left-radius: var(--radius-card);
          border-top-right-radius: var(--radius-card);
        }
        .terminal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-accent);
        }
        .terminal-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wide);
          color: var(--color-text-secondary);
        }
        .terminal-display {
          padding: var(--space-6);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          min-height: 17rem;
        }
        .term-row {
          margin-bottom: var(--space-1);
        }
        .term-row--system {
          color: var(--color-text-muted);
        }
        .term-row--output {
          color: var(--color-text-primary);
          white-space: pre-wrap;
        }
        .term-prompt {
          color: var(--color-accent);
          margin-right: var(--space-2);
          font-weight: var(--weight-semibold);
        }
        .term-cmd {
          color: var(--color-text-primary);
        }
        .term-input-form {
          display: flex;
          align-items: center;
          margin-top: var(--space-3);
        }
        .term-cli-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text-primary);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: 0;
        }

        .cheatsheet-card {
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          background-color: var(--color-bg-surface);
          border-radius: var(--radius-card);
          border: 0.5px solid var(--color-border-subtle);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }
        .cheatsheet-anchor {
          right: var(--space-2);
          top: -1rem;
          font-size: 9rem;
          color: var(--color-accent);
          opacity: 0.04;
        }
        .cheatsheet-title {
          font-family: var(--font-display);
          font-size: var(--text-h3);
          font-weight: var(--weight-semibold);
          letter-spacing: var(--tracking-h3);
          margin: var(--space-5) 0 var(--space-1) 0;
          color: var(--color-text-primary);
        }
        .cheatsheet-pills {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }
        .pill-cmd {
          background-color: var(--color-bg-elevated);
          border: 0.5px solid var(--color-border-subtle);
          border-radius: var(--radius-input);
          padding: var(--space-3) var(--space-4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.2s var(--ease-apple), border-color 0.2s var(--ease-apple);
        }
        .pill-cmd:hover {
          background-color: #ECECEE;
          border-color: var(--color-accent);
        }
          text-align: left;
          color: var(--color-text-secondary);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          cursor: pointer;
          transition: transform var(--duration-fast) var(--ease-apple),
                      border-color var(--duration-fast) var(--ease-apple),
                      color var(--duration-fast) var(--ease-apple),
                      background-color var(--duration-fast) var(--ease-apple);
        }
        .pill-cmd:hover {
          transform: scale(1.015);
          border-color: var(--color-accent);
          color: var(--color-text-primary);
          background-color: var(--color-bg-elevated);
        }
        .pill-cmd:active {
          transform: scale(0.985);
        }
        .pill-cmd code {
          color: var(--color-text-primary);
          font-weight: var(--weight-semibold);
          margin-right: var(--space-1);
        }

        /* Curriculum 8 Bento Grid */
        .bento-curriculum-section {
          margin-top: var(--space-10);
          padding-top: var(--space-10);
          border-top: 1px solid var(--color-border-subtle);
        }
        .curriculum-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-8);
        }
        .curriculum-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: var(--weight-semibold);
          letter-spacing: var(--tracking-tight);
          line-height: var(--leading-tight);
          margin: var(--space-1) 0 0 0;
          color: var(--color-text-primary);
        }
        .curriculum-bento-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: var(--space-5);
        }
        .world-bento-card {
          padding: var(--space-6) var(--space-8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 15rem;
          background-color: var(--color-bg-surface);
          border-radius: var(--radius-card);
          border: 0.5px solid var(--color-border-subtle);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
          transition: transform var(--duration-fast) var(--ease-apple),
                      border-color var(--duration-fast) var(--ease-apple),
                      box-shadow var(--duration-fast) var(--ease-apple);
        }
        .world-bento-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
        }
        .world-bento-card--active {
          border-color: var(--color-accent);
        }
        .world-bento-card--muted {
          opacity: 0.7;
          background-color: var(--color-bg-elevated);
        }
        .world-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }
        .world-bento-title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          letter-spacing: var(--tracking-snug);
          margin: 0 0 var(--space-2) 0;
          color: var(--color-text-primary);
        }
        .world-bento-desc {
          font-family: var(--font-body);
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          line-height: var(--leading-normal);
          margin: 0 0 var(--space-5) 0;
        }
        .world-cmd-preview {
          background-color: var(--color-bg-base);
          border: 1px solid var(--color-border-subtle);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-5);
        }
        .world-code {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-text-primary);
          overflow-x: auto;
          white-space: nowrap;
          margin-top: 2px;
        }
        .world-bento-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--color-border-subtle);
          padding-top: var(--space-3);
        }

        .bento-footer {
          border-top: 1px solid var(--color-border-subtle);
          padding: var(--space-6) var(--space-10);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--color-bg-base);
        }

        @media (max-width: 1024px) {
          .bento-header { padding: var(--space-4) var(--space-6); }
          .bento-container { padding: var(--space-6); }
          .bento-row { grid-template-columns: 1fr; }
          .bento-stats-row { grid-template-columns: 1fr 1fr; }
          .sidebar-vertical-left, .sidebar-vertical-right { display: none; }
        }
        @media (max-width: 640px) {
          .bento-stats-row { grid-template-columns: 1fr; }
          .nav-pills { display: none; }
        }
      `}</style>
    </div>
  )
}

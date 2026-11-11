// Icons: lucide-react only — do not mix libraries
import * as React from "react";
import { LogOut, Settings, User } from "lucide-react";

export interface UserButtonPopoverProps {
  name: string;
  email: string;
  avatarInitials: string;
  level: number;
  xp: number;
  onSignOut: () => void;
  onViewProfile?: () => void;
  onSettings?: () => void;
  onClose?: () => void;
}

function ProfileIcon() {
  return <User size={15} strokeWidth={2} aria-hidden="true" />;
}

function SettingsIcon() {
  return <Settings size={15} strokeWidth={2} aria-hidden="true" />;
}

function LogOutIcon() {
  return <LogOut size={15} strokeWidth={2} aria-hidden="true" />;
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  padding: "6px 8px",
  height: "32px",
  borderRadius: "6px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "13px",
  color: "var(--color-text-primary)",
  textAlign: "left",
  transition: "background 100ms ease, color 100ms ease",
  outline: "none",
};

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
  "data-testid": testId,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  "data-testid"?: string;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      style={{
        ...menuItemStyle,
        color: danger ? "var(--color-accent)" : "var(--color-text-primary)",
        background: hovered
          ? danger
            ? "var(--color-accent-muted)"
            : "var(--color-bg-elevated)"
          : "transparent",
        fontWeight: danger ? 500 : 400,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          color: danger ? "var(--color-accent)" : hovered ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

export function UserButtonPopover({
  name,
  email,
  avatarInitials,
  level,
  xp,
  onSignOut,
  onViewProfile,
  onSettings,
  onClose,
}: UserButtonPopoverProps) {
  return (
    <div
      role="dialog"
      aria-label="User menu"
      data-testid="user-popover"
      style={{
        width: "240px",
        borderRadius: "12px",
        border: "1px solid var(--color-border-subtle)",
        backgroundColor: "var(--color-bg-surface)",
        color: "var(--color-text-primary)",
        boxShadow: "0 12px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "6px",
        animation: "tuxPopoverIn 100ms ease-out",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes tuxPopoverIn {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* User header */}
      <div
        data-testid="popover-user-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 10px",
          borderRadius: "8px",
          background: "var(--color-bg-elevated)",
          border: "1px solid rgba(0, 0, 0, 0.04)",
          marginBottom: "4px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            flexShrink: 0,
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          {avatarInitials}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.3 }}>
          <span
            data-testid="popover-name"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
          <span
            data-testid="popover-email"
            style={{
              fontSize: "11px",
              color: "var(--color-text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </span>
          <span
            data-testid="popover-level-xp"
            style={{
              fontSize: "11px",
              color: "var(--color-accent)",
              fontWeight: 500,
              marginTop: "1px",
            }}
          >
            Level {level} · {xp.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--color-border-subtle)", opacity: 0.6, margin: "4px 0" }} />

      {/* Menu items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <MenuItem
          icon={<ProfileIcon />}
          label="View Profile"
          onClick={onViewProfile ?? onClose}
          data-testid="menu-view-profile"
        />
        <MenuItem
          icon={<SettingsIcon />}
          label="Settings"
          onClick={onSettings ?? onClose}
          data-testid="menu-settings"
        />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--color-border-subtle)", opacity: 0.6, margin: "4px 0" }} />

      {/* Sign out */}
      <MenuItem
        icon={<LogOutIcon />}
        label="Sign out"
        onClick={onSignOut}
        danger
        data-testid="menu-sign-out"
      />
    </div>
  );
}

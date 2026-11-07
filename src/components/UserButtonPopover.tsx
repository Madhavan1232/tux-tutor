import * as React from "react";

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
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-3.038 0-5.5 2.015-5.5 4.5v.5h11v-.5c0-2.485-2.462-4.5-5.5-4.5Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.00021 5.25C9.51887 5.25015 10.7502 6.48131 10.7502 8C10.7502 9.51869 9.51887 10.7499 8.00021 10.75C6.48142 10.75 5.25021 9.51878 5.25021 8C5.25021 6.48122 6.48142 5.25 8.00021 5.25ZM8.00021 6.75C7.30985 6.75 6.75021 7.30964 6.75021 8C6.75021 8.69036 7.30985 9.25 8.00021 9.25C8.69044 9.24985 9.25021 8.69027 9.25021 8C9.25021 7.30973 8.69044 6.75015 8.00021 6.75ZM8.4797 1C8.79032 1.00005 9.11521 1.07609 9.39571 1.28516C9.67641 1.49469 9.84241 1.78493 9.93087 2.08301L10.0764 2.57422C10.1033 2.66485 10.1451 2.71838 10.2268 2.76562L11.4192 3.4541C11.5007 3.50111 11.5678 3.51013 11.6594 3.48828L12.1584 3.36914C12.4605 3.2968 12.7939 3.29566 13.1154 3.43359C13.4372 3.57185 13.666 3.81486 13.8215 4.08398L14.302 4.91602C14.4573 5.18528 14.554 5.50472 14.5129 5.85254C14.4717 6.20036 14.303 6.48828 14.0891 6.71387L13.7365 7.08594C13.6717 7.15443 13.6467 7.21713 13.6467 7.31152V8.68848C13.6467 8.78287 13.6717 8.84557 13.7365 8.91406L14.0891 9.28613C14.303 9.51172 14.4717 9.79964 14.5129 10.1475C14.554 10.4953 14.4573 10.8147 14.302 11.084L13.8215 11.916C13.666 12.1851 13.4372 12.4281 13.1154 12.5664C12.7939 12.7043 12.4605 12.7032 12.1584 12.6309L11.6594 12.5117C11.5678 12.4899 11.5007 12.4989 11.4192 12.5459L10.2268 13.2344C10.1451 13.2816 10.1033 13.3352 10.0764 13.4258L9.93087 13.917C9.84241 14.2151 9.67641 14.5053 9.39571 14.7148C9.11521 14.9239 8.79032 15 8.4797 15H7.51974C7.20899 14.9999 6.8833 14.9242 6.60275 14.7148C6.32229 14.5053 6.15699 14.2149 6.06857 13.917L5.92306 13.4258C5.89612 13.3351 5.85359 13.2817 5.77169 13.2344L4.58028 12.5459C4.51915 12.5107 4.46564 12.4967 4.4045 12.501L4.33907 12.5117L3.84103 12.6309C3.53875 12.7032 3.20473 12.7047 2.88302 12.5664C2.56142 12.428 2.33239 12.1852 2.17696 11.916L1.69747 11.084C1.54209 10.8147 1.44542 10.4953 1.48653 10.1475C1.52769 9.79988 1.69567 9.51165 1.90939 9.28613L2.26192 8.91406C2.327 8.84544 2.35271 8.783 2.35275 8.68848V7.31152C2.35271 7.217 2.327 7.15455 2.26192 7.08594L1.90939 6.71387C1.69567 6.48835 1.52769 6.20012 1.48653 5.85254C1.44542 5.50474 1.54209 5.18527 1.69747 4.91602L2.17696 4.08398C2.33239 3.81484 2.56142 3.57196 2.88302 3.43359C3.20473 3.29533 3.53875 3.29676 3.84103 3.36914L4.33907 3.48828L4.4045 3.49902C4.46564 3.50331 4.51915 3.48931 4.58028 3.4541L5.77169 2.76562C5.85359 2.71834 5.89612 2.66492 5.92306 2.57422L6.06857 2.08301C6.15699 1.78507 6.32229 1.49467 6.60275 1.28516C6.8833 1.07582 7.20899 1.0001 7.51974 1H8.4797Z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 14H3.333a1.333 1.333 0 0 1-1.333-1.333V3.333A1.333 1.333 0 0 1 2 2h4" />
      <path d="M10.667 11.333 14 8l-3.333-3.333" />
      <path d="M14 8H6" />
    </svg>
  );
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

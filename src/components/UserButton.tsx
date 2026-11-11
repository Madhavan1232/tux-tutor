// Icons: lucide-react only — do not mix libraries
import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronUp } from "lucide-react";
import { UserButtonPopover } from "./UserButtonPopover";

export interface TuxUserButtonProps {
  name: string;
  email: string;
  avatarInitials: string;
  level: number;
  xp: number;
  onSignOut: () => void;
  onViewProfile?: () => void;
  onSettings?: () => void;
}

function ChevronUpIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <ChevronUp
      size={15}
      strokeWidth={2}
      style={{
        transition: "transform 150ms ease-out",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        color: "var(--color-text-secondary)",
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}

export function UserButton({
  name,
  email,
  avatarInitials,
  level,
  xp,
  onSignOut,
  onViewProfile,
  onSettings,
}: TuxUserButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  // Start off-screen so there's no flash on first open
  const [coords, setCoords] = React.useState<{ top: number; left: number; visible: boolean }>({
    top: -9999,
    left: -9999,
    visible: false,
  });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  /** Compute position from actual DOM measurements — always uses real rendered size. */
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();

    // Use the popover's actual rendered height when available, otherwise a safe estimate
    const ph = popoverRef.current
      ? popoverRef.current.getBoundingClientRect().height
      : 220;
    const pw = popoverRef.current
      ? popoverRef.current.getBoundingClientRect().width
      : 240;

    // Anchor: bottom of popover sits 6px above the top of the trigger button
    let top = trigger.top - ph - 6;
    let left = trigger.left;

    // Flip below if no space above
    if (top < 10) {
      top = trigger.bottom + 6;
    }

    // Clamp within viewport
    left = Math.max(10, Math.min(left, window.innerWidth - pw - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - ph - 10));

    setCoords({ top, left, visible: true });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updatePosition]);

  const toggleOpen = () => {
    if (!isOpen) updatePosition();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${name} — open user menu`}
        data-testid="user-button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "8px 10px",
          borderRadius: "8px",
          border: "none",
          background: isOpen ? "rgba(220, 38, 38, 0.06)" : "transparent",
          cursor: "pointer",
          transition: "background 150ms ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) (e.currentTarget as HTMLElement).style.background = "rgba(220, 38, 38, 0.04)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          {/* Avatar circle */}
          <div
            data-testid="user-avatar"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.03em",
              flexShrink: 0,
              border: "1px solid rgba(220, 38, 38, 0.2)",
            }}
          >
            {avatarInitials}
          </div>

          {/* Name + level */}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.2 }}>
            <span
              data-testid="user-name"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "110px",
              }}
            >
              {name}
            </span>
            <span
              data-testid="user-level"
              style={{ fontSize: "11px", color: "#dc2626", fontWeight: 500 }}
            >
              Lv.{level}
            </span>
          </div>
        </div>

        <ChevronUpIcon isOpen={isOpen} />
      </button>

      {/* Portal-rendered popover */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
          >
            <UserButtonPopover
              name={name}
              email={email}
              avatarInitials={avatarInitials}
              level={level}
              xp={xp}
              onSignOut={() => {
                setIsOpen(false);
                onSignOut();
              }}
              onViewProfile={() => {
                setIsOpen(false);
                onViewProfile?.();
              }}
              onSettings={() => {
                setIsOpen(false);
                onSettings?.();
              }}
              onClose={() => setIsOpen(false)}
            />
          </div>,
          document.body
        )}
    </>
  );
}

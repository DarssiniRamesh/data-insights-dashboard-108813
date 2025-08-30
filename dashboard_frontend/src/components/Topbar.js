import React from "react";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * Topbar
 * Props:
 * - brand?: ReactNode (default "Admin page")
 * - onToggleSidebar?: () => void
 * - actionsRight?: ReactNode (e.g., create button, bell, profile)
 */
export default function Topbar({ brand = "Dashboard", onToggleSidebar, actionsRight }) {
  return (
    <header className="topbar" role="banner">
      <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          className="icon-btn"
          aria-label="Toggle sidebar"
          onClick={() => onToggleSidebar && onToggleSidebar()}
          title="Toggle sidebar"
        >
          ☰
        </button>
        <strong style={{ fontSize: "20px", color: "var(--text-strong)" }}>{brand}</strong>
      </div>
      <div className="topbar-right" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        {actionsRight || (
          <>
            <button className="btn btn-ghost" type="button" aria-label="Create new item">Create new</button>
            <button className="icon-btn" type="button" aria-label="Notifications" title="Notifications">🔔</button>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 32, height: 32, borderRadius: "50%", background: "var(--surface-hover)",
                  display: "inline-block"
                }}
                aria-hidden="true"
              />
              <span style={{ fontSize: "14px", color: "var(--text)" }}>John</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

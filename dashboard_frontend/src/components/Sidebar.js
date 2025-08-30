import React from "react";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Props:
 * - items: Array<{ key: string, icon?: ReactNode, label: string }>,
 * - activeKey?: string
 * - onItemClick?: (key: string) => void
 * - header?: ReactNode (optional logo/header)
 */
export default function Sidebar({ items = [], activeKey, onItemClick, header }) {
  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      {header ? <div className="sidebar-header" style={{ padding: "4px 8px 12px 8px" }}>{header}</div> : null}
      <nav>
        <ul className="nav-list" role="list">
          {items.map((it) => {
            const isActive = it.key === activeKey;
            return (
              <li key={it.key}>
                <button
                  type="button"
                  className={`nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onItemClick && onItemClick(it.key)}
                >
                  <span aria-hidden="true">{it.icon || "•"}</span>
                  <span>{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

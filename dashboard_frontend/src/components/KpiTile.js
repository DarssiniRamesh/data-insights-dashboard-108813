import React from "react";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * KpiTile
 * Props:
 * - icon?: ReactNode | string (emoji/text)
 * - label: string
 * - value: number | string
 * - accentVar?: CSS color var for accent ring
 * - tintVar?: CSS color var for background tint
 * - badge?: ReactNode (optional right-top)
 */
export default function KpiTile({
  icon = "📈",
  label,
  value,
  accentVar = "var(--primary)",
  tintVar = "var(--tile-blue)",
  badge = null,
  className = "",
  ...rest
}) {
  const iconStyle = {
    background: tintVar,
    color: accentVar,
    boxShadow: `inset 0 0 0 6px ${tintVar}`,
  };
  return (
    <article className={`kpi-tile ${className}`} {...rest} aria-label={`KPI ${label}`}>
      <div className="kpi-top">
        <div className="kpi-icon" style={iconStyle} aria-hidden="true">
          {icon}
        </div>
        {badge ? <div className="kpi-badge">{badge}</div> : <span aria-hidden="true" />}
      </div>
      <div className="kpi-label" title={label}>{label}</div>
      <div className="kpi-value" role="text" aria-live="polite">
        {value}
      </div>
    </article>
  );
}

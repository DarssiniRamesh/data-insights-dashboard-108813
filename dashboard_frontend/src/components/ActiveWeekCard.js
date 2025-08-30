import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * ActiveWeekCard
 * Props:
 * - context: { week_label: string, date_range: string, participants: number, unique_voters: number, ends_in: string }
 */
export default function ActiveWeekCard({ context }) {
  const ctx = context || {};
  return (
    <Card title="Active Contest" className="active-week">
      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Week</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-strong)" }}>{ctx.week_label || "—"}</div>
          {ctx.date_range ? <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ctx.date_range}</div> : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div className="card" style={{ padding: 12, background: "var(--surface-hover)" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Participants</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{ctx.participants ?? 0}</div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Unique Voters</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{ctx.unique_voters ?? 0}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="legend-dot" style={{ background: "var(--success)" }} aria-hidden="true"></span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Ends in</span>
          <strong style={{ marginLeft: "auto" }}>{ctx.ends_in || "-"}</strong>
        </div>
      </div>
    </Card>
  );
}

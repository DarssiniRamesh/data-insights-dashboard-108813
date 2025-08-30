import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * WinnersHistoryCard
 * Props:
 * - title?: string
 * - items: Array<{ id: string|number, week: string, app_name: string, owner_name: string, decided_at?: string, total_votes?: number|null }>
 */
export default function WinnersHistoryCard({ title = "Winners History", items = [] }) {
  return (
    <Card title={title} className="winners-history">
      <div role="table" aria-label="Past contest winners" style={{ width: "100%" }}>
        <div role="rowgroup">
          <div role="row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 140px 120px", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--surface-border)", fontSize: 12, color: "var(--text-muted)" }}>
            <div role="columnheader">Week</div>
            <div role="columnheader">Winner App</div>
            <div role="columnheader">Owner</div>
            <div role="columnheader">Decided At</div>
            <div role="columnheader" style={{ textAlign: "right" }}>Total Votes</div>
          </div>
        </div>
        <div role="rowgroup" style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {items.map((it) => (
            <div key={it.id} role="row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 140px 120px", gap: 8, alignItems: "center" }}>
              <div role="cell">{it.week}</div>
              <div role="cell">{it.app_name}</div>
              <div role="cell" style={{ color: "var(--text-muted)" }}>{it.owner_name}</div>
              <div role="cell">{it.decided_at ? new Date(it.decided_at).toLocaleDateString() : "-"}</div>
              <div role="cell" style={{ textAlign: "right" }}>{it.total_votes ?? "-"}</div>
            </div>
          ))}
          {items.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No recent winners.</div>}
        </div>
      </div>
    </Card>
  );
}

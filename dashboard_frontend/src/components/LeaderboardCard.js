import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * LeaderboardCard
 * Props:
 * - title?: string
 * - rows: Array<{ app_id: string|number, app_name: string, owner_name: string, votes: number, share: number }>
 */
export default function LeaderboardCard({ title = "Top Apps (Active Week)", rows = [] }) {
  return (
    <Card title={title} className="leaderboard">
      <div role="table" aria-label="Top apps leaderboard" style={{ width: "100%" }}>
        <div role="rowgroup">
          <div role="row" style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 100px 80px", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--surface-border)", fontSize: 12, color: "var(--text-muted)" }}>
            <div role="columnheader">Rank</div>
            <div role="columnheader">App</div>
            <div role="columnheader">Owner</div>
            <div role="columnheader" style={{ textAlign: "right" }}>Votes</div>
            <div role="columnheader" style={{ textAlign: "right" }}>Share</div>
          </div>
        </div>
        <div role="rowgroup" style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {rows.map((r, idx) => (
            <div key={r.app_id} role="row" style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 100px 80px", gap: 8, alignItems: "center" }}>
              <div role="cell" style={{ fontWeight: 600, color: "var(--text-strong)" }}>#{idx + 1}</div>
              <div role="cell">{r.app_name}</div>
              <div role="cell" style={{ color: "var(--text-muted)" }}>{r.owner_name}</div>
              <div role="cell" style={{ textAlign: "right", fontWeight: 600 }}>{r.votes}</div>
              <div role="cell" style={{ textAlign: "right" }}>{r.share}%</div>
            </div>
          ))}
          {rows.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No data.</div>}
        </div>
      </div>
    </Card>
  );
}

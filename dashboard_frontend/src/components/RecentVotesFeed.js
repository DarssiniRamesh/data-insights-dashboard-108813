import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * RecentVotesFeed
 * Props:
 * - title?: string
 * - items: Array<{ id: string|number, created_at: string, voter_name: string, app_name: string, week_label?: string }>
 */
export default function RecentVotesFeed({ title = "Recent Votes", items = [] }) {
  return (
    <Card title={title} className="feed">
      <div className="feed-list" role="list">
        {items.map((it) => (
          <div className="feed-item" key={it.id} role="listitem">
            <div aria-hidden="true" className="recent-vote-avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>
                {it.voter_name || "Unknown Voter"} voted
              </div>
              <div style={{ marginTop: 4 }}>
                App: <strong>{it.app_name || "Unknown App"}</strong>
                {it.week_label ? ` · ${it.week_label}` : ""}
              </div>
              <div className="feed-meta" style={{ marginTop: 4 }}>
                {it.created_at ? new Date(it.created_at).toLocaleString() : ""}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No recent votes.</div>}
      </div>
    </Card>
  );
}

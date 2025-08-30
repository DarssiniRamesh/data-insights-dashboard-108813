import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * ActivityFeed
 * Props:
 * - title?: string
 * - items: Array<{
 *     id: string|number,
 *     message: string,
 *     status?: string,
 *     created_at?: string,
 *     author?: { name?: string, avatar_url?: string }
 *   }>
 * - onApprove?: (id) => void
 * - onReject?: (id) => void
 */
export default function ActivityFeed({ title = "Activity", items = [], onApprove, onReject }) {
  return (
    <Card title={title} className="feed">
      <div className="feed-list" role="list">
        {items.map((it) => (
          <div className="feed-item" key={it.id} role="listitem">
            <div>
              {it?.author?.avatar_url ? (
                <img
                  src={it.author.avatar_url}
                  alt={`${it.author?.name || "User"} avatar`}
                  width={36}
                  height={36}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 36, height: 36, borderRadius: "50%", background: "var(--surface-hover)"
                  }}
                />
              )}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>
                {it.author?.name || "Unknown"}
              </div>
              <div style={{ marginTop: 4 }}>{it.message}</div>
              <div className="feed-meta" style={{ marginTop: 4 }}>
                {it.created_at ? new Date(it.created_at).toLocaleString() : ""}
                {it.status ? ` · ${it.status}` : ""}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn"
                  style={{ height: 32, padding: "0 12px" }}
                  onClick={() => onApprove && onApprove(it.id)}
                  aria-label={`Approve activity ${it.id}`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ height: 32, padding: "0 12px", color: "var(--danger)", borderColor: "var(--danger)" }}
                  onClick={() => onReject && onReject(it.id)}
                  aria-label={`Reject activity ${it.id}`}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No recent activity.</div>
        )}
      </div>
    </Card>
  );
}

"use strict";

import React, { useMemo, useState } from "react";
import "../styles/tokens.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Card from "../components/Card";

/**
 * PUBLIC_INTERFACE
 * VotingDashboard
 * Shell-only layout for the app-voter use case.
 * This scaffolds:
 * - Sidebar with nav items
 * - Topbar with brand and actions
 * - Main content area using a responsive grid:
 *   - KPI tiles row (4 tiles)
 *   - Row with left: line chart placeholder; right: doughnut placeholder
 *   - Row with left: recent feed placeholder; right: winners/announcement placeholder
 *
 * No data fetching or Supabase wiring is implemented here. All widgets are placeholders.
 */
export default function VotingDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");

  // Sidebar items draft to match design sections
  const navItems = useMemo(
    () => [
      { key: "dashboard", icon: "📊", label: "Dashboard" },
      { key: "users", icon: "👥", label: "Users" },
      { key: "mail", icon: "✉️", label: "Mail" },
      { key: "messages", icon: "💬", label: "Messages" },
      { key: "analytics", icon: "📈", label: "Analytics" },
      { key: "sales", icon: "💳", label: "Sales" },
      { key: "posts", icon: "📝", label: "Posts" },
      { key: "tasks", icon: "✅", label: "Tasks" },
      { key: "reports", icon: "📄", label: "Reports" },
      { key: "settings", icon: "⚙️", label: "Settings" },
      { key: "support", icon: "🛟", label: "Support" },
      { key: "logout", icon: "🚪", label: "Logout" },
    ],
    []
  );

  return (
    <div className="app-shell">
      <Sidebar
        items={navItems}
        activeKey={activeNav}
        onItemClick={(k) => setActiveNav(k)}
        header={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--primary-100)",
                boxShadow: "inset 0 0 0 1px var(--primary-50)",
              }}
            />
            <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>Admin page</div>
          </div>
        }
      />

      <Topbar brand="App Voter Dashboard" />

      <main className="content" role="main" aria-label="Voting dashboard content">
        {/* KPI Tiles Row (skeleton placeholders) */}
        <section className="kpis" aria-label="Key performance indicators">
          <KpiSkeleton label="Active Week" />
          <KpiSkeleton label="Votes Today" />
          <KpiSkeleton label="Total Votes" />
          <KpiSkeleton label="Top App" />
        </section>

        {/* Row 2: Left chart placeholder + Right doughnut placeholder */}
        <section className="row" aria-label="Charts section">
          <Card
            title="Votes per day (Active Week)"
            className="line-chart"
            actions={
              <div className="legend" aria-hidden="true">
                <span className="legend">
                  <span className="legend-dot" style={{ background: "var(--chart-new)" }} />
                  <span style={{ fontSize: 12 }}>Votes</span>
                </span>
              </div>
            }
          >
            <div
              style={{
                height: 260,
                border: "1px dashed var(--surface-border)",
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                color: "var(--text-muted)",
                fontSize: 12,
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 23px, var(--surface-border) 24px), repeating-linear-gradient(90deg, transparent, transparent 59px, var(--surface-border) 60px)",
              }}
              aria-hidden="true"
            >
              Line chart placeholder — votes/day
            </div>
          </Card>

          <Card title="Tasks" className="tasks-donut">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", justifyItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background:
                    "conic-gradient(var(--success) 0% 60%, var(--ring-bg) 60% 100%)",
                  display: "grid",
                  placeItems: "center",
                }}
                aria-hidden="true"
              >
                <div
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    background: "#fff",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "inset 0 0 0 1px var(--surface-border)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>60%</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>complete</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 8, width: "100%" }}>
                <LegendItem colorVar="var(--success)" label="Done" value="—" />
                <LegendItem colorVar="var(--warning)" label="In progress" value="—" />
                <LegendItem colorVar="var(--danger)" label="Todo" value="—" />
              </div>
            </div>
          </Card>
        </section>

        {/* Row 3: Left feed placeholder + Right winners/announcement placeholder */}
        <section className="row" aria-label="Feeds and announcement">
          <Card title="Recent Votes" className="feed">
            <div className="feed-list" role="list">
              <FeedSkeleton />
              <FeedSkeleton />
              <FeedSkeleton />
            </div>
          </Card>

          <Card className="campaign-card" title="Marketing Campaign" actions={null}>
            <div style={{ color: "white" }}>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Drive engagement with our latest voting campaign.
              </p>
              <div style={{ marginTop: 12 }}>
                <button
                  className="btn btn-ghost"
                  style={{
                    height: 34,
                    padding: "0 12px",
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.25)",
                  }}
                  type="button"
                >
                  Start Now
                </button>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * KpiSkeleton
 * Minimal KPI tile UI for layout scaffolding only.
 */
function KpiSkeleton({ label = "KPI" }) {
  return (
    <article className="kpi-tile" aria-label={`KPI ${label}`}>
      <div className="kpi-top">
        <div
          className="kpi-icon"
          style={{
            background: "var(--tile-blue)",
            color: "var(--primary)",
            boxShadow: "inset 0 0 0 6px var(--tile-blue)",
          }}
          aria-hidden="true"
        >
          •
        </div>
        <span aria-hidden="true" />
      </div>
      <div className="kpi-label" title={label}>
        {label}
      </div>
      <div className="kpi-value" role="text" aria-live="polite">
        —
      </div>
    </article>
  );
}

/**
 * PUBLIC_INTERFACE
 * LegendItem
 * Simple legend row used under the tasks placeholder donut.
 */
function LegendItem({ colorVar, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="legend-dot" style={{ background: colorVar }} aria-hidden="true" />
      <span style={{ fontSize: 13 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{value}</span>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * FeedSkeleton
 * Placeholder item for the Recent Votes feed column.
 */
function FeedSkeleton() {
  return (
    <div className="feed-item" role="listitem" aria-label="Loading item">
      <div
        aria-hidden="true"
        style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-hover)" }}
      />
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>— voted</div>
        <div style={{ marginTop: 4, color: "var(--text)" }}>App: —</div>
        <div className="feed-meta" style={{ marginTop: 4 }}>
          —
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" style={{ height: 32, padding: "0 12px" }} disabled>
            Approve
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 32, padding: "0 12px", color: "var(--danger)", borderColor: "var(--danger)" }}
            disabled
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

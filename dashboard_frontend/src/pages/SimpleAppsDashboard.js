"use strict";

import React, { useEffect, useMemo, useState } from "react";
import "../styles/tokens.css";
import { supabase } from "../lib/supabaseClient";
import Card from "../components/Card";

/**
 * PUBLIC_INTERFACE
 * SimpleAppsDashboard
 * A minimal dashboard that:
 * 1) Lists all apps from the "apps" table (flat select).
 * 2) Displays a chart of "apps created per week" based on created_at, grouped by ISO week-year.
 *
 * Environment:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 */
export default function SimpleAppsDashboard() {
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState("");

  const [weeklyData, setWeeklyData] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [weeklyError, setWeeklyError] = useState("");

  // PUBLIC_INTERFACE
  // Fetch all apps with a flat select (no joins), order newest first
  async function fetchAllApps() {
    setLoadingApps(true);
    setAppsError("");
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[SimpleAppsDashboard] fetchAllApps error:", err);
      setAppsError(err?.message || "Failed to load apps.");
      setApps([]);
    } finally {
      setLoadingApps(false);
    }
  }

  // PUBLIC_INTERFACE
  // Fetch minimal columns to compute group-by-week on client
  // Constraint: No joins/nested. We only read id and created_at.
  async function fetchAppsForWeeklyAgg() {
    setLoadingWeekly(true);
    setWeeklyError("");
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("id,created_at");
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      const grouped = groupByYearWeek(rows);
      setWeeklyData(grouped);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[SimpleAppsDashboard] fetchAppsForWeeklyAgg error:", err);
      setWeeklyError(err?.message || "Failed to load weekly aggregation.");
      setWeeklyData([]);
    } finally {
      setLoadingWeekly(false);
    }
  }

  useEffect(() => {
    fetchAllApps();
    fetchAppsForWeeklyAgg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build columns list dynamically for the apps table
  const appColumns = useMemo(() => {
    // Prefer showing common fields if present
    const preferred = ["id", "name", "title", "owner_id", "created_at"];
    const discovered = new Set();

    // Scan first few rows to discover keys
    apps.slice(0, 5).forEach((r) => {
      Object.keys(r || {}).forEach((k) => discovered.add(k));
    });

    // Start with preferred order, then append any other discovered fields
    const ordered = [];
    preferred.forEach((k) => {
      if (discovered.has(k)) ordered.push(k);
    });
    discovered.forEach((k) => {
      if (!ordered.includes(k)) ordered.push(k);
    });

    // Fallback if no rows, show preferred minimal
    const finalKeys = ordered.length > 0 ? ordered : preferred;

    return finalKeys;
  }, [apps]);

  return (
    <main className="content" role="main" aria-label="Apps dashboard">
      <div className="row">
        <AppsTableCard
          columns={appColumns}
          rows={apps}
          loading={loadingApps}
          error={appsError}
        />
        <AppsPerWeekCard
          data={weeklyData}
          loading={loadingWeekly}
          error={weeklyError}
        />
      </div>
    </main>
  );
}

/**
 * PUBLIC_INTERFACE
 * groupByYearWeek
 * Given rows with created_at, returns an array of { key: "YYYY-Www", count: number }
 * Weeks use ISO-8601 week number.
 */
function groupByYearWeek(rows) {
  const map = {};
  (rows || []).forEach((r) => {
    const key = toYearWeekKey(r?.created_at);
    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  });

  // Sort keys ascending (chronological)
  const keys = Object.keys(map).sort((a, b) => {
    // a: "YYYY-Www"
    const [ay, aw] = a.split("-W").map((x) => parseInt(x, 10));
    const [by, bw] = b.split("-W").map((x) => parseInt(x, 10));
    if (ay !== by) return ay - by;
    return aw - bw;
  });

  return keys.map((k) => ({ key: k, count: map[k] || 0 }));
}

/**
 * PUBLIC_INTERFACE
 * toYearWeekKey
 * Convert a date-like to ISO year-week in "YYYY-Www"
 */
function toYearWeekKey(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(+d)) return "";

  // ISO week date algorithm
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Thursday in current week decides the year
  const dayNum = tmp.getUTCDay() || 7; // 1..7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  const year = tmp.getUTCFullYear();
  const ww = String(weekNum).padStart(2, "0");
  return `${year}-W${ww}`;
}

/**
 * PUBLIC_INTERFACE
 * AppsTableCard
 * Renders the table of apps.
 */
function AppsTableCard({ columns = [], rows = [], loading, error }) {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span>All Apps</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            ({(rows || []).length} shown)
          </span>
        </div>
      }
      className="simple-table"
      role="group"
      aria-label="All apps list"
    >
      {loading ? (
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading apps…</div>
      ) : error ? (
        <div style={{ fontSize: 14, color: "var(--danger)" }}>{error}</div>
      ) : (
        <div role="table" aria-label="Apps table" style={{ width: "100%" }}>
          <div role="rowgroup">
            <div
              role="row"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid var(--surface-border)",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              {columns.map((c) => (
                <div key={c} role="columnheader">
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div role="rowgroup" style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {(rows || []).map((r, idx) => (
              <div
                key={String(r?.id ?? idx)}
                role="row"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {columns.map((c) => {
                  const v = r?.[c];
                  let text = "";
                  if (v === null || v === undefined) text = "-";
                  else if (typeof v === "string") text = v;
                  else if (typeof v === "number") text = String(v);
                  else if (v instanceof Date) text = v.toLocaleString();
                  else if (c === "created_at" || c.endsWith("_at")) {
                    const dt = new Date(v);
                    text = Number.isNaN(+dt) ? String(v) : dt.toLocaleString();
                  } else {
                    text = String(v);
                  }
                  return (
                    <div key={c} role="cell" style={{ fontSize: 13, color: "var(--text)" }}>
                      {text}
                    </div>
                  );
                })}
              </div>
            ))}
            {(rows || []).length === 0 && (
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>No apps found.</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * PUBLIC_INTERFACE
 * AppsPerWeekCard
 * Very light chart card that displays a weekly bar chart using pure CSS.
 * Props:
 * - data: Array<{ key: string (YYYY-Www), count: number }>
 */
function AppsPerWeekCard({ data = [], loading, error }) {
  // Compute scale
  const max = useMemo(
    () => Math.max(0, ...(data || []).map((d) => Number(d?.count) || 0)),
    [data]
  );

  return (
    <Card title="Apps per week (Recent)" className="line-chart" role="group" aria-label="Apps per week (Recent) chart">
      {loading ? (
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading weekly data…</div>
      ) : error ? (
        <div style={{ fontSize: 14, color: "var(--danger)" }}>{error}</div>
      ) : (
        <div>
          <div
            style={{
              height: 260,
              border: "1px dashed var(--surface-border)",
              borderRadius: 8,
              display: "grid",
              alignItems: "end",
              gap: 6,
              padding: "12px",
              gridAutoFlow: "column",
              gridAutoColumns: "minmax(8px, 1fr)",
              overflowX: "auto",
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 23px, var(--surface-border) 24px)",
            }}
            aria-hidden="true"
          >
            {(data || []).map((d) => {
              const count = Number(d?.count) || 0;
              const h = max > 0 ? Math.max(4, Math.round((count / max) * 220)) : 4;
              return (
                <div
                  key={d.key}
                  title={`${d.key}: ${count}`}
                  style={{
                    height: h,
                    background: "var(--chart-new)",
                    borderRadius: 4,
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "minmax(40px, 1fr)",
              gap: 6,
              marginTop: 8,
              color: "var(--text-muted)",
              fontSize: 11,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
            aria-label="Week labels"
          >
            {(data || []).map((d) => (
              <div key={d.key} style={{ textAlign: "center" }}>
                {d.key}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

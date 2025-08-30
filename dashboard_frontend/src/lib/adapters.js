"use strict";

/**
 * Data adapters and utility mappers for the dashboard.
 * These helpers translate raw Supabase rows into UI-friendly structures,
 * and provide aggregation/normalization functions for charts and KPIs.
 *
 * No database modification code is included; all operations are read-only transformations.
 */

/**
 * Safe number parser.
 */
function toNumber(v, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Format a JS Date or ISO string to YYYY-MM for monthly bucketing.
 */
function toMonthKey(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(+d)) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Get month labels array between two inclusive endpoints in YYYY-MM format.
 * Ensures chronological order.
 */
function enumerateMonthsInclusive(startMonthKey, endMonthKey) {
  const [sy, sm] = startMonthKey.split("-").map((x) => parseInt(x, 10));
  const [ey, em] = endMonthKey.split("-").map((x) => parseInt(x, 10));
  const results = [];
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    results.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      y += 1;
      m = 1;
    }
  }
  return results;
}

/**
 * PUBLIC_INTERFACE
 * Map raw KPI counts for dashboard tiles ensuring numeric values and labels.
 */
export function mapKpiTile(label, value, extra = {}) {
  /** Returns a typed KPI tile object for UI rendering. */
  return {
    label: String(label || ""),
    value: toNumber(value),
    ...extra,
  };
}

/**
 * PUBLIC_INTERFACE
 * Aggregate counts by status from an array of rows that contain a "status" field.
 * Returns a record: { statusValue: count }
 */
export function aggregateCountByStatus(rows, statusField = "status") {
  /** Count rows by status, case-sensitive by default. */
  const out = {};
  (rows || []).forEach((r) => {
    const key = r?.[statusField] ?? "unknown";
    out[key] = (out[key] || 0) + 1;
  });
  return out;
}

/**
 * PUBLIC_INTERFACE
 * Compute task distribution object suitable for doughnut charts and center percentage.
 * Expects count map like { done: n1, in_progress: n2, todo: n3 }
 */
export function computeTaskDistribution(countMap) {
  /** Normalize task counts and compute completion percentage. */
  const done = toNumber(countMap?.done);
  const inProgress = toNumber(countMap?.in_progress);
  const todo = toNumber(countMap?.todo);
  const total = done + inProgress + todo;

  const pctDone = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    total,
    done,
    in_progress: inProgress,
    todo,
    percent_done: pctDone,
    segments: [
      { key: "done", value: done, colorVar: "var(--success)", label: "Done" },
      { key: "in_progress", value: inProgress, colorVar: "var(--warning)", label: "In progress" },
      { key: "todo", value: todo, colorVar: "var(--danger)", label: "Todo" },
    ],
  };
}

/**
 * PUBLIC_INTERFACE
 * Normalize visit rows into monthly categories and two series arrays for "new" vs "returning".
 * rows: [{ ts, type: 'new'|'returning' }]
 * monthsBack: number of months to include including current month (default 12)
 */
export function normalizeVisitsToMonthlySeries(rows, monthsBack = 12) {
  /** Produce chart data: { categories: [YYYY-MM...], series: [{name,data}, {name,data}] } */
  const now = new Date();
  const endKey = toMonthKey(now);
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
  const startKey = toMonthKey(start);
  const categories = enumerateMonthsInclusive(startKey, endKey);

  const newMap = Object.create(null);
  const retMap = Object.create(null);
  categories.forEach((k) => {
    newMap[k] = 0;
    retMap[k] = 0;
  });

  (rows || []).forEach((r) => {
    const key = toMonthKey(r?.ts || r?.created_at || r?.m);
    if (!key || !(key in newMap)) return;
    const type = (r?.type || "").toLowerCase();
    if (type === "new") newMap[key] += 1;
    else if (type === "returning") retMap[key] += 1;
  });

  const newSeries = categories.map((k) => newMap[k] || 0);
  const retSeries = categories.map((k) => retMap[k] || 0);

  return {
    categories,
    series: [
      { name: "New", data: newSeries },
      { name: "Returning", data: retSeries },
    ],
  };
}

/**
 * PUBLIC_INTERFACE
 * Map activity rows into a feed-friendly structure.
 * Input rows are expected to include: id, message, created_at, status, user fields if joined.
 */
export function mapActivities(rows) {
  /** Map raw rows to activity feed items. */
  return (rows || []).map((r) => ({
    id: r?.id,
    message: r?.message ?? "",
    status: r?.status ?? "pending",
    created_at: r?.created_at ?? null,
    author: {
      id: r?.author_id ?? r?.user_id ?? null,
      name: r?.name ?? r?.username ?? "Unknown",
      avatar_url: r?.avatar_url ?? null,
    },
  }));
}

/**
 * PUBLIC_INTERFACE
 * Map a campaign row to a UI card model.
 */
export function mapCampaign(row) {
  /** Return a normalized campaign object for card rendering. */
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    cta: row.cta || "Start Now",
    updated_at: row.updated_at || row.created_at || null,
    // Optionally include style hints
    accentVar: "var(--accent-teal)",
  };
}

/**
 * PUBLIC_INTERFACE
 * Debounce helper for realtime handlers to reduce re-renders.
 */
export function debounce(fn, wait = 150) {
  /** Return a debounced version of a function. */
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * SimpleTablePanel
 * Renders a simple panel showing a total count and a list of recent rows for a single table.
 *
 * Props:
 * - title: string - panel title
 * - count: number|null|undefined - total row count for the table
 * - rows: Array<object> - recent rows to display
 * - columns: Array<{ key: string, label: string }> - which fields to render (single-table fields only)
 * - emptyMessage?: string - optional empty state message for no rows
 * - limitInfo?: string - optional text shown in header about row limit
 */
export default function SimpleTablePanel({
  title,
  count,
  rows = [],
  columns = [],
  emptyMessage = "No data",
  limitInfo,
}) {
  const safeCount = typeof count === "number" ? count : 0;

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span>{title}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({safeCount.toLocaleString()} total)</span>
        </div>
      }
      actions={
        limitInfo ? <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{limitInfo}</span> : null
      }
      className="simple-table"
      role="group"
      aria-label={`${title} summary`}
    >
      <div role="table" aria-label={`${title} (Recent)`} style={{ width: "100%" }}>
        {/* Header */}
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
              <div key={c.key} role="columnheader">
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div role="rowgroup" style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {rows.map((r) => (
            <div
              key={String(r.id ?? JSON.stringify(r))}
              role="row"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                gap: 8,
                alignItems: "center",
              }}
            >
              {columns.map((c) => {
                const v = r?.[c.key];
                let text = "";
                if (v === null || v === undefined) text = "-";
                else if (typeof v === "string") text = v;
                else if (typeof v === "number") text = String(v);
                else if (v instanceof Date) text = v.toLocaleString();
                else text = String(v);
                return (
                  <div key={c.key} role="cell" style={{ fontSize: 13, color: "var(--text)" }}>
                    {text}
                  </div>
                );
              })}
            </div>
          ))}
          {rows.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{emptyMessage}</div>
          )}
        </div>
      </div>
    </Card>
  );
}

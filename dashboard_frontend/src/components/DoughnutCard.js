import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * DoughnutCard
 * Props:
 * - title: string
 * - valueLabel: string | number (center label, e.g., "60%")
 * - segments: Array<{ key: string, value: number, colorVar: string, label: string }>
 *   expected keys: "done", "in_progress", "todo" but supports any
 */
export default function DoughnutCard({ title = "Tasks", valueLabel = "0%", segments = [] }) {
  const total = segments.reduce((acc, s) => acc + (Number.isFinite(s.value) ? s.value : 0), 0);
  const percents = segments.map((s) => (total > 0 ? (s.value / total) * 100 : 0));

  // Build conic-gradient string
  let current = 0;
  const stops = percents.map((p, i) => {
    const start = current;
    const end = current + p;
    current = end;
    const color = segments[i]?.colorVar || "var(--ring-bg)";
    return `${color} ${start}% ${end}%`;
  });
  const gradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <Card title={title} className="tasks-donut" role="group" aria-label="Tasks distribution">
      <div style={{ display: "grid", gridTemplateColumns: "1fr", justifyItems: "center", gap: 12 }}>
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: gradient || "var(--ring-bg)",
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
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{valueLabel}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>complete</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8, width: "100%" }}>
          {segments.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="legend-dot" style={{ background: s.colorVar }} aria-hidden="true" />
              <span style={{ fontSize: 13 }}>{s.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                {Number.isFinite(s.value) ? s.value : 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

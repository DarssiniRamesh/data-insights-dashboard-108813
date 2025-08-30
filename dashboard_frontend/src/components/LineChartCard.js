import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * LineChartCard
 * Props:
 * - title: string
 * - categories: string[]  // x-axis labels (YYYY-MM)
 * - series: Array<{ name: string, data: number[] }>
 * - legends?: Array<{ label: string, colorVar: string }>
 * - footer?: ReactNode
 * Note: This is a scaffold. Render a basic placeholder grid/legend. Hook a chart lib later.
 */
export default function LineChartCard({ title = "Visitor statistics", categories = [], series = [], legends, footer }) {
  const defaultLegends = legends || [
    { label: "New", colorVar: "var(--chart-new)" },
    { label: "Returning", colorVar: "var(--chart-returning)" },
  ];

  return (
    <Card
      title={title}
      actions={
        <div className="legend" aria-hidden="true">
          {defaultLegends.map((l) => (
            <span key={l.label} className="legend" style={{ marginLeft: 8 }}>
              <span className="legend-dot" style={{ background: l.colorVar }} />
              <span style={{ fontSize: 12 }}>{l.label}</span>
            </span>
          ))}
        </div>
      }
      className="line-chart"
      aria-label="Visitor statistics line chart"
      role="group"
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
          background: "#fff",
        }}
      >
        <div>
          Line chart placeholder — {series?.length || 0} series, {categories?.length || 0} months
        </div>
      </div>
      {footer ? <div style={{ marginTop: 8 }}>{footer}</div> : null}
    </Card>
  );
}

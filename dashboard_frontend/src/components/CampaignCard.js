import React from "react";
import Card from "./Card";
import "../styles/tokens.css";

/**
 * PUBLIC_INTERFACE
 * CampaignCard
 * Props:
 * - title?: string
 * - description?: string
 * - ctaText?: string
 * - onCtaClick?: () => void
 */
export default function CampaignCard({
  title = "Marketing Campaign",
  description = "Drive engagement with our latest campaign.",
  ctaText = "Start Now",
  onCtaClick,
}) {
  return (
    <Card className="campaign-card" title={title} actions={null}>
      <div style={{ color: "white" }}>
        <p style={{ margin: 0, opacity: 0.9 }}>{description}</p>
        <div style={{ marginTop: 12 }}>
          <button
            className="btn btn-ghost"
            style={{ height: 34, padding: "0 12px", background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
            onClick={() => onCtaClick && onCtaClick()}
            type="button"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </Card>
  );
}

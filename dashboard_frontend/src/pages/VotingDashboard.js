"use strict";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../styles/tokens.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Card from "../components/Card";
import KpiTile from "../components/KpiTile";
import LineChartCard from "../components/LineChartCard";
import LeaderboardCard from "../components/LeaderboardCard";
import RecentVotesFeed from "../components/RecentVotesFeed";
import WinnersHistoryCard from "../components/WinnersHistoryCard";
import ActiveWeekCard from "../components/ActiveWeekCard";
import SimpleTablePanel from "../components/SimpleTablePanel";

import { useVotingQueries } from "../hooks/useVotingQueries";
import { useRealtimeVotingDashboard } from "../hooks/useRealtimeVotingDashboard";

/**
 * PUBLIC_INTERFACE
 * VotingDashboard
 * End-to-end app-voter dashboard wired to Supabase.
 * Renders:
 * - KPI tiles: Active Week, Votes Today, Total Votes, Top App, New Users (7d), Apps Submitted (7d)
 * - Active Week context card (week label, date range, participants, unique voters, time remaining)
 * - Votes per day (Active Week) line chart
 * - Weekly Leaderboard (Top apps)
 * - Recent Votes feed
 * - Winners History
 * - Recent Apps table (basic)
 *
 * Defensive coding and empty state handling throughout.
 */
export default function VotingDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");

  const {
    getVotingKpis,
    getVotesOverTime,
    getLeaderboard,
    getRecentVotes,
    getWinnersHistory,
    getActiveWeekContext,
  } = useVotingQueries();

  // State slices for dashboard blocks
  const [kpis, setKpis] = useState([]);
  const [activeWeekCtx, setActiveWeekCtx] = useState(null);
  const [votesOverTime, setVotesOverTime] = useState({ categories: [], series: [{ name: "Votes", data: [] }] });
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);
  const [winners, setWinners] = useState([]);

  // Additional simple recent apps panel
  const [appsSummary, setAppsSummary] = useState({ count: 0, rows: [] });

  // Loaders
  const [loading, setLoading] = useState({
    kpis: false,
    ctx: false,
    chart: false,
    leaderboard: false,
    feed: false,
    winners: false,
    apps: false,
  });

  const setLoadingKey = useCallback((key, val) => {
    setLoading((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Initial load functions
  const loadKpis = useCallback(async () => {
    setLoadingKey("kpis", true);
    try {
      const res = await getVotingKpis();
      setKpis(res?.kpis || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[VotingDashboard] loadKpis error:", e);
      setKpis([]);
    } finally {
      setLoadingKey("kpis", false);
    }
  }, [getVotingKpis, setLoadingKey]);

  const loadActiveWeekCtx = useCallback(async () => {
    setLoadingKey("ctx", true);
    try {
      const res = await getActiveWeekContext();
      setActiveWeekCtx(res);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[VotingDashboard] loadActiveWeekCtx error:", e);
      setActiveWeekCtx(null);
    } finally {
      setLoadingKey("ctx", false);
    }
  }, [getActiveWeekContext, setLoadingKey]);

  const loadVotesOverTime = useCallback(async () => {
    setLoadingKey("chart", true);
    try {
      const res = await getVotesOverTime(14);
      setVotesOverTime(res || { categories: [], series: [{ name: "Votes", data: [] }] });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[VotingDashboard] loadVotesOverTime error:", e);
      setVotesOverTime({ categories: [], series: [{ name: "Votes", data: [] }] });
    } finally {
      setLoadingKey("chart", false);
    }
  }, [getVotesOverTime, setLoadingKey]);

  const loadLeaderboard = useCallback(async () => {
    setLoadingKey("leaderboard", true);
    try {
      const res = await getLeaderboard(10);
      setLeaderboardRows(res || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[VotingDashboard] loadLeaderboard error:", e);
      setLeaderboardRows([]);
    } finally {
      setLoadingKey("leaderboard", false);
    }
  }, [getLeaderboard, setLoadingKey]);

  const loadRecentVotes = useCallback(async () => {
    setLoadingKey("feed", true);
    try {
      const res = await getRecentVotes(20);
      setRecentVotes(res || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[VotingDashboard] loadRecentVotes error:", e);
      setRecentVotes([]);
    } finally {
      setLoadingKey("feed", false);
    }
  }, [getRecentVotes, setLoadingKey]);

  const loadWinners = useCallback(async () => {
    setLoadingKey("winners", true);
    try {
      const res = await getWinnersHistory(8);
      setWinners(res || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[VotingDashboard] loadWinners error:", e);
      setWinners([]);
    } finally {
      setLoadingKey("winners", false);
    }
  }, [getWinnersHistory, setLoadingKey]);

  // Simple recent apps table: flat select via fetch to apps table directly
  // We avoid joins and only show minimal columns for safety.
  const fetchRecentApps = useCallback(async () => {
    setLoadingKey("apps", true);
    try {
      // Lightweight fetch using Supabase client directly to avoid adding another hook file.
      // Import supabase inline to keep cohesion in this page.
      const { supabase } = await import("../lib/supabaseClient");
      const countPromise = supabase.from("apps").select("id", { count: "exact", head: true });
      const rowsPromise = supabase
        .from("apps")
        .select("id,name,created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      const [countRes, rowsRes] = await Promise.all([countPromise, rowsPromise]);
      const count = countRes?.count ?? 0;
      const rows = (rowsRes?.data || []).map((r) => ({
        id: r?.id,
        name: r?.name ?? `App ${r?.id ?? ""}`,
        created_at: r?.created_at ? new Date(r.created_at).toLocaleString() : "-",
      }));
      setAppsSummary({ count, rows });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[VotingDashboard] fetchRecentApps error:", e);
      setAppsSummary({ count: 0, rows: [] });
    } finally {
      setLoadingKey("apps", false);
    }
  }, [setLoadingKey]);

  // Bootstrap data
  useEffect(() => {
    loadKpis();
    loadActiveWeekCtx();
    loadVotesOverTime();
    loadLeaderboard();
    loadRecentVotes();
    loadWinners();
    fetchRecentApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscriptions
  useRealtimeVotingDashboard({
    onVotesInsert: () => {
      loadKpis();
      loadVotesOverTime();
      loadLeaderboard();
      loadRecentVotes();
      loadActiveWeekCtx();
    },
    onProfilesInsert: () => loadKpis(),
    onAppsInsert: () => {
      loadKpis();
      fetchRecentApps();
    },
    onContestWeekUpdate: () => {
      // Active week might have changed; refresh all dependent blocks.
      loadKpis();
      loadActiveWeekCtx();
      loadVotesOverTime();
      loadLeaderboard();
      loadRecentVotes();
    },
    onWinnersChange: () => loadWinners(),
  });

  // Sidebar items in UI
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

  // KPI tiles rendering — includes all 6 from getVotingKpis, but style suggests 4 in first row.
  const kpiTiles = (kpis || []).map((tile, idx) => (
    <KpiTile
      key={`${tile?.key || "kpi"}-${idx}`}
      icon={tile?.icon || "•"}
      label={tile?.label || "-"}
      value={tile?.value ?? "-"}
      accentVar={tile?.accentVar || "var(--primary)"}
      tintVar={tile?.tintVar || "var(--tile-blue)"}
      badge={tile?.badge || null}
    />
  ));

  const votesChartFooter = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
      <span>Updated {new Date().toLocaleTimeString()}</span>
      <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-green)", padding: "2px 8px", borderRadius: 999 }}>
        Recent Window
      </span>
    </div>
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
        {/* KPI Tiles Row (may render 4-6 tiles based on data) */}
        <section className="kpis" aria-label="Key performance indicators">
          {loading.kpis && kpiTiles.length === 0 ? (
            <>
              <KpiSkeleton label="Active Week" />
              <KpiSkeleton label="Votes Today" />
              <KpiSkeleton label="Total Votes" />
              <KpiSkeleton label="Top App" />
            </>
          ) : kpiTiles.length > 0 ? (
            kpiTiles
          ) : (
            <>
              <KpiSkeleton label="Active Week" />
              <KpiSkeleton label="Votes Today" />
              <KpiSkeleton label="Total Votes" />
              <KpiSkeleton label="Top App" />
            </>
          )}
        </section>

        {/* Recent Context + Votes per day chart */}
        <section className="row" aria-label="Recent context and chart">
          <div>
            {/* Keep ActiveWeekCard for context if week concept exists; otherwise can be ignored by users */}
            <ActiveWeekCard context={activeWeekCtx || {}} />
            <div style={{ height: 16 }} aria-hidden="true" />
            <LineChartCard
              title="Votes per day (Recent 14 days)"
              categories={votesOverTime?.categories || []}
              series={votesOverTime?.series || [{ name: "Votes", data: [] }]}
              legends={[{ label: "Votes", colorVar: "var(--chart-new)" }]}
              footer={votesChartFooter}
            />
          </div>

          <div>
            <LeaderboardCard title="Top Apps (Recent)" rows={leaderboardRows || []} />
            <div style={{ height: 16 }} aria-hidden="true" />
            <SimpleTablePanel
              title="Recent Apps"
              count={appsSummary?.count}
              rows={(appsSummary?.rows || []).slice(0, 8)}
              columns={[
                { key: "id", label: "ID" },
                { key: "name", label: "Name" },
                { key: "created_at", label: "Created" },
              ]}
              emptyMessage="No apps found."
              limitInfo="Latest 8 by created_at"
            />
          </div>
        </section>

        {/* Recent votes feed + Winners history + Campaign */}
        <section className="row" aria-label="Feeds and winners">
          <RecentVotesFeed title="Recent Votes (Latest)" items={recentVotes || []} />
          <div>
            <WinnersHistoryCard title="Winners History" items={winners || []} />
            <div style={{ height: 16 }} aria-hidden="true" />
            <CampaignBanner />
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * KpiSkeleton
 * Minimal KPI tile while loading.
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
 * CampaignBanner
 * Small marketing/announcement card matching design.
 */
function CampaignBanner() {
  return (
    <Card className="campaign-card" title="Marketing Campaign" actions={null}>
      <div style={{ color: "white" }}>
        <p style={{ margin: 0, opacity: 0.9 }}>Drive engagement with our latest voting campaign.</p>
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
            onClick={() => window?.alert?.("Campaign CTA clicked")}
          >
            Start Now
          </button>
        </div>
      </div>
    </Card>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './styles/tokens.css';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import KpiTile from './components/KpiTile';
import LineChartCard from './components/LineChartCard';
import LeaderboardCard from './components/LeaderboardCard';
import RecentVotesFeed from './components/RecentVotesFeed';
import WinnersHistoryCard from './components/WinnersHistoryCard';
import ActiveWeekCard from './components/ActiveWeekCard';
import SimpleTablePanel from './components/SimpleTablePanel';

// Voting-specific hooks (read-only)
import { useVotingQueries } from './hooks/useVotingQueries';
import { useRealtimeVotingDashboard } from './hooks/useRealtimeVotingDashboard';
import { useSimpleDashboard } from './hooks/useSimpleDashboard';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);

  // State slices for voting dashboard
  const [kpis, setKpis] = useState([]); // holds 6 KPI tiles per plan (incl. active week)
  const [activeWeek, setActiveWeek] = useState(null);
  const [votesOverTime, setVotesOverTime] = useState({ categories: [], series: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);
  const [winners, setWinners] = useState([]);
  const [weekContext, setWeekContext] = useState(null);

  const {
    getActiveWeek,
    getVotingKpis,
    getVotesOverTime,
    getLeaderboard,
    getRecentVotes,
    getWinnersHistory,
    getActiveWeekContext,
  } = useVotingQueries();

  // Simple dashboard (single-table only) summaries
  const {
    getProfilesSummary,
    getAppsSummary,
    getVotesSummary,
    getContestWeeksSummary,
    getContestWinnersSummary,
  } = useSimpleDashboard();

  // simple panels state
  const [profilesSummary, setProfilesSummary] = useState({ count: 0, rows: [] });
  const [appsSummary, setAppsSummary] = useState({ count: 0, rows: [] });
  const [votesSummary, setVotesSummary] = useState({ count: 0, rows: [] });
  const [weeksSummary, setWeeksSummary] = useState({ count: 0, rows: [] });
  const [winnersSummary, setWinnersSummary] = useState({ count: 0, rows: [] });

  // Apply theme to root for potential theming
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Bootstrap initial data
  const bootstrap = useCallback(async () => {
    try {
      const [
        { activeWeek: aw, kpis: kTiles },
        votTrend,
        lb,
        rv,
        wh,
        ctx,
        profSum,
        appSum,
        voteSum,
        weekSum,
        winSum,
      ] = await Promise.all([
        getVotingKpis(),
        getVotesOverTime(14),
        getLeaderboard(10),
        getRecentVotes(20),
        getWinnersHistory(8),
        getActiveWeekContext(),
        getProfilesSummary(10),
        getAppsSummary(10),
        getVotesSummary(10),
        getContestWeeksSummary(10),
        getContestWinnersSummary(10),
      ]);
      setActiveWeek(aw || null);
      setKpis(Array.isArray(kTiles) ? kTiles : []);
      setVotesOverTime(votTrend || { categories: [], series: [] });
      setLeaderboard(Array.isArray(lb) ? lb : []);
      setRecentVotes(Array.isArray(rv) ? rv : []);
      setWinners(Array.isArray(wh) ? wh : []);
      setWeekContext(ctx || null);

      setProfilesSummary(profSum || { count: 0, rows: [] });
      setAppsSummary(appSum || { count: 0, rows: [] });
      setVotesSummary(voteSum || { count: 0, rows: [] });
      setWeeksSummary(weekSum || { count: 0, rows: [] });
      setWinnersSummary(winSum || { count: 0, rows: [] });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[App] Voting bootstrap failed:', err);
    }
  }, [
    getVotingKpis,
    getVotesOverTime,
    getLeaderboard,
    getRecentVotes,
    getWinnersHistory,
    getActiveWeekContext,
    getProfilesSummary,
    getAppsSummary,
    getVotesSummary,
    getContestWeeksSummary,
    getContestWinnersSummary
  ]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      await bootstrap();
      if (canceled) return;
    })();
    return () => { canceled = true; };
  }, [bootstrap]);

  // Refreshers for realtime events
  const refreshVotesImpacts = useCallback(async () => {
    // votes INSERT affects: Votes Today, Total Votes, Top App, Votes Over Time, Leaderboard, Recent Votes, Active Week Context
    try {
      const [aw, votTrend, lb, rv, ctx] = await Promise.all([
        getActiveWeek(),
        getVotesOverTime(14),
        getLeaderboard(10),
        getRecentVotes(20),
        getActiveWeekContext(),
      ]);
      setActiveWeek(aw || null);
      // only update KPIs related to votes via getVotingKpis to keep consistency
      const { kpis: refreshedKpis } = await getVotingKpis();
      setKpis(Array.isArray(refreshedKpis) ? refreshedKpis : []);
      setVotesOverTime(votTrend || { categories: [], series: [] });
      setLeaderboard(Array.isArray(lb) ? lb : []);
      setRecentVotes(Array.isArray(rv) ? rv : []);
      setWeekContext(ctx || null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[App] refreshVotesImpacts error:', err);
    }
  }, [getActiveWeek, getVotesOverTime, getLeaderboard, getRecentVotes, getActiveWeekContext, getVotingKpis]);

  const refreshNewUsers = useCallback(async () => {
    try {
      const { kpis: refreshedKpis, activeWeek: aw } = await getVotingKpis();
      setActiveWeek(aw || null);
      setKpis(Array.isArray(refreshedKpis) ? refreshedKpis : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[App] refreshNewUsers error:', err);
    }
  }, [getVotingKpis]);

  const refreshAppsSubmitted = useCallback(async () => {
    try {
      const { kpis: refreshedKpis, activeWeek: aw } = await getVotingKpis();
      setActiveWeek(aw || null);
      setKpis(Array.isArray(refreshedKpis) ? refreshedKpis : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[App] refreshAppsSubmitted error:', err);
    }
  }, [getVotingKpis]);

  const handleContestWeekUpdate = useCallback(async () => {
    // If active week changed, re-bootstrap everything
    await bootstrap();
  }, [bootstrap]);

  const refreshWinners = useCallback(async () => {
    try {
      const wh = await getWinnersHistory(8);
      setWinners(Array.isArray(wh) ? wh : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[App] refreshWinners error:', err);
    }
  }, [getWinnersHistory]);

  // Realtime wiring for voting dashboard
  useRealtimeVotingDashboard({
    onVotesInsert: () => { refreshVotesImpacts(); },
    onProfilesInsert: () => { refreshNewUsers(); },
    onAppsInsert: () => { refreshAppsSubmitted(); },
    onContestWeekUpdate: () => { handleContestWeekUpdate(); },
    onWinnersChange: () => { refreshWinners(); },
  });

  const sidebarItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'apps', icon: '📦', label: 'Apps' },
    { key: 'votes', icon: '🗳️', label: 'Votes' },
    { key: 'profiles', icon: '👥', label: 'Profiles' },
    { key: 'winners', icon: '🏆', label: 'Winners' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <div className="app-shell" data-collapsed={collapsed ? 'true' : 'false'}>
        {/* Sidebar */}
        <Sidebar
          header={<div style={{ fontWeight: 700, padding: '8px 8px 12px 8px' }}>Logo</div>}
          items={sidebarItems}
          activeKey="dashboard"
          onItemClick={() => {}}
        />

        {/* Topbar */}
        <Topbar brand="Voting Dashboard" onToggleSidebar={() => setCollapsed((v) => !v)} />

        {/* Content */}
        <main className="content" role="main">
          {/* KPI Tiles */}
          <section className="kpis" aria-label="Key Performance Indicators">
            {kpis.map((k) => (
              <KpiTile
                key={k.key || k.label}
                icon={k.icon || '📈'}
                label={k.label}
                value={k.value}
                accentVar={k.accentVar || 'var(--primary)'}
                tintVar={k.tintVar || 'var(--tile-blue)'}
                badge={k.badge ? <span className="chip" style={{ fontSize: 12 }}>{k.badge}</span> : null}
              />
            ))}
          </section>

          {/* Row: Votes over time + Active Week context */}
          <section className="row" aria-label="Trend and context">
            <LineChartCard title="Votes per day (Active Week)" categories={votesOverTime.categories} series={votesOverTime.series} />
            <ActiveWeekCard context={weekContext} />
          </section>

          {/* Row: Leaderboard + Recent votes */}
          <section className="row" aria-label="Leaderboard and Recent Votes">
            <LeaderboardCard rows={leaderboard} />
            <RecentVotesFeed items={recentVotes} />
          </section>

          {/* Winners History */}
          <section aria-label="Winners History">
            <WinnersHistoryCard items={winners} />
          </section>

          {/* Simple Dashboard (Single-table only): counts + recent items */}
          <section className="row" aria-label="Database Tables Overview">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <SimpleTablePanel
                title="Profiles"
                count={profilesSummary.count}
                rows={profilesSummary.rows}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "username", label: "Username" },
                  { key: "created_at", label: "Created" },
                ]}
                emptyMessage="No data"
                limitInfo="Showing latest 10"
              />

              <SimpleTablePanel
                title="Apps"
                count={appsSummary.count}
                rows={appsSummary.rows}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "owner_id", label: "Owner ID" },
                  { key: "created_at", label: "Created" },
                ]}
                emptyMessage="No data"
                limitInfo="Showing latest 10"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <SimpleTablePanel
                title="Votes"
                count={votesSummary.count}
                rows={votesSummary.rows}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "app_id", label: "App ID" },
                  { key: "voter_id", label: "Voter ID" },
                  { key: "contest_week_id", label: "Week ID" },
                  { key: "created_at", label: "Created" },
                ]}
                emptyMessage="No data"
                limitInfo="Showing latest 10"
              />

              <SimpleTablePanel
                title="Contest Weeks"
                count={weeksSummary.count}
                rows={weeksSummary.rows}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "label", label: "Label" },
                  { key: "status", label: "Status" },
                  { key: "start_date", label: "Start" },
                  { key: "end_date", label: "End" },
                ]}
                emptyMessage="No data"
                limitInfo="Showing latest 10"
              />

              <SimpleTablePanel
                title="Contest Winners"
                count={winnersSummary.count}
                rows={winnersSummary.rows}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "contest_week_id", label: "Week ID" },
                  { key: "app_id", label: "App ID" },
                  { key: "total_votes", label: "Total Votes" },
                  { key: "decided_at", label: "Decided At" },
                ]}
                emptyMessage="No data"
                limitInfo="Showing latest 10"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

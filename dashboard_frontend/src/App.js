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

// Voting-specific hooks (read-only)
import { useVotingQueries } from './hooks/useVotingQueries';
import { useRealtimeVotingDashboard } from './hooks/useRealtimeVotingDashboard';

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

  // Apply theme to root for potential theming
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Bootstrap initial data
  const bootstrap = useCallback(async () => {
    try {
      const [{ activeWeek: aw, kpis: kTiles }, votTrend, lb, rv, wh, ctx] = await Promise.all([
        getVotingKpis(),
        getVotesOverTime(14),
        getLeaderboard(10),
        getRecentVotes(20),
        getWinnersHistory(8),
        getActiveWeekContext(),
      ]);
      setActiveWeek(aw || null);
      setKpis(Array.isArray(kTiles) ? kTiles : []);
      setVotesOverTime(votTrend || { categories: [], series: [] });
      setLeaderboard(Array.isArray(lb) ? lb : []);
      setRecentVotes(Array.isArray(rv) ? rv : []);
      setWinners(Array.isArray(wh) ? wh : []);
      setWeekContext(ctx || null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[App] Voting bootstrap failed:', err);
    }
  }, [getVotingKpis, getVotesOverTime, getLeaderboard, getRecentVotes, getWinnersHistory, getActiveWeekContext]);

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
        </main>
      </div>
    </div>
  );
}

export default App;

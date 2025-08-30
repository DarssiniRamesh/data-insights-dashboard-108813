import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './styles/tokens.css';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import KpiTile from './components/KpiTile';
import Card from './components/Card';
import LineChartCard from './components/LineChartCard';
import DoughnutCard from './components/DoughnutCard';
import ActivityFeed from './components/ActivityFeed';
import CampaignCard from './components/CampaignCard';

// Hooks (read-only)
import { useQueries } from './hooks/useQueries';
import { useRealtimeDashboard } from './hooks/useRealtimeDashboard';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);

  // Read-only dashboard state (snapshots updated via SELECT on signals)
  const [kpis, setKpis] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ categories: [], series: [] });
  const [tasksDistribution, setTasksDistribution] = useState({ percent_done: 0, segments: [] });
  const [activities, setActivities] = useState([]);
  const [campaign, setCampaign] = useState(null);

  // Fetchers
  const { getKpis, getVisitorStats, getTasksDistribution, getRecentActivities, getActiveCampaign } = useQueries();

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Initial SELECTs
  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      try {
        const [kpiTiles, stats, tasks, feed, camp] = await Promise.all([
          getKpis(),
          getVisitorStats(12),
          getTasksDistribution(),
          getRecentActivities(10),
          getActiveCampaign(),
        ]);

        if (isCancelled) return;
        setKpis(Array.isArray(kpiTiles) ? kpiTiles.map(t => ({ ...t })) : []);
        setVisitorStats(stats && typeof stats === 'object'
          ? { categories: [...(stats.categories || [])], series: [...(stats.series || [])] }
          : { categories: [], series: [] });
        setTasksDistribution(tasks && typeof tasks === 'object'
          ? { percent_done: tasks.percent_done || 0, segments: [...(tasks.segments || [])] }
          : { percent_done: 0, segments: [] });
        setActivities(Array.isArray(feed) ? feed.map(i => ({ ...i })) : []);
        setCampaign(camp ? { ...camp } : null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[App] Bootstrap SELECTs failed:', err);
      }
    }

    bootstrap();
    return () => { isCancelled = true; };
  }, [getKpis, getVisitorStats, getTasksDistribution, getRecentActivities, getActiveCampaign]);

  // Realtime subscriptions -> trigger read-only refreshes or prepend new items
  const refreshKpis = useCallback(async () => {
    const tiles = await getKpis();
    setKpis(Array.isArray(tiles) ? tiles.map(t => ({ ...t })) : []);
  }, [getKpis]);

  const refreshVisitorStats = useCallback(async () => {
    const stats = await getVisitorStats(12);
    setVisitorStats(stats && typeof stats === 'object'
      ? { categories: [...(stats.categories || [])], series: [...(stats.series || [])] }
      : { categories: [], series: [] });
  }, [getVisitorStats]);

  const refreshTasks = useCallback(async () => {
    const tasks = await getTasksDistribution();
    setTasksDistribution(tasks && typeof tasks === 'object'
      ? { percent_done: tasks.percent_done || 0, segments: [...(tasks.segments || [])] }
      : { percent_done: 0, segments: [] });
  }, [getTasksDistribution]);

  const prependActivity = useCallback(async () => {
    // Re-fetch recent activities to keep ordering and joins consistent (read-only)
    const feed = await getRecentActivities(10);
    setActivities(Array.isArray(feed) ? feed.map(i => ({ ...i })) : []);
  }, [getRecentActivities]);

  // Projects update may impact the KPI "Projects In Progress"
  const handleProjectUpdate = useCallback(async () => {
    await refreshKpis();
  }, [refreshKpis]);

  // Optional: campaign might change due to external status updates; refresh on any KPI-related signal
  const refreshCampaign = useCallback(async () => {
    const camp = await getActiveCampaign();
    setCampaign(camp ? { ...camp } : null);
  }, [getActiveCampaign]);

  useRealtimeDashboard({
    onSalesInsert: () => { refreshKpis(); refreshCampaign(); },
    onCustomersInsert: () => { refreshKpis(); },
    onApplicationsInsert: () => { refreshKpis(); },
    onProjectsUpdate: () => { handleProjectUpdate(); },
    onVisitsInsert: () => { refreshVisitorStats(); },
    onTasksChange: () => { refreshTasks(); },
    onActivitiesInsert: () => { prependActivity(); },
  });

  const sidebarItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'users', icon: '👥', label: 'Users' },
    { key: 'mail', icon: '📧', label: 'Mail' },
    { key: 'messages', icon: '💬', label: 'Messages' },
    { key: 'analytics', icon: '📊', label: 'Analytics' },
    { key: 'sales', icon: '🛒', label: 'Sales' },
    { key: 'posts', icon: '📰', label: 'Posts' },
    { key: 'tasks', icon: '✅', label: 'Tasks' },
    { key: 'reports', icon: '📄', label: 'Reports' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
    { key: 'support', icon: '🆘', label: 'Support' },
    { key: 'logout', icon: '🚪', label: 'Logout' },
  ];

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        style={{ position: 'fixed', zIndex: 5 }}
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
        <Topbar brand="Admin page" onToggleSidebar={() => setCollapsed((v) => !v)} />

        {/* Content */}
        <main className="content" role="main">
          {/* KPI Tiles */}
          <section className="kpis" aria-label="Key Performance Indicators">
            {kpis.map((k) => (
              <KpiTile
                key={k.label}
                icon={k.icon || '📈'}
                label={k.label}
                value={k.value}
                accentVar={k.accentVar || 'var(--primary)'}
                tintVar={k.tintVar || 'var(--tile-blue)'}
              />
            ))}
          </section>

          {/* Row: Line Chart + Tasks */}
          <section className="row" aria-label="Charts">
            <LineChartCard title="Visitor statistics" categories={visitorStats.categories} series={visitorStats.series} />
            <DoughnutCard title="Tasks" valueLabel={`${tasksDistribution.percent_done || 0}%`} segments={tasksDistribution.segments || []} />
          </section>

          {/* Row: Activity + Campaign */}
          <section className="row" aria-label="Activity and Campaign">
            <ActivityFeed title="Activity" items={activities} />
            <CampaignCard
              title={campaign?.name || "Marketing Campaign"}
              description={campaign ? `Status: ${campaign.status}` : "Drive engagement with our latest campaign."}
              ctaText={campaign?.cta || "Start Now"}
              onCtaClick={() => {}}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

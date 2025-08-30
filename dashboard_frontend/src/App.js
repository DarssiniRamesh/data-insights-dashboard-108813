import React, { useState, useEffect } from 'react';
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

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

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

  // Placeholder data to be replaced by hooks/useQueries
  const kpis = [
    { icon: '🛍️', label: 'Sales', value: 129, accentVar: 'var(--accent-pink)', tintVar: 'var(--tile-pink)' },
    { icon: '👥', label: 'New Customers', value: 23, accentVar: 'var(--accent-orange)', tintVar: 'var(--tile-peach)' },
    { icon: '☁️', label: 'Projects in Progress', value: 89, accentVar: 'var(--primary)', tintVar: 'var(--tile-blue)' },
    { icon: '📥', label: 'New Applications', value: 121, accentVar: 'var(--accent-green)', tintVar: 'var(--tile-mint)' },
  ];

  const visitorStats = {
    categories: [],
    series: [],
  };

  const tasksDistribution = {
    percent_done: 60,
    segments: [
      { key: 'done', value: 60, colorVar: 'var(--success)', label: 'Done' },
      { key: 'in_progress', value: 25, colorVar: 'var(--warning)', label: 'In progress' },
      { key: 'todo', value: 15, colorVar: 'var(--danger)', label: 'Todo' },
    ],
  };

  const activities = [
    {
      id: 1,
      message: 'Pushed changes to repository dashboard-ui',
      status: 'pending',
      created_at: new Date().toISOString(),
      author: { name: 'Jane Cooper', avatar_url: '' },
    },
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
                icon={k.icon}
                label={k.label}
                value={k.value}
                accentVar={k.accentVar}
                tintVar={k.tintVar}
              />
            ))}
          </section>

          {/* Row: Line Chart + Tasks */}
          <section className="row" aria-label="Charts">
            <LineChartCard title="Visitor statistics" categories={visitorStats.categories} series={visitorStats.series} />
            <DoughnutCard title="Tasks" valueLabel={`${tasksDistribution.percent_done}%`} segments={tasksDistribution.segments} />
          </section>

          {/* Row: Activity + Campaign */}
          <section className="row" aria-label="Activity and Campaign">
            <ActivityFeed title="Activity" items={activities} />
            <CampaignCard />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

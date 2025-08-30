import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import './styles/tokens.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

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
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ fontWeight: 700, padding: '8px 8px 12px 8px' }}>Logo</div>
          <nav>
            <ul className="nav-list">
              <li><button className="nav-item active" type="button"><span>🏠</span><span>Dashboard</span></button></li>
              <li><button className="nav-item" type="button"><span>👥</span><span>Users</span></button></li>
              <li><button className="nav-item" type="button"><span>📧</span><span>Mail</span></button></li>
              <li><button className="nav-item" type="button"><span>💬</span><span>Messages</span></button></li>
              <li><button className="nav-item" type="button"><span>📊</span><span>Analytics</span></button></li>
              <li><button className="nav-item" type="button"><span>🛒</span><span>Sales</span></button></li>
              <li><button className="nav-item" type="button"><span>📰</span><span>Posts</span></button></li>
              <li><button className="nav-item" type="button"><span>✅</span><span>Tasks</span></button></li>
              <li><button className="nav-item" type="button"><span>📄</span><span>Reports</span></button></li>
              <li><button className="nav-item" type="button"><span>⚙️</span><span>Settings</span></button></li>
              <li><button className="nav-item" type="button"><span>🆘</span><span>Support</span></button></li>
              <li><button className="nav-item" type="button"><span>🚪</span><span>Logout</span></button></li>
            </ul>
          </nav>
        </aside>

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="icon-btn" type="button" aria-label="Toggle sidebar">☰</button>
            <strong style={{ fontSize: 20, color: 'var(--text-strong)' }}>Admin page</strong>
          </div>
          <div className="topbar-right" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost" type="button">Create new</button>
            <button className="icon-btn" type="button" aria-label="Notifications">🔔</button>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-hover)', display: 'inline-block' }} />
              <span style={{ fontSize: 14 }}>John</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          <section className="kpis">
            <div className="kpi-tile" style={{ background: 'var(--surface)' }}>
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: 'var(--tile-pink)', color: 'var(--accent-pink)' }}>🛍️</div>
                <span />
              </div>
              <div className="kpi-label">Sales</div>
              <div className="kpi-value">129</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: 'var(--tile-peach)', color: 'var(--accent-orange)' }}>👥</div>
                <span />
              </div>
              <div className="kpi-label">New Customers</div>
              <div className="kpi-value">23</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: 'var(--tile-blue)', color: 'var(--primary)' }}>☁️</div>
                <span />
              </div>
              <div className="kpi-label">Projects in Progress</div>
              <div className="kpi-value">89</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: 'var(--tile-mint)', color: 'var(--accent-green)' }}>📥</div>
                <span />
              </div>
              <div className="kpi-label">New Applications</div>
              <div className="kpi-value">121</div>
            </div>
          </section>

          <section className="row">
            <article className="card">
              <div className="card-header">
                <div className="card-title">Visitor statistics</div>
                <div className="legend">
                  <span className="legend-dot" style={{ background: 'var(--chart-new)' }} />
                  <span style={{ fontSize: 12 }}>New</span>
                  <span style={{ width: 12 }} />
                  <span className="legend-dot" style={{ background: 'var(--chart-returning)' }} />
                  <span style={{ fontSize: 12 }}>Returning</span>
                </div>
              </div>
              <div style={{ height: 260, border: '1px dashed var(--surface-border)', borderRadius: 8, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                Chart placeholder
              </div>
            </article>
            <article className="card">
              <div className="card-header">
                <div className="card-title">Tasks</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', justifyItems: 'center', gap: 12 }}>
                <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'conic-gradient(var(--success) 0% 60%, var(--ring-bg) 60% 100%)', display: 'grid', placeItems: 'center' }}>
                  <div style={{ width: 130, height: 130, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px var(--surface-border)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>60%</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>complete</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 8, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="legend-dot" style={{ background: 'var(--success)' }} />
                    <span style={{ fontSize: 13 }}>Done</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>60</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="legend-dot" style={{ background: 'var(--warning)' }} />
                    <span style={{ fontSize: 13 }}>In progress</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>25</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="legend-dot" style={{ background: 'var(--danger)' }} />
                    <span style={{ fontSize: 13 }}>Todo</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>15</span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="row">
            <article className="card">
              <div className="card-header">
                <div className="card-title">Activity</div>
              </div>
              <div className="feed-list">
                <div className="feed-item">
                  <div><span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-hover)', display: 'inline-block' }} /></div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-strong)' }}>Jane Cooper</div>
                    <div style={{ marginTop: 4 }}>Pushed changes to repository dashboard-ui</div>
                    <div className="feed-meta" style={{ marginTop: 4 }}>Today, 10:12 AM · pending</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn" type="button">Approve</button>
                      <button className="btn btn-secondary" type="button" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            <article className="card campaign-card">
              <div className="card-header">
                <div className="card-title">Marketing Campaign</div>
              </div>
              <div style={{ color: 'white' }}>
                <p style={{ margin: 0, opacity: 0.9 }}>Drive engagement with our latest campaign.</p>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-ghost" type="button">Start Now</button>
                </div>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

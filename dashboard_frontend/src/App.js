import React from 'react';
import './styles/tokens.css';
import SimpleAppsDashboard from './pages/SimpleAppsDashboard';

/**
 * PUBLIC_INTERFACE
 * App
 * Entrypoint rendering the SimpleAppsDashboard as the main content.
 * This minimal shell can be expanded later with Sidebar/Topbar if needed.
 */
function App() {
  return (
    <div className="app-shell">
      {/* Optional Sidebar placeholder to match layout structure */}
      <aside className="sidebar" aria-label="Sidebar">
        <div className="sidebar-header" style={{ fontWeight: 700, color: 'var(--text-strong)' }}>
          Apps Dashboard
        </div>
        <nav>
          <ul className="nav-list" role="list">
            <li>
              <button type="button" className="nav-item active" aria-current="page">
                <span aria-hidden="true">📊</span>
                <span>Overview</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Simple topbar */}
      <header className="topbar" role="banner">
        <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: '20px', color: 'var(--text-strong)' }}>Dashboard</strong>
        </div>
        <div className="topbar-right" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" type="button">Create new</button>
          <button className="icon-btn" type="button" aria-label="Notifications" title="Notifications">🔔</button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-hover)', display: 'inline-block' }}
              aria-hidden="true"
            />
            <span style={{ fontSize: '14px', color: 'var(--text)' }}>Guest</span>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <SimpleAppsDashboard />
    </div>
  );
}

export default App;

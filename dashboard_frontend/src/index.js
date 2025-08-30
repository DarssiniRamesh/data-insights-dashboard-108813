import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// For now, route everything to Dashboard via App.
// In future, integrate react-router and add routes for other pages.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

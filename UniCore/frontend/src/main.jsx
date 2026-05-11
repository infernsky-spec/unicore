import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('[EduBridge] Initializing app...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('[EduBridge] App rendered successfully');
} catch (error) {
  console.error('[EduBridge] Fatal error:', error);
  document.getElementById('root').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f1f5f9;font-family:Inter,sans-serif">
      <div style="text-align:center;background:white;padding:30px;border-radius:8px;max-width:500px">
        <h1 style="color:#dc2626;margin-bottom:12px;font-size:18px;font-weight:600">Error</h1>
        <p style="color:#64748b;margin-bottom:16px;font-size:14px">${error.message}</p>
        <button onclick="window.location.reload()" style="background:#2563eb;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500">Refresh</button>
      </div>
    </div>
  `;
}

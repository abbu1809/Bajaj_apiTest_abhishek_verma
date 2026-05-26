// StatsStrip.jsx - shows totals per status and breached count
// sits at the top of the page, fetched from /tickets/stats

import React from "react";
import "./StatsStrip.css";

function StatsStrip({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-strip">
      <div className="stat-item">
        <span className="stat-label">Open</span>
        <span className="stat-value">{stats.byStatus.open}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">In Progress</span>
        <span className="stat-value">{stats.byStatus.in_progress}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Resolved</span>
        <span className="stat-value">{stats.byStatus.resolved}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Closed</span>
        <span className="stat-value">{stats.byStatus.closed}</span>
      </div>
      <div className="stat-item stat-breached">
        <span className="stat-label">SLA Breached (open)</span>
        <span className="stat-value">{stats.breachedOpen}</span>
      </div>
    </div>
  );
}

export default StatsStrip;

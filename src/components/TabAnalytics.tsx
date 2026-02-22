import React from 'react';
import { useTabContext } from '../context/TabContext';
import { ACTIVE_THRESHOLD_MS, FORGOTTEN_THRESHOLD_MS } from '../utils/constants';

export const TabAnalytics: React.FC = () => {
  const { tabs, loading, error } = useTabContext();

  // Define time thresholds
  const fiveDaysAgo = Date.now() - ACTIVE_THRESHOLD_MS;
  const thirtyDaysAgo = Date.now() - FORGOTTEN_THRESHOLD_MS;
  
  // Categorize tabs
  const activeTabs = tabs.filter(tab => tab.lastAccessed >= fiveDaysAgo);
  const recentlyInactiveTabs = tabs.filter(tab => 
    tab.lastAccessed < fiveDaysAgo && tab.lastAccessed >= thirtyDaysAgo
  );
  const forgottenTabs = tabs.filter(tab => tab.lastAccessed < thirtyDaysAgo);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="analytics-wrapper">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">{tabs?.length || 0}</div>
            <div className="stat-label">Total Tabs</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{activeTabs.length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{recentlyInactiveTabs.length}</div>
            <div className="stat-label">Inactive</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{forgottenTabs.length}</div>
            <div className="stat-label">Forgotten</div>
          </div>
        </div>
      )}
    </div>
  );
}; 
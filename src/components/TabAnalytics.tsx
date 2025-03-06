import React from 'react';
import { useTabAnalytics } from '../hooks/useTabAnalytics';

export const TabAnalytics: React.FC = () => {
  const { tabs, loading, error } = useTabAnalytics();

  // Calculate forgotten tabs count
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const forgottenTabsCount = tabs.filter(tab => tab.lastAccessed < thirtyDaysAgo).length;

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
            <div className="stat-value">
              {tabs?.filter(tab => tab.groupId !== -1).length || 0}
            </div>
            <div className="stat-label">In Groups</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{forgottenTabsCount}</div>
            <div className="stat-label">Forgotten</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {tabs.length - forgottenTabsCount}
            </div>
            <div className="stat-label">Recent</div>
          </div>
        </div>
      )}
    </div>
  );
}; 
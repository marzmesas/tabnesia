import React from 'react';
import { useTabContext } from '../context/TabContext';
import { ACTIVE_THRESHOLD_MS, FORGOTTEN_THRESHOLD_MS } from '../utils/constants';
import { findDuplicates } from '../utils/urlUtils';

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

  const duplicateGroups = findDuplicates(tabs);
  const duplicateCount = duplicateGroups.reduce(
    (sum, group) => sum + group.tabs.length - 1, 0
  );

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="analytics-wrapper">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={`stats-container${duplicateCount > 0 ? ' stats-container--with-duplicates' : ''}`}>
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
          {duplicateCount > 0 && (
            <div className="stat-item stat-item--duplicates">
              <div className="stat-value">{duplicateCount}</div>
              <div className="stat-label">Duplicates</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

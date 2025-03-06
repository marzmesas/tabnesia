import React from 'react';
import { useTabAnalytics } from '../hooks/useTabAnalytics';

export const TabAnalytics: React.FC = () => {
  const { tabs, loading, error } = useTabAnalytics();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
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
        </div>
      )}
    </div>
  );
}; 
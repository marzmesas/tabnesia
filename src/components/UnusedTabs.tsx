import React from 'react';
import { useTabAnalytics } from '../hooks/useTabAnalytics';

export const UnusedTabs: React.FC = () => {
  const { tabs, loading, error, closeTab } = useTabAnalytics();
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Recently Inactive Tabs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {(tabs || [])
            .sort((a, b) => a.lastAccessed - b.lastAccessed)
            .slice(0, 5)
            .map(tab => (
              <li key={tab.id}>
                <span>{tab.title}</span>
                <button onClick={() => closeTab(tab.id)}>Close</button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}; 
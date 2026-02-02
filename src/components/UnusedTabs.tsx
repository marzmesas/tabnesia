import React, { useState } from 'react';
import { useTabContext } from '../context/TabContext';
import { TabDetails } from './TabDetails';
import { formatTime } from '../utils/formatTime';

export const UnusedTabs: React.FC = () => {
  const { tabs, loading, error, closeTab } = useTabContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Define time thresholds
  const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const selectedTabData = selectedTab !== null 
    ? tabs.find(tab => tab.id === selectedTab)
    : null;

  if (selectedTabData) {
    return (
      <TabDetails
        tab={selectedTabData}
        onClose={(tabId) => {
          closeTab(tabId);
          setSelectedTab(null);
        }}
        onBack={() => setSelectedTab(null)}
      />
    );
  }

  // Filter tabs for this section - between 5 and 30 days old
  const recentlyInactiveTabs = (tabs || [])
    .filter(tab => tab.lastAccessed < fiveDaysAgo && tab.lastAccessed >= thirtyDaysAgo)
    .sort((a, b) => a.lastAccessed - b.lastAccessed);

  return (
    <div className="section-container">
      <div 
        className="section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>Recently Inactive Tabs</h2>
      </div>
      <p className="section-description">
        Tabs you last visited between 5 and 30 days ago. You might still remember what they are!
      </p>
      
      {isExpanded && (
        loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tab data...</p>
          </div>
        ) : (
          <ul>
            {recentlyInactiveTabs.map(tab => (
              <li key={tab.id}>
                <div className="tab-list-item">
                  <span className="tab-title">{tab.title}</span>
                  <span className="tab-time">{formatTime(tab.lastAccessed)}</span>
                </div>
                <button onClick={() => setSelectedTab(tab.id)}>Details</button>
              </li>
            ))}
            {recentlyInactiveTabs.length === 0 && (
              <p>No recently inactive tabs found</p>
            )}
          </ul>
        )
      )}
    </div>
  );
}; 
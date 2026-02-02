import React, { useState } from 'react';
import { useTabContext } from '../context/TabContext';
import { TabDetails } from './TabDetails';
import { formatTime } from '../utils/formatTime';

export const ActiveTabs: React.FC = () => {
  const { tabs, loading, error, closeTab } = useTabContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Define time threshold
  const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);

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

  // Filter tabs for active tabs - less than 5 days old
  const activeTabs = (tabs || [])
    .filter(tab => tab.lastAccessed >= fiveDaysAgo)
    .sort((a, b) => b.lastAccessed - a.lastAccessed); // Most recent first

  return (
    <div className="section-container">
      <div 
        className="section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>Active Tabs</h2>
      </div>
      <p className="section-description">
        Tabs you've visited in the last 5 days
      </p>
      
      {isExpanded && (
        loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tab data...</p>
          </div>
        ) : (
          <ul>
            {activeTabs.map(tab => (
              <li key={tab.id}>
                <div className="tab-list-item">
                  <span className="tab-title">{tab.title}</span>
                  <span className="tab-time">{formatTime(tab.lastAccessed)}</span>
                </div>
                <button onClick={() => setSelectedTab(tab.id)}>Details</button>
              </li>
            ))}
            {activeTabs.length === 0 && (
              <p>No active tabs found</p>
            )}
          </ul>
        )
      )}
    </div>
  );
}; 
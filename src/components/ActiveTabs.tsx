import React, { useState } from 'react';
import { useTabContext } from '../context/TabContext';
import { useSearchContext } from '../context/SearchContext';
import { TabDetails } from './TabDetails';
import { formatTime } from '../utils/formatTime';
import { ACTIVE_THRESHOLD_MS } from '../utils/constants';

export const ActiveTabs: React.FC = () => {
  const { tabs, loading, error, closeTab } = useTabContext();
  const { searchQuery } = useSearchContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);

  // Define time threshold
  const fiveDaysAgo = Date.now() - ACTIVE_THRESHOLD_MS;

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
  const searchLower = searchQuery.toLowerCase();
  const activeTabs = (tabs || [])
    .filter(tab => tab.lastAccessed >= fiveDaysAgo)
    .filter(tab => !searchQuery ||
      tab.title.toLowerCase().includes(searchLower) ||
      tab.url.toLowerCase().includes(searchLower))
    .sort((a, b) => b.lastAccessed - a.lastAccessed); // Most recent first

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tab data...</p>
      </div>
    );
  }

  return (
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
  );
};

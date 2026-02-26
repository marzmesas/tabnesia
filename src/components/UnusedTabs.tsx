import React, { useState, useEffect } from 'react';
import { useTabContext } from '../context/TabContext';
import { useSearchContext } from '../context/SearchContext';
import { TabDetails } from './TabDetails';
import { formatTime } from '../utils/formatTime';
import { ACTIVE_THRESHOLD_MS, FORGOTTEN_THRESHOLD_MS } from '../utils/constants';

interface UnusedTabsProps {
  onDetailView: (showing: boolean) => void;
}

export const UnusedTabs: React.FC<UnusedTabsProps> = ({ onDetailView }) => {
  const { tabs, loading, error, closeTab } = useTabContext();
  const { searchQuery } = useSearchContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);

  const isDetail = selectedTab !== null && tabs.some(tab => tab.id === selectedTab);
  useEffect(() => { onDetailView(isDetail); }, [isDetail, onDetailView]);

  // Define time thresholds
  const fiveDaysAgo = Date.now() - ACTIVE_THRESHOLD_MS;
  const thirtyDaysAgo = Date.now() - FORGOTTEN_THRESHOLD_MS;

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
  const searchLower = searchQuery.toLowerCase();
  const recentlyInactiveTabs = (tabs || [])
    .filter(tab => tab.lastAccessed < fiveDaysAgo && tab.lastAccessed >= thirtyDaysAgo)
    .filter(tab => !searchQuery ||
      tab.title.toLowerCase().includes(searchLower) ||
      tab.url.toLowerCase().includes(searchLower))
    .sort((a, b) => b.lastAccessed - a.lastAccessed);

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
      {recentlyInactiveTabs.map(tab => (
        <li key={tab.id}>
          <div className="tab-list-item">
            <span className="tab-title">
              {tab.title}
              {tab.discarded && <span className="discarded-badge">Discarded</span>}
            </span>
            <span className="tab-time">{formatTime(tab.lastAccessed)}</span>
          </div>
          <button onClick={() => setSelectedTab(tab.id)}>Details</button>
        </li>
      ))}
      {recentlyInactiveTabs.length === 0 && (
        <p>No recently inactive tabs found</p>
      )}
    </ul>
  );
};

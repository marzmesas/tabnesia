import React, { useState } from 'react';
import { useTabContext } from '../context/TabContext';
import { TabDetails } from './TabDetails';
import { getColorVariables } from '../utils/colors';

export const OldTabs: React.FC = () => {
  const { tabs, loading, error, closeTab } = useTabContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Filter for tabs older than 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const oldTabs = tabs.filter(tab => tab.lastAccessed < thirtyDaysAgo);
  
  return (
    <div className="section-container">
      <div 
        className="section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>Forgotten Tabs</h2>
      </div>
      <p className="section-description">
        Tabs that you have not opened for more than 30 days. Maybe it's time to let go...
      </p>
      
      {isExpanded && (
        loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tab data...</p>
          </div>
        ) : (
          oldTabs.length === 0 ? (
            <p>No forgotten tabs found</p>
          ) : (
            <ul>
              {oldTabs.map(tab => (
                <li key={tab.id}>
                  <div className="tab-list-item">
                    <span className="tab-title">{tab.title}</span>
                    {tab.groupDetails && (
                      <span 
                        className="tab-group-indicator"
                        style={{ 
                          backgroundColor: getColorVariables(tab.groupDetails.color).bg 
                        }}
                      >
                        {tab.groupDetails.name}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setSelectedTab(tab.id)}>Details</button>
                </li>
              ))}
            </ul>
          )
        )
      )}
    </div>
  );
}; 
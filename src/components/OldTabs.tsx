import React, { useState } from 'react';
import { useTabAnalytics } from '../hooks/useTabAnalytics';
import { TabDetails } from './TabDetails';

export const OldTabs: React.FC = () => {
  const { tabs, loading, error, closeTab } = useTabAnalytics();
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
        These tabs haven't been opened for more than 30 days
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

// Helper function to get color variables
const getColorVariables = (color: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    grey: { bg: '#707280', text: '#ffffff' },
    blue: { bg: '#4b87ff', text: '#ffffff' },
    red: { bg: '#ff4b4b', text: '#ffffff' },
    yellow: { bg: '#ffbf00', text: '#000000' },
    green: { bg: '#4bff4b', text: '#000000' },
    pink: { bg: '#ff4bff', text: '#ffffff' },
    purple: { bg: '#8f4bff', text: '#ffffff' },
    cyan: { bg: '#4bffff', text: '#000000' },
  };

  return colors[color] || { bg: '#707280', text: '#ffffff' };
}; 
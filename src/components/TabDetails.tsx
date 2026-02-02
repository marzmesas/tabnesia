import React from 'react';
import type { TabAnalytics } from '../hooks/useTabAnalytics';
import { GroupBadge } from './GroupBadge';

interface TabDetailsProps {
  tab: TabAnalytics;
  onClose: (tabId: number) => void;
  onBack: () => void;
}

export const TabDetails: React.FC<TabDetailsProps> = ({ tab, onClose, onBack }) => {
  // Store the timestamp when component mounts to prevent it from changing
  const [timestamp] = React.useState(tab.lastAccessed);

  const formatLastAccessed = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      const minutes = Math.floor(diffInMinutes);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) { // less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days < 30) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  return (
    <div className="tab-details">
      <button className="back-button" onClick={onBack}>← Back</button>
      <h2>{tab.title}</h2>
      <div className="details-container">
        <div className="detail-item">
          <span className="detail-label">Group</span>
          <span className="detail-value">
            {tab.groupDetails ? (
              <GroupBadge 
                name={tab.groupDetails.name} 
                color={tab.groupDetails.color}
              />
            ) : (
              <span className="no-group">No Group</span>
            )}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Last Visited</span>
          <span className="detail-value">{formatLastAccessed(timestamp)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">URL</span>
          <span className="detail-value url">{tab.url}</span>
        </div>
      </div>
      <button className="close-button" onClick={() => onClose(tab.id)}>
        Close Tab
      </button>
    </div>
  );
}; 
import React, { useState } from 'react';
import type { TabAnalytics } from '../context/TabContext';
import { GroupBadge } from './GroupBadge';
import { ConfirmDialog } from './ConfirmDialog';

interface TabDetailsProps {
  tab: TabAnalytics;
  onClose: (tabId: number) => void;
  onBack: () => void;
}

export const TabDetails: React.FC<TabDetailsProps> = ({ tab, onClose, onBack }) => {
  const [timestamp] = useState(tab.lastAccessed);
  const [showConfirm, setShowConfirm] = useState(false);

  const formatLastAccessed = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      const minutes = Math.floor(diffInMinutes);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
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

  const handleCloseClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onClose(tab.id);
  };

  return (
    <div className="tab-details">
      <ConfirmDialog
        isOpen={showConfirm}
        title="Close Tab?"
        message={`Are you sure you want to close "${tab.title.substring(0, 50)}${tab.title.length > 50 ? '...' : ''}"?`}
        confirmLabel="Close"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

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
      <button className="close-button" onClick={handleCloseClick}>
        Close Tab
      </button>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTabContext } from '../context/TabContext';
import { useSearchContext } from '../context/SearchContext';
import { TabDetails } from './TabDetails';
import { ConfirmDialog } from './ConfirmDialog';
import { getColorVariables } from '../utils/colors';
import { FORGOTTEN_THRESHOLD_MS } from '../utils/constants';

interface OldTabsProps {
  onDetailView: (showing: boolean) => void;
}

export const OldTabs: React.FC<OldTabsProps> = ({ onDetailView }) => {
  const { tabs, loading, error, closeTab, closeMultipleTabs } = useTabContext();
  const { searchQuery } = useSearchContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [selectedForClose, setSelectedForClose] = useState<Set<number>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'selected' | 'all';
    count: number;
  }>({ isOpen: false, type: 'selected', count: 0 });

  const isDetail = selectedTab !== null && tabs.some(tab => tab.id === selectedTab);
  useEffect(() => { onDetailView(isDetail); }, [isDetail, onDetailView]);

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
  const thirtyDaysAgo = Date.now() - FORGOTTEN_THRESHOLD_MS;
  const searchLower = searchQuery.toLowerCase();
  const oldTabs = tabs
    .filter(tab => tab.lastAccessed < thirtyDaysAgo)
    .filter(tab => !searchQuery ||
      tab.title.toLowerCase().includes(searchLower) ||
      tab.url.toLowerCase().includes(searchLower))
    .sort((a, b) => b.lastAccessed - a.lastAccessed);

  const toggleTabSelection = (tabId: number) => {
    const newSelection = new Set(selectedForClose);
    if (newSelection.has(tabId)) {
      newSelection.delete(tabId);
    } else {
      newSelection.add(tabId);
    }
    setSelectedForClose(newSelection);
  };

  const selectAll = () => {
    setSelectedForClose(new Set(oldTabs.map(tab => tab.id)));
  };

  const selectNone = () => {
    setSelectedForClose(new Set());
  };

  const handleCloseSelectedClick = () => {
    if (selectedForClose.size === 0) return;
    setConfirmDialog({
      isOpen: true,
      type: 'selected',
      count: selectedForClose.size,
    });
  };

  const handleCloseAllClick = () => {
    if (oldTabs.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      type: 'all',
      count: oldTabs.length,
    });
  };

  const handleConfirmClose = async () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    setIsClosing(true);

    if (confirmDialog.type === 'selected') {
      await closeMultipleTabs(Array.from(selectedForClose));
    } else {
      await closeMultipleTabs(oldTabs.map(tab => tab.id));
    }

    setSelectedForClose(new Set());
    setIsClosing(false);
  };

  const handleCancelClose = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tab data...</p>
      </div>
    );
  }

  if (oldTabs.length === 0) {
    return <p>No forgotten tabs found</p>;
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'all' ? 'Close All Tabs?' : 'Close Selected Tabs?'}
        message={`Are you sure you want to close ${confirmDialog.count} tab${confirmDialog.count > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Close"
        cancelLabel="Cancel"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />

      <div className="batch-actions">
        <div className="selection-buttons">
          <button
            className="select-btn"
            onClick={selectAll}
            disabled={isClosing}
          >
            Select All
          </button>
          <button
            className="select-btn"
            onClick={selectNone}
            disabled={isClosing || selectedForClose.size === 0}
          >
            Clear
          </button>
        </div>
        <div className="close-buttons">
          <button
            className="close-selected-btn"
            onClick={handleCloseSelectedClick}
            disabled={isClosing || selectedForClose.size === 0}
          >
            {isClosing ? 'Closing...' : `Close Selected (${selectedForClose.size})`}
          </button>
          <button
            className="close-all-btn"
            onClick={handleCloseAllClick}
            disabled={isClosing}
          >
            Close All ({oldTabs.length})
          </button>
        </div>
      </div>
      <ul>
        {oldTabs.map(tab => (
          <li key={tab.id} className={selectedForClose.has(tab.id) ? 'selected' : ''}>
            <div className="tab-list-item">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedForClose.has(tab.id)}
                  onChange={() => toggleTabSelection(tab.id)}
                  disabled={isClosing}
                />
                <span className="checkmark"></span>
              </label>
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
    </>
  );
};

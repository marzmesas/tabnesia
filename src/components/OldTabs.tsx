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
  const { tabs, loading, error, closeTab, closeMultipleTabs, discardMultipleTabs } = useTabContext();
  const { searchQuery } = useSearchContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [selectedForClose, setSelectedForClose] = useState<Set<number>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'selected' | 'all' | 'discard-selected' | 'discard-all';
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

  const handleDiscardSelectedClick = () => {
    const discardable = oldTabs.filter(
      tab => selectedForClose.has(tab.id) && !tab.active && !tab.discarded
    );
    if (discardable.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      type: 'discard-selected',
      count: discardable.length,
    });
  };

  const handleDiscardAllClick = () => {
    const discardable = oldTabs.filter(tab => !tab.active && !tab.discarded);
    if (discardable.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      type: 'discard-all',
      count: discardable.length,
    });
  };

  const handleConfirmAction = async () => {
    const dialogType = confirmDialog.type;
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    if (dialogType === 'selected') {
      setIsClosing(true);
      await closeMultipleTabs(Array.from(selectedForClose));
      setSelectedForClose(new Set());
      setIsClosing(false);
    } else if (dialogType === 'all') {
      setIsClosing(true);
      await closeMultipleTabs(oldTabs.map(tab => tab.id));
      setSelectedForClose(new Set());
      setIsClosing(false);
    } else if (dialogType === 'discard-selected') {
      setIsDiscarding(true);
      const discardable = oldTabs.filter(
        tab => selectedForClose.has(tab.id) && !tab.active && !tab.discarded
      );
      await discardMultipleTabs(discardable.map(tab => tab.id));
      setIsDiscarding(false);
    } else if (dialogType === 'discard-all') {
      setIsDiscarding(true);
      const discardable = oldTabs.filter(tab => !tab.active && !tab.discarded);
      await discardMultipleTabs(discardable.map(tab => tab.id));
      setIsDiscarding(false);
    }
  };

  const handleCancelClose = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const getConfirmTitle = () => {
    switch (confirmDialog.type) {
      case 'selected': return 'Close Selected Tabs?';
      case 'all': return 'Close All Tabs?';
      case 'discard-selected': return 'Discard Selected Tabs?';
      case 'discard-all': return 'Discard All Tabs?';
    }
  };

  const getConfirmMessage = () => {
    const isDiscard = confirmDialog.type.startsWith('discard');
    if (isDiscard) {
      return `Are you sure you want to discard ${confirmDialog.count} tab${confirmDialog.count > 1 ? 's' : ''}? They will stay open but free up memory.`;
    }
    return `Are you sure you want to close ${confirmDialog.count} tab${confirmDialog.count > 1 ? 's' : ''}? This action cannot be undone.`;
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

  const isBusy = isClosing || isDiscarding;
  const discardableSelectedCount = oldTabs.filter(
    tab => selectedForClose.has(tab.id) && !tab.active && !tab.discarded
  ).length;
  const discardableAllCount = oldTabs.filter(tab => !tab.active && !tab.discarded).length;

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={confirmDialog.type.startsWith('discard') ? 'Discard' : 'Close'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelClose}
      />

      <div className="batch-actions">
        <div className="selection-buttons">
          <button
            className="select-btn"
            onClick={selectAll}
            disabled={isBusy}
          >
            Select All
          </button>
          <button
            className="select-btn"
            onClick={selectNone}
            disabled={isBusy || selectedForClose.size === 0}
          >
            Clear
          </button>
        </div>
        <div className="close-buttons">
          <button
            className="close-selected-btn"
            onClick={handleCloseSelectedClick}
            disabled={isBusy || selectedForClose.size === 0}
          >
            {isClosing ? 'Closing...' : `Close Selected (${selectedForClose.size})`}
          </button>
          <button
            className="close-all-btn"
            onClick={handleCloseAllClick}
            disabled={isBusy}
          >
            Close All ({oldTabs.length})
          </button>
        </div>
        <div className="close-buttons">
          <button
            className="discard-selected-btn"
            onClick={handleDiscardSelectedClick}
            disabled={isBusy || discardableSelectedCount === 0}
          >
            {isDiscarding ? 'Discarding...' : `Discard Selected (${discardableSelectedCount})`}
          </button>
          <button
            className="discard-all-btn"
            onClick={handleDiscardAllClick}
            disabled={isBusy || discardableAllCount === 0}
          >
            Discard All ({discardableAllCount})
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
                  disabled={isBusy}
                />
                <span className="checkmark"></span>
              </label>
              <span className="tab-title">
                {tab.title}
                {tab.discarded && <span className="discarded-badge">Discarded</span>}
              </span>
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

import React, { useState, useEffect } from 'react';
import { useTabContext } from '../context/TabContext';
import { useSearchContext } from '../context/SearchContext';
import { TabDetails } from './TabDetails';
import { ConfirmDialog } from './ConfirmDialog';
import { findDuplicates, type DuplicateGroup } from '../utils/urlUtils';

interface DuplicateTabsProps {
  onDetailView: (showing: boolean) => void;
}

export const DuplicateTabs: React.FC<DuplicateTabsProps> = ({ onDetailView }) => {
  const { tabs, loading, error, closeTab, closeMultipleTabs } = useTabContext();
  const { searchQuery } = useSearchContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'group' | 'all';
    groupUrl?: string;
    count: number;
  }>({ isOpen: false, type: 'group', count: 0 });

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

  const searchLower = searchQuery.toLowerCase();
  const allDuplicates = findDuplicates(tabs);

  // Filter groups by search query
  const duplicateGroups: DuplicateGroup[] = searchQuery
    ? allDuplicates
        .map(group => ({
          ...group,
          tabs: group.tabs.filter(tab =>
            tab.title.toLowerCase().includes(searchLower) ||
            tab.url.toLowerCase().includes(searchLower)
          ),
        }))
        .filter(group => group.tabs.length >= 2)
    : allDuplicates;

  const totalDuplicateCount = duplicateGroups.reduce(
    (sum, group) => sum + group.tabs.length - 1, 0
  );

  const handleCloseGroupDuplicates = (group: DuplicateGroup) => {
    const dupeCount = group.tabs.length - 1;
    if (dupeCount === 0) return;
    setConfirmDialog({
      isOpen: true,
      type: 'group',
      groupUrl: group.normalizedUrl,
      count: dupeCount,
    });
  };

  const handleCloseAllDuplicates = () => {
    if (totalDuplicateCount === 0) return;
    setConfirmDialog({
      isOpen: true,
      type: 'all',
      count: totalDuplicateCount,
    });
  };

  const handleConfirmClose = async () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    if (confirmDialog.type === 'group' && confirmDialog.groupUrl) {
      const group = duplicateGroups.find(g => g.normalizedUrl === confirmDialog.groupUrl);
      if (group) {
        // Close all but the first (most recent) tab
        const idsToClose = group.tabs.slice(1).map(t => t.id);
        await closeMultipleTabs(idsToClose);
      }
    } else {
      // Close all duplicates across all groups
      const idsToClose = duplicateGroups.flatMap(group =>
        group.tabs.slice(1).map(t => t.id)
      );
      await closeMultipleTabs(idsToClose);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tab data...</p>
      </div>
    );
  }

  if (duplicateGroups.length === 0) {
    return <p>No duplicate tabs found</p>;
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'all' ? 'Close All Duplicates?' : 'Close Duplicates?'}
        message={`Are you sure you want to close ${confirmDialog.count} duplicate tab${confirmDialog.count > 1 ? 's' : ''}? The most recently accessed tab in each group will be kept.`}
        confirmLabel="Close"
        cancelLabel="Cancel"
        onConfirm={handleConfirmClose}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {totalDuplicateCount > 0 && (
        <div className="batch-actions">
          <div className="close-buttons">
            <button
              className="close-all-btn close-all-duplicates-btn"
              onClick={handleCloseAllDuplicates}
            >
              Close All Duplicates ({totalDuplicateCount})
            </button>
          </div>
        </div>
      )}

      <div className="duplicate-groups">
        {duplicateGroups.map(group => {
          const isExpanded = expandedGroup === group.normalizedUrl;
          const title = group.tabs[0].title;
          const truncatedUrl = group.normalizedUrl.length > 50
            ? group.normalizedUrl.substring(0, 50) + '...'
            : group.normalizedUrl;

          return (
            <div key={group.normalizedUrl} className="duplicate-group">
              <button
                className="duplicate-group-header"
                onClick={() => setExpandedGroup(isExpanded ? null : group.normalizedUrl)}
              >
                <div className="duplicate-group-info">
                  <span className="duplicate-group-title">{title}</span>
                  <span className="duplicate-group-url">{truncatedUrl}</span>
                </div>
                <span className="duplicate-count-badge">x{group.tabs.length}</span>
              </button>

              {isExpanded && (
                <div className="duplicate-group-expanded">
                  <ul>
                    {group.tabs.map((tab, index) => (
                      <li key={tab.id}>
                        <div className="tab-list-item">
                          <span className="tab-title">
                            {index === 0 && <span className="keeper-badge">Keep</span>}
                            {tab.title}
                            {tab.discarded && <span className="discarded-badge">Discarded</span>}
                          </span>
                        </div>
                        <button onClick={() => setSelectedTab(tab.id)}>Details</button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="close-group-duplicates-btn"
                    onClick={() => handleCloseGroupDuplicates(group)}
                  >
                    Close Duplicates ({group.tabs.length - 1})
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

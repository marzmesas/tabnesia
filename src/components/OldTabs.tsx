import React, { useState } from 'react';
import { useTabContext } from '../context/TabContext';
import { useSearchContext } from '../context/SearchContext';
import { TabDetails } from './TabDetails';
import { getColorVariables } from '../utils/colors';

export const OldTabs: React.FC = () => {
  const { tabs, loading, error, closeTab, closeMultipleTabs } = useTabContext();
  const { searchQuery } = useSearchContext();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedForClose, setSelectedForClose] = useState<Set<number>>(new Set());
  const [isClosing, setIsClosing] = useState(false);

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
  const searchLower = searchQuery.toLowerCase();
  const oldTabs = tabs
    .filter(tab => tab.lastAccessed < thirtyDaysAgo)
    .filter(tab => !searchQuery ||
      tab.title.toLowerCase().includes(searchLower) ||
      tab.url.toLowerCase().includes(searchLower));

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

  const handleCloseSelected = async () => {
    if (selectedForClose.size === 0) return;
    setIsClosing(true);
    await closeMultipleTabs(Array.from(selectedForClose));
    setSelectedForClose(new Set());
    setIsClosing(false);
  };

  const handleCloseAll = async () => {
    if (oldTabs.length === 0) return;
    setIsClosing(true);
    await closeMultipleTabs(oldTabs.map(tab => tab.id));
    setSelectedForClose(new Set());
    setIsClosing(false);
  };

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
            <>
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
                    onClick={handleCloseSelected}
                    disabled={isClosing || selectedForClose.size === 0}
                  >
                    {isClosing ? 'Closing...' : `Close Selected (${selectedForClose.size})`}
                  </button>
                  <button
                    className="close-all-btn"
                    onClick={handleCloseAll}
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
          )
        )
      )}
    </div>
  );
};

import React from 'react';
import { useTabContext } from '../context/TabContext';
import { ThemeToggle } from './ThemeToggle';
import { TabAnalytics } from './TabAnalytics';
import { ACTIVE_THRESHOLD_MS, FORGOTTEN_THRESHOLD_MS } from '../utils/constants';
import { findDuplicates } from '../utils/urlUtils';

type Section = 'active' | 'inactive' | 'forgotten' | 'duplicates';

interface HomeViewProps {
  onNavigate: (section: Section) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { tabs } = useTabContext();

  const now = Date.now();
  const activeCount = tabs.filter(tab => tab.lastAccessed >= now - ACTIVE_THRESHOLD_MS).length;
  const inactiveCount = tabs.filter(tab =>
    tab.lastAccessed < now - ACTIVE_THRESHOLD_MS && tab.lastAccessed >= now - FORGOTTEN_THRESHOLD_MS
  ).length;
  const forgottenCount = tabs.filter(tab => tab.lastAccessed < now - FORGOTTEN_THRESHOLD_MS).length;

  const duplicateGroups = findDuplicates(tabs);
  const duplicateCount = duplicateGroups.reduce(
    (sum, group) => sum + group.tabs.length - 1, 0
  );

  return (
    <>
      <div className="app-header">
        <div className="title-container">
          <h1 className="centered-title">Tabnesia</h1>
          <p className="subtitle">Because we all forget what we opened.</p>
        </div>
        <ThemeToggle />
      </div>
      <TabAnalytics />
      <div className="section-cards">
        <button className="section-card section-card--active" onClick={() => onNavigate('active')}>
          <span className="section-card-title">Active Tabs</span>
          <span className="section-card-count">{activeCount}</span>
        </button>
        <button className="section-card section-card--inactive" onClick={() => onNavigate('inactive')}>
          <span className="section-card-title">Recently Inactive</span>
          <span className="section-card-count">{inactiveCount}</span>
        </button>
        <button className="section-card section-card--forgotten" onClick={() => onNavigate('forgotten')}>
          <span className="section-card-title">Forgotten Tabs</span>
          <span className="section-card-count">{forgottenCount}</span>
        </button>
        {duplicateCount > 0 && (
          <button className="section-card section-card--duplicates" onClick={() => onNavigate('duplicates')}>
            <span className="section-card-title">Duplicate Tabs</span>
            <span className="section-card-count">{duplicateCount}</span>
          </button>
        )}
      </div>
    </>
  );
};

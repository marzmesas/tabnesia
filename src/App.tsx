import React from 'react';
import { UnusedTabs } from './components/UnusedTabs';
import { TabAnalytics } from './components/TabAnalytics';
import { OldTabs } from './components/OldTabs';
import { ActiveTabs } from './components/ActiveTabs';
import './styles/index.css';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="app-header">
        <div className="title-container">
          <h1 className="centered-title">Tabnesia</h1>
          <p className="subtitle">Because we all forget what we opened.</p>
        </div>
      </div>
      <TabAnalytics />
      <ActiveTabs />
      <UnusedTabs />
      <OldTabs />
    </div>
  );
}; 
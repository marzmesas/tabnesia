import React from 'react';
import { TabGroup } from './components/TabGroup';
import { UnusedTabs } from './components/UnusedTabs';
import { TabAnalytics } from './components/TabAnalytics';
import './styles/index.css';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>Tab Group Analyzer</h1>
      <TabAnalytics />
      <UnusedTabs />
      <TabGroup />
    </div>
  );
}; 
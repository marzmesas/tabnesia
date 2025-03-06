import React from 'react';
import { UnusedTabs } from './components/UnusedTabs';
import { TabAnalytics } from './components/TabAnalytics';
import { OldTabs } from './components/OldTabs';
import './styles/index.css';

export const App: React.FC = () => {
  // Add a very obvious console log to verify this version is running
  console.log("NEW VERSION WITH TABNESIA TITLE - " + new Date().toISOString());
  
  return (
    <div className="app-container">
      <div className="app-header">
        <div className="title-container">
          <h1 className="centered-title">Tabnesia</h1>
          <p className="subtitle">Because we all forget what we opened.</p>
        </div>
      </div>
      <TabAnalytics />
      <UnusedTabs />
      <OldTabs />
    </div>
  );
}; 
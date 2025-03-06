import React from 'react';
import { useTabAnalytics } from '../hooks/useTabAnalytics';

// Simple version to test if it works
export const ForgottenTabs: React.FC = () => {
  const { tabs } = useTabAnalytics();
  
  // Filter for tabs older than 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const forgottenTabs = tabs.filter(tab => tab.lastAccessed < thirtyDaysAgo);
  
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Forgotten Tabs</h2>
      <p>Found {forgottenTabs.length} forgotten tabs</p>
    </div>
  );
}; 
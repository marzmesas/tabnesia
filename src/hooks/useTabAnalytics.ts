import { useState, useEffect } from 'react';

interface TabAnalytics {
  id: number;
  url: string;
  title: string;
  groupId: number;
  lastAccessed: number;
}

export const useTabAnalytics = () => {
  const [tabs, setTabs] = useState<TabAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await chrome.runtime.sendMessage({ action: 'getTabAnalytics' });
        setTabs(analytics || []);
      } catch (err) {
        setError('Failed to fetch tab analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const closeTab = async (tabId: number) => {
    try {
      await chrome.tabs.remove(tabId);
      setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
    } catch (err) {
      console.error('Failed to close tab:', err);
    }
  };

  return { tabs, loading, error, closeTab };
}; 
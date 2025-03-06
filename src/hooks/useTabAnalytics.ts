import { useState, useEffect } from 'react';

export interface TabAnalytics {
  id: number;
  url: string;
  title: string;
  groupId: number;
  lastAccessed: number;
  groupDetails?: {
    name: string;
    color: string;
  };
}

interface TabResponse {
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
        // First get all groups
        const groups = await chrome.runtime.sendMessage({ action: 'getTabGroups' });
        const groupMap = new Map(groups.map((group: any) => [
          group.id,
          { name: group.title, color: group.color }
        ]));

        const analytics = await chrome.runtime.sendMessage({ action: 'getTabAnalytics' });
        setTabs((analytics || []).map((tab: TabResponse) => ({
          ...tab,
          groupDetails: tab.groupId !== -1 ? groupMap.get(tab.groupId) : undefined
        })));
      } catch (err) {
        setError('Failed to fetch tab analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Function to manually refresh the data
  const refreshData = async () => {
    setLoading(true);
    try {
      // First get all groups
      const groups = await chrome.runtime.sendMessage({ action: 'getTabGroups' });
      const groupMap = new Map(groups.map((group: any) => [
        group.id,
        { name: group.title, color: group.color }
      ]));

      const analytics = await chrome.runtime.sendMessage({ action: 'getTabAnalytics' });
      setTabs((analytics || []).map((tab: TabResponse) => ({
        ...tab,
        groupDetails: tab.groupId !== -1 ? groupMap.get(tab.groupId) : undefined
      })));
    } catch (err) {
      setError('Failed to refresh tab analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeTab = async (tabId: number) => {
    try {
      await chrome.tabs.remove(tabId);
      setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
    } catch (err) {
      console.error('Failed to close tab:', err);
    }
  };

  return { tabs, loading, error, closeTab, refreshData };
}; 
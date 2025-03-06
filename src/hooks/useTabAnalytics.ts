import { useState, useEffect, useCallback, useRef } from 'react';

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
  const tabsRef = useRef<TabAnalytics[]>([]);
  const isInitialLoadRef = useRef(true);

  // Function to fetch tab analytics data
  const fetchAnalytics = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    
    try {
      // First get all groups
      const groups = await chrome.runtime.sendMessage({ action: 'getTabGroups' });
      const groupMap = new Map(groups.map((group: any) => [
        group.id,
        { name: group.title, color: group.color }
      ]));

      const analytics = await chrome.runtime.sendMessage({ action: 'getTabAnalytics' });
      const newTabs = (analytics || []).map((tab: TabResponse) => ({
        ...tab,
        groupDetails: tab.groupId !== -1 ? groupMap.get(tab.groupId) : undefined
      }));
      
      // Only update state if the tabs have actually changed
      // This prevents unnecessary re-renders
      const hasChanged = JSON.stringify(newTabs) !== JSON.stringify(tabsRef.current);
      
      if (hasChanged) {
        console.log("Tabs have changed, updating state");
        tabsRef.current = newTabs;
        setTabs(newTabs);
      }
    } catch (err) {
      setError('Failed to fetch tab analytics');
      console.error(err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    fetchAnalytics(true);
    
    // Set up a listener for tab changes
    const handleTabChange = () => {
      console.log("Tab change detected, refreshing data");
      fetchAnalytics(false);
    };
    
    // Listen for tab events directly in the hook
    chrome.tabs.onRemoved.addListener(handleTabChange);
    chrome.tabs.onCreated.addListener(handleTabChange);
    
    return () => {
      // Clean up listeners when component unmounts
      chrome.tabs.onRemoved.removeListener(handleTabChange);
      chrome.tabs.onCreated.removeListener(handleTabChange);
    };
  }, [fetchAnalytics]);

  // Function to close a tab and update the state immediately
  const closeTab = async (tabId: number) => {
    try {
      await chrome.tabs.remove(tabId);
      // Immediately update the local state
      const updatedTabs = tabs.filter(tab => tab.id !== tabId);
      tabsRef.current = updatedTabs;
      setTabs(updatedTabs);
    } catch (err) {
      console.error('Failed to close tab:', err);
    }
  };

  return { tabs, loading, error, closeTab, refreshData: fetchAnalytics };
}; 
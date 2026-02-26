import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface TabAnalytics {
  id: number;
  url: string;
  title: string;
  groupId: number;
  lastAccessed: number;
  discarded: boolean;
  active: boolean;
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
  discarded: boolean;
  active: boolean;
}

interface TabContextValue {
  tabs: TabAnalytics[];
  loading: boolean;
  error: string | null;
  closeTab: (tabId: number) => Promise<void>;
  closeMultipleTabs: (tabIds: number[]) => Promise<void>;
  discardTab: (tabId: number) => Promise<void>;
  discardMultipleTabs: (tabIds: number[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const TabContext = createContext<TabContextValue | undefined>(undefined);

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<TabAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tabsRef = useRef<TabAnalytics[]>([]);
  const isInitialLoadRef = useRef(true);

  const fetchAnalytics = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }

    try {
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

      // Only update state if tabs have changed (compare by tab IDs and lastAccessed)
      const hasChanged = newTabs.length !== tabsRef.current.length ||
        newTabs.some((tab: TabAnalytics, i: number) =>
          !tabsRef.current[i] ||
          tab.id !== tabsRef.current[i].id ||
          tab.lastAccessed !== tabsRef.current[i].lastAccessed ||
          tab.discarded !== tabsRef.current[i].discarded ||
          tab.active !== tabsRef.current[i].active
        );

      if (hasChanged) {
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

  useEffect(() => {
    fetchAnalytics(true);

    const handleTabChange = () => {
      fetchAnalytics(false);
    };

    chrome.tabs.onRemoved.addListener(handleTabChange);
    chrome.tabs.onCreated.addListener(handleTabChange);

    return () => {
      chrome.tabs.onRemoved.removeListener(handleTabChange);
      chrome.tabs.onCreated.removeListener(handleTabChange);
    };
  }, [fetchAnalytics]);

  const closeTab = async (tabId: number) => {
    try {
      await chrome.tabs.remove(tabId);
      const updatedTabs = tabs.filter(tab => tab.id !== tabId);
      tabsRef.current = updatedTabs;
      setTabs(updatedTabs);
    } catch (err) {
      console.error('Failed to close tab:', err);
    }
  };

  const closeMultipleTabs = async (tabIds: number[]) => {
    try {
      await chrome.tabs.remove(tabIds);
      const updatedTabs = tabs.filter(tab => !tabIds.includes(tab.id));
      tabsRef.current = updatedTabs;
      setTabs(updatedTabs);
    } catch (err) {
      console.error('Failed to close tabs:', err);
    }
  };

  const discardTab = async (tabId: number) => {
    try {
      await chrome.tabs.discard(tabId);
      // Optimistic update
      const updatedTabs = tabs.map(tab =>
        tab.id === tabId ? { ...tab, discarded: true } : tab
      );
      tabsRef.current = updatedTabs;
      setTabs(updatedTabs);
    } catch (err) {
      console.error('Failed to discard tab:', err);
    }
  };

  const discardMultipleTabs = async (tabIds: number[]) => {
    try {
      await Promise.all(tabIds.map(id => chrome.tabs.discard(id)));
      // Optimistic update
      const idSet = new Set(tabIds);
      const updatedTabs = tabs.map(tab =>
        idSet.has(tab.id) ? { ...tab, discarded: true } : tab
      );
      tabsRef.current = updatedTabs;
      setTabs(updatedTabs);
    } catch (err) {
      console.error('Failed to discard tabs:', err);
    }
  };

  return (
    <TabContext.Provider value={{ tabs, loading, error, closeTab, closeMultipleTabs, discardTab, discardMultipleTabs, refreshData: () => fetchAnalytics(false) }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabContext = (): TabContextValue => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
};

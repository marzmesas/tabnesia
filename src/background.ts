/**
 * Tabnesia background service worker.
 * Tracks tab access times, updates badge, and handles messages from the popup.
 */

import { FORGOTTEN_THRESHOLD_MS, STALE_CLEANUP_MS } from './utils/constants';

// Tab ID -> last accessed timestamp (ms)
type TabLastAccessedMap = Record<number, number>;

export interface TabAnalyticsItem {
  id: number;
  url: string;
  title: string;
  groupId: number;
  lastAccessed: number;
  discarded: boolean;
  active: boolean;
}

type GetTabGroupsResponse = Array<{ id: number; title: string; color: string }>;

type MessageRequest =
  | { action: 'getTabGroups' }
  | { action: 'getTabAnalytics' }
  | { action: 'tabRemoved'; tabId: number };

let tabLastAccessed: TabLastAccessedMap = {};

const updateBadge = async (): Promise<void> => {
  try {
    const tabs = await chrome.tabs.query({});
    const forgottenCutoff = Date.now() - FORGOTTEN_THRESHOLD_MS;
    let forgottenCount = 0;

    for (const tab of tabs) {
      const lastAccessed = tab.id !== undefined ? tabLastAccessed[tab.id] : undefined;
      if (lastAccessed !== undefined && lastAccessed < forgottenCutoff) {
        forgottenCount++;
      }
    }

    await chrome.action.setBadgeText({
      text: forgottenCount > 0 ? String(forgottenCount) : '',
    });
    await chrome.action.setBadgeBackgroundColor({ color: '#E53935' });
  } catch (error) {
    console.error('Error updating badge:', error);
  }
};

const cleanupStaleEntries = async (): Promise<void> => {
  try {
    const tabs = await chrome.tabs.query({});
    const currentTabIds = new Set(tabs.map((tab) => tab.id).filter((id): id is number => id !== undefined));
    const ninetyDaysAgo = Date.now() - STALE_CLEANUP_MS;

    let cleaned = false;
    const entriesToDelete: number[] = [];

    for (const [tabIdStr, timestamp] of Object.entries(tabLastAccessed)) {
      const id = parseInt(tabIdStr, 10);
      if (!currentTabIds.has(id) && timestamp < ninetyDaysAgo) {
        entriesToDelete.push(id);
        cleaned = true;
      }
    }

    for (const tabId of entriesToDelete) {
      delete tabLastAccessed[tabId];
    }

    if (cleaned) {
      await chrome.storage.local.set({ tabLastAccessed });
    }

    await updateBadge();
  } catch (error) {
    console.error('Error cleaning up stale entries:', error);
  }
};

const initializeTabTracking = async (): Promise<void> => {
  try {
    const result = await chrome.storage.local.get('tabLastAccessed');
    tabLastAccessed = (result.tabLastAccessed as TabLastAccessedMap) ?? {};

    await cleanupStaleEntries();

    const tabs = await chrome.tabs.query({});
    const now = Date.now();
    let updated = false;

    for (const tab of tabs) {
      if (tab.id !== undefined && tabLastAccessed[tab.id] === undefined) {
        tabLastAccessed[tab.id] = now;
        updated = true;
      }
    }

    if (updated) {
      await chrome.storage.local.set({ tabLastAccessed });
    }

    await updateBadge();
  } catch (error) {
    console.error('Error initializing tab tracking:', error);
  }
};

const saveTabAccessTimes = async (): Promise<void> => {
  try {
    await chrome.storage.local.set({ tabLastAccessed });
  } catch (error) {
    console.error('Error saving tab access times:', error);
  }
};

// Analytics cache
let tabAnalyticsCache: TabAnalyticsItem[] | null = null;
let lastCacheTime = 0;
const CACHE_LIFETIME_MS = 1000;

const invalidateCache = (): void => {
  tabAnalyticsCache = null;
  lastCacheTime = 0;
};

// Tab group listeners (optional future feature)
chrome.tabGroups.onUpdated.addListener(() => {
  // Tab group updated - future feature hook
});

chrome.tabGroups.onRemoved.addListener(() => {
  // Tab group removed - future feature hook
});

// Tab activation and update tracking
chrome.tabs.onActivated.addListener((activeInfo) => {
  tabLastAccessed[activeInfo.tabId] = Date.now();
  void saveTabAccessTimes();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    tabLastAccessed[tabId] = Date.now();
    void saveTabAccessTimes();
    invalidateCache();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabLastAccessed[tabId];
  void saveTabAccessTimes();
  invalidateCache();

  try {
    chrome.runtime.sendMessage({ action: 'tabRemoved', tabId } as MessageRequest, () => {
      if (chrome.runtime.lastError) {
        // Popup may not be open - ignore
      }
    });
  } catch {
    // Popup not available - normal when closed
  }
});

chrome.tabs.onCreated.addListener(invalidateCache);

// Startup
void initializeTabTracking();

chrome.alarms.create('cleanupStaleEntries', { periodInMinutes: 24 * 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupStaleEntries') {
    void cleanupStaleEntries();
  }
});

// Message handling
chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: GetTabGroupsResponse | TabAnalyticsItem[]) => void
  ): boolean => {
    if (request.action === 'getTabGroups') {
      chrome.tabGroups.query({}, (groups) => {
        const groupInfo: GetTabGroupsResponse = groups.map((group) => ({
          id: group.id,
          title: group.title || `Group ${group.id}`,
          color: group.color || 'grey',
        }));
        sendResponse(groupInfo);
      });
      return true;
    }

    if (request.action === 'getTabAnalytics') {
      const now = Date.now();
      if (tabAnalyticsCache !== null && now - lastCacheTime < CACHE_LIFETIME_MS) {
        sendResponse(tabAnalyticsCache);
        return true;
      }

      chrome.tabs.query({}, async (tabs) => {
        try {
          const urlTabs = tabs.filter((tab) => tab.url?.startsWith('http'));
          const historyItems =
            urlTabs.length > 0
              ? await chrome.history.search({
                  text: '',
                  startTime: 0,
                  maxResults: 1000,
                })
              : [];

          const urlToVisitTime = new Map<string, number | undefined>();
          for (const item of historyItems) {
            urlToVisitTime.set(item.url ?? '', item.lastVisitTime);
          }

          const results: TabAnalyticsItem[] = tabs.map((tab) => {
            const url = tab.url ?? '';
            let lastVisitTime = urlToVisitTime.get(url);
            if (lastVisitTime === undefined && tab.id !== undefined) {
              lastVisitTime = tabLastAccessed[tab.id];
            }
            if (lastVisitTime === undefined && tab.id !== undefined) {
              lastVisitTime = Date.now();
              tabLastAccessed[tab.id] = lastVisitTime;
            }
            const lastAccessed = lastVisitTime ?? Date.now();

            return {
              id: tab.id!,
              url,
              title: tab.title ?? '',
              groupId: tab.groupId ?? -1,
              lastAccessed,
              discarded: tab.discarded ?? false,
              active: tab.active ?? false,
            };
          });

          tabAnalyticsCache = results;
          lastCacheTime = now;
          sendResponse(results);
          await updateBadge();
        } catch (error) {
          console.error('Error processing tabs:', error);
          sendResponse([]);
        }
      });
      return true;
    }

    return false;
  }
);

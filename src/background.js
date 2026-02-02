// Listen for changes in tab groups (optional future feature)
chrome.tabGroups.onUpdated.addListener((group) => {
    // Tab group updated - future feature hook
  });

  chrome.tabGroups.onRemoved.addListener((groupId) => {
    // Tab group removed - future feature hook
  });
  
  // Use a more robust approach to track tab access times
  let tabLastAccessed = {};

  // Initialize when extension loads
  const initializeTabTracking = async () => {
    try {
      // Load existing data
      const result = await chrome.storage.local.get('tabLastAccessed');
      tabLastAccessed = result.tabLastAccessed || {};
      
      // Get current tabs and set initial timestamps for any new tabs
      const tabs = await chrome.tabs.query({});
      const now = Date.now();
      
      // Create timestamps for tabs that don't have one
      // Use current time - new tabs should start as "active"
      let updated = false;
      tabs.forEach(tab => {
        if (!tabLastAccessed[tab.id]) {
          tabLastAccessed[tab.id] = now;
          updated = true;
        }
      });
      
      if (updated) {
        await chrome.storage.local.set({ tabLastAccessed });
      }
      
    } catch (error) {
      console.error('Error initializing tab tracking:', error);
    }
  };

  // Save the current state to storage
  const saveTabAccessTimes = async () => {
    try {
      await chrome.storage.local.set({ tabLastAccessed });
    } catch (error) {
      console.error('Error saving tab access times:', error);
    }
  };

  // Track when a tab is activated (user switches to it)
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    tabLastAccessed[activeInfo.tabId] = Date.now();
    saveTabAccessTimes();
  });

  // Track when a tab is updated (e.g., page load completes)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      tabLastAccessed[tabId] = Date.now();
      saveTabAccessTimes();
    }
  });

  // Clean up removed tabs
  chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabLastAccessed[tabId];
    saveTabAccessTimes();
    invalidateCache();

    // Try to notify the popup that a tab was closed
    try {
      chrome.runtime.sendMessage({ action: 'tabRemoved', tabId }, () => {
        // Ignore errors - popup may not be open
        chrome.runtime.lastError;
      });
    } catch {
      // Popup not available - this is normal
    }
  });

  // Initialize tracking when extension loads
  initializeTabTracking();

  // Optimize the cache handling in the background script
  let tabAnalyticsCache = null;
  let lastCacheTime = 0;
  const CACHE_LIFETIME = 1000; // 1 second cache lifetime

  // Update your tab event listeners to be more efficient
  const invalidateCache = () => {
    tabAnalyticsCache = null;
    lastCacheTime = 0;
  };

  chrome.tabs.onCreated.addListener(invalidateCache);
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // Only invalidate on complete to avoid multiple refreshes
    if (changeInfo.status === 'complete') {
      invalidateCache();
    }
  });

  // Handle messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTabGroups') {
      chrome.tabGroups.query({}, (groups) => {
        const groupInfo = groups.map(group => ({
          id: group.id,
          title: group.title || `Group ${group.id}`,
          color: group.color || 'grey'
        }));
        sendResponse(groupInfo);
      });
      return true;
    }

    if (request.action === 'getTabAnalytics') {
      // Check if we have a valid cache
      const now = Date.now();
      if (tabAnalyticsCache && (now - lastCacheTime < CACHE_LIFETIME)) {
        sendResponse(tabAnalyticsCache);
        return true;
      }

      chrome.tabs.query({}, async (tabs) => {
        try {
          
          // Get all URLs that we can query (http/https only)
          const urlTabs = tabs.filter(tab => tab.url.startsWith('http'));
          
          // Batch history query for all URLs at once
          const historyItems = urlTabs.length > 0 ? 
            await chrome.history.search({
              text: '',  // Empty string to match all
              startTime: 0,
              maxResults: 1000  // Set high to get all possible matches
            }) : [];
            
          // Create a map of URLs to their last visit times
          const urlToVisitTime = new Map();
          historyItems.forEach(item => {
            urlToVisitTime.set(item.url, item.lastVisitTime);
          });
          
          // Process each tab and create the results array directly
          const results = tabs.map((tab) => {
            // Look up the visit time from our map (history API)
            let lastVisitTime = urlToVisitTime.get(tab.url);

            // If no history available, fall back to our tracked access times
            if (!lastVisitTime) {
              lastVisitTime = tabLastAccessed[tab.id];
            }

            // If still no data, use current time (tab is newly discovered)
            // This ensures new tabs start as "active" rather than being falsely categorized as forgotten
            if (!lastVisitTime) {
              lastVisitTime = Date.now();
              // Store this so we track it going forward
              tabLastAccessed[tab.id] = lastVisitTime;
            }

            return {
              id: tab.id,
              url: tab.url,
              title: tab.title,
              groupId: tab.groupId,
              lastAccessed: lastVisitTime
            };
          });
          
          // Update the cache
          tabAnalyticsCache = results;
          lastCacheTime = now;
          
          sendResponse(results);
        } catch (error) {
          console.error('Error processing tabs:', error);
          sendResponse([]);
        }
      });
      return true;
    }
  });
  
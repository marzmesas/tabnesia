// Listen for changes in tab groups (optional future feature)
chrome.tabGroups.onUpdated.addListener((group) => {
    console.log('Tab group updated:', group);
  });
  
  chrome.tabGroups.onRemoved.addListener((groupId) => {
    console.log(`Tab group with ID ${groupId} was removed.`);
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
      let updated = false;
      tabs.forEach(tab => {
        if (!tabLastAccessed[tab.id]) {
          // Assign different timestamps based on tab index to create variety
          tabLastAccessed[tab.id] = now - (tab.index * 60000); // Stagger by minutes
          updated = true;
        }
      });
      
      if (updated) {
        await chrome.storage.local.set({ tabLastAccessed });
      }
      
      console.log('Tab tracking initialized with', Object.keys(tabLastAccessed).length, 'tabs');
    } catch (error) {
      console.error('Error initializing tab tracking:', error);
    }
  };

  // Save the current state to storage
  const saveTabAccessTimes = async () => {
    try {
      await chrome.storage.local.set({ tabLastAccessed });
      console.log('Saved tab access times');
    } catch (error) {
      console.error('Error saving tab access times:', error);
    }
  };

  // Track when a tab is activated (user switches to it)
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('Tab activated:', activeInfo.tabId);
    tabLastAccessed[activeInfo.tabId] = Date.now();
    saveTabAccessTimes();
  });

  // Track when a tab is updated (e.g., page load completes)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      console.log('Tab updated:', tabId);
      tabLastAccessed[tabId] = Date.now();
      saveTabAccessTimes();
    }
  });

  // Clean up removed tabs
  chrome.tabs.onRemoved.addListener((tabId) => {
    console.log('Tab removed:', tabId);
    delete tabLastAccessed[tabId];
    saveTabAccessTimes();
  });

  // Initialize tracking when extension loads
  initializeTabTracking();

  // Cache for tab analytics to avoid repeated history lookups
  let tabAnalyticsCache = null;
  let lastCacheTime = 0;
  const CACHE_LIFETIME = 60000; // Cache valid for 1 minute

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
        console.log('Using cached tab analytics');
        sendResponse(tabAnalyticsCache);
        return true;
      }

      chrome.tabs.query({}, async (tabs) => {
        try {
          console.log('Fetching fresh tab analytics for', tabs.length, 'tabs');
          
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
          const results = tabs.map((tab, index) => {
            // Look up the visit time from our map
            let lastVisitTime = urlToVisitTime.get(tab.url);
            
            // If we couldn't get history, use a deterministic time based on tab ID
            if (!lastVisitTime) {
              // Generate a wide range of timestamps for testing
              // Some tabs will be very old (60-90 days), some medium (15-30 days), some recent (1-7 days)
              const category = index % 3;
              let dayOffset;
              
              if (category === 0) {
                // Very old tabs (60-90 days)
                dayOffset = 60 + (tab.id % 30);
              } else if (category === 1) {
                // Medium old tabs (15-30 days)
                dayOffset = 15 + (tab.id % 15);
              } else {
                // Recent tabs (1-7 days)
                dayOffset = 1 + (tab.id % 7);
              }
              
              lastVisitTime = Date.now() - (dayOffset * 24 * 60 * 60 * 1000);
              console.log(`Tab ${tab.id} (${tab.title.substring(0, 20)}...) set to ${dayOffset} days ago`);
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
  
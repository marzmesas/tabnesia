// Listen for changes in tab groups (optional future feature)
chrome.tabGroups.onUpdated.addListener((group) => {
    console.log('Tab group updated:', group);
  });
  
  chrome.tabGroups.onRemoved.addListener((groupId) => {
    console.log(`Tab group with ID ${groupId} was removed.`);
  });
  
  // Track tab access times
  const tabAccessTimes = new Map();

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    tabAccessTimes.set(activeInfo.tabId, Date.now());
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTabGroups') {
      chrome.tabGroups.query({}, (groups) => {
        sendResponse(groups);
      });
      return true;
    }

    if (request.action === 'getTabAnalytics') {
      chrome.tabs.query({}, (tabs) => {
        try {
          const analytics = tabs.map(tab => ({
            id: tab.id,
            url: tab.url,
            title: tab.title,
            groupId: tab.groupId,
            lastAccessed: tabAccessTimes.get(tab.id) || Date.now(),
          }));
          sendResponse(analytics);
        } catch (error) {
          console.error('Error processing tabs:', error);
          sendResponse([]);  // Send empty array instead of undefined
        }
      });
      return true;  // Important: keeps the message channel open
    }
  });
  
// Listen for changes in tab groups (optional future feature)
chrome.tabGroups.onUpdated.addListener((group) => {
    console.log('Tab group updated:', group);
  });
  
  chrome.tabGroups.onRemoved.addListener((groupId) => {
    console.log(`Tab group with ID ${groupId} was removed.`);
  });
  
  // Optional feature: Manage active tab groups or provide a global store
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTabGroups') {
      chrome.tabGroups.query({}, (groups) => {
        sendResponse(groups);
      });
      return true; // Indicates asynchronous response
    }
  });
  
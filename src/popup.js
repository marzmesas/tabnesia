document.addEventListener('DOMContentLoaded', () => {
    const groupsDiv = document.getElementById('groups');
    const downloadButton = document.getElementById('download');
    let selectedGroupId = null;
    let selectedGroupName = '';
  
    // Request tab groups from background.js
    chrome.runtime.sendMessage({ action: 'getTabGroups' }, (groups) => {
      groups.forEach(group => {
        const button = document.createElement('button');
        button.textContent = group.title || `Group ${group.id}`;
        button.onclick = () => {
          selectedGroupId = group.id;
          selectedGroupName = group.title || `Group ${group.id}`;
          document.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
          button.classList.add('selected');
        };
        groupsDiv.appendChild(button);
      });
    });
  
    // Download links for the selected group
    downloadButton.addEventListener('click', () => {
      if (selectedGroupId === null) {
        alert('Please select a group first.');
        return;
      }
  
      // Fetch tabs within the group
      chrome.tabs.query({ groupId: selectedGroupId }, (tabs) => {
        // Prepare the content with the group title as a header
        const groupHeader = `Group Name: ${selectedGroupName}\n\n`;
        const links = tabs.map(tab => tab.url).join('\n');
        const content = groupHeader + links;
  
        // Create and download the text file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url,
          filename: `${selectedGroupName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
        });
      });
    });
  });
  
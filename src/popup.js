document.addEventListener('DOMContentLoaded', () => {
    const groupsDiv = document.getElementById('groups');
    const downloadButton = document.getElementById('download');
    let selectedGroupId = null;
  
    // Request tab groups from background.js
    chrome.runtime.sendMessage({ action: 'getTabGroups' }, (groups) => {
      groups.forEach(group => {
        const button = document.createElement('button');
        button.textContent = group.title || `Group ${group.id}`;
        button.onclick = () => {
          selectedGroupId = group.id;
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
  
      chrome.tabs.query({ groupId: selectedGroupId }, (tabs) => {
        const links = tabs.map(tab => tab.url).join('\n');
        const blob = new Blob([links], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url,
          filename: `tab-group-${selectedGroupId}.txt`
        });
      });
    });
  });
  
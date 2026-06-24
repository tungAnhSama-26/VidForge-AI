document.getElementById('openAppBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://vidforge-ai.duckdns.org/' });
});

document.getElementById('extractBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'extract_content' }, (response) => {
      if (response && response.success) {
        document.getElementById('status').style.display = 'block';
        
        // Save extracted content to local storage
        chrome.storage.local.set({ extractedContent: response.data }, () => {
          setTimeout(() => {
            // Open VidForge AI generator page with the extracted content
            chrome.tabs.create({ 
              url: 'https://vidforge-ai.duckdns.org/' 
            });
          }, 1000);
        });
      } else {
        alert("Không thể lấy nội dung từ trang này.");
      }
    });
  }
});

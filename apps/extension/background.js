// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("VidForge AI Extension Installed!");
  
  // Create context menu
  chrome.contextMenus.create({
    id: "send_to_vidforge",
    title: "Tạo Video bằng VidForge AI",
    contexts: ["selection", "page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "send_to_vidforge") {
    let textContent = info.selectionText || "";
    
    // If no text selected, maybe extract the whole page later
    // but for now we just save whatever we have and open the dashboard
    
    chrome.storage.local.set({ 
      extractedContent: {
        text: textContent,
        url: tab ? tab.url : '',
        title: tab ? tab.title : ''
      }
    }, () => {
      chrome.tabs.create({ 
        url: 'http://vidforge-ai.duckdns.org/dashboard/generate?fromExtension=true' 
      });
    });
  }
});

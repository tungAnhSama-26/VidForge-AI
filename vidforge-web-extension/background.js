chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "https://vidforge-ai.duckdns.org/" });
});

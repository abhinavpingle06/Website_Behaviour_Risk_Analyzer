// =============================
// GLOBAL VARIABLES (TOP)
// =============================
let bypassTabs = new Set();
let approvedUrls = {};

// =============================
// NAVIGATION LISTENER
// =============================
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // ... your existing logic ...
});

// =============================
// CONTEXT MENU
// =============================
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "check-url",
    title: "Check/Redirect this URL",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "check-url") {
    const url = info.linkUrl;

    // Use the global variable
    bypassTabs.add(tab.id);
    approvedUrls[tab.id] = url;

    chrome.tabs.update(tab.id, {
      url: `http://localhost:5173?url=${encodeURIComponent(url)}`
    });
  }
});

// =============================
// MESSAGE LISTENER
// =============================
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "bypassOnce") {
    const tabId = sender.tab.id;
    bypassTabs.add(tabId);
    chrome.tabs.update(tabId, {
      url: message.targetUrl
    });
  }
});

// =============================
// CLEANUP
// =============================
chrome.tabs.onRemoved.addListener((tabId) => {
  delete approvedUrls[tabId];
  bypassTabs.delete(tabId);
});
/**
 * ScamShield - Background Script
 * Handles messages from content scripts to perform privileged actions like opening tabs.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanDetail') {
        // 1. Save text to storage
        chrome.storage.local.set({ 'scanText': request.text }, () => {
            // 2. Open axrn.in in a new tab
            chrome.tabs.create({ url: 'https://axrn.in' });
        });
    }
});

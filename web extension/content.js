/**
 * ScamShield - Content Script (Aggressive Mode)
 * Scans ALL text nodes using TreeWalker for maximum detection coverage.
 */

// Configuration
const CONFIG = {
    checkInterval: 1500,
    scannedAttribute: 'data-scamshield-scanned',
    warningClass: 'scamshield-warning'
};

/**
 * Validates if a node is visible and not part of our UI
 */
function isValidNode(node) {
    if (!node) return false;
    // Ignore our own warnings
    if (node.classList && node.classList.contains(CONFIG.warningClass)) return false;
    if (node.parentElement && node.parentElement.classList.contains(CONFIG.warningClass)) return false;
    if (node.closest && node.closest(`.${CONFIG.warningClass}`)) return false;

    // Ignore scripts/styles
    const tag = node.tagName || (node.parentElement && node.parentElement.tagName);
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH'].includes(tag)) return false;

    return true;
}

/**
 * Adds a visual warning to the container of the text node
 */
function addWarning(targetElement) {
    // Find a suitable container to attach the warning to (block level preferred)
    let container = targetElement;
    if (targetElement.nodeType === Node.TEXT_NODE) {
        container = targetElement.parentElement;
    }

    // Prevent double warning
    if (container.querySelector(`.${CONFIG.warningClass}`)) return;
    if (container.getAttribute('data-scamshield-ignored') === 'true') return;

    // Don't warn on huge containers (like the whole body)
    const rect = container.getBoundingClientRect();
    if (rect.height > 800 || rect.width > 800) return;

    // Style
    container.style.backgroundColor = 'rgba(255, 230, 230, 0.4)';
    container.style.borderBottom = '2px solid #ff4d4d';

    // Warning Label
    const warningDiv = document.createElement('div');
    warningDiv.className = CONFIG.warningClass;
    warningDiv.style.backgroundColor = '#d8000c';
    warningDiv.style.color = 'white';
    warningDiv.style.fontSize = '11px';
    warningDiv.style.fontWeight = 'bold';
    warningDiv.style.padding = '2px 6px';
    warningDiv.style.borderRadius = '10px';
    warningDiv.style.display = 'inline-flex';
    warningDiv.style.alignItems = 'center';
    warningDiv.style.gap = '5px';
    warningDiv.style.marginTop = '4px';
    warningDiv.style.cursor = 'default';
    warningDiv.style.zIndex = '99999';
    warningDiv.innerText = '⚠ Detecting Scam';

    // Ignore Button
    const ignoreBtn = document.createElement('span');
    ignoreBtn.innerText = '✕';
    ignoreBtn.style.cursor = 'pointer';
    ignoreBtn.style.marginLeft = '5px';
    ignoreBtn.style.opacity = '0.8';
    ignoreBtn.title = 'Dismiss';

    ignoreBtn.onclick = (e) => {
        e.stopPropagation();
        container.style.backgroundColor = '';
        container.style.borderBottom = '';
        warningDiv.remove();
        container.setAttribute('data-scamshield-ignored', 'true');
    };

    // Scan in Detail Button
    const detailBtn = document.createElement('button');
    detailBtn.innerText = 'Scan in Detail';
    detailBtn.style.marginLeft = '8px';
    detailBtn.style.padding = '2px 8px';
    detailBtn.style.backgroundColor = 'white';
    detailBtn.style.color = '#d8000c';
    detailBtn.style.border = 'none';
    detailBtn.style.borderRadius = '4px';
    detailBtn.style.fontSize = '10px';
    detailBtn.style.cursor = 'pointer';
    detailBtn.style.fontWeight = 'bold';

    detailBtn.onclick = (e) => {
        e.stopPropagation();

        // 1. Get the text
        let textToScan = targetElement.textContent || targetElement.innerText || "";

        // 2. Try to find a URL
        let url = "";
        if (container.tagName === 'A' && container.href) {
            url = container.href;
        } else if (container.querySelector('a')) {
            url = container.querySelector('a').href;
        }

        // 3. Append URL if found and not already in text
        if (url && !textToScan.includes(url)) {
            textToScan += "\n\nScam Link: " + url;
        }

        // Send to background script
        chrome.runtime.sendMessage({
            action: 'scanDetail',
            text: textToScan
        });
    };

    warningDiv.appendChild(detailBtn);
    warningDiv.appendChild(ignoreBtn);

    // Try to append slightly after the element or inside it
    container.appendChild(warningDiv);
}

/**
 * Scans a single text content
 */
function checkScam(text, node) {
    if (!text || text.length < 5) return;

    if (window.ScamDetector && window.ScamDetector.isScam(text)) {
        // console.log("SCAM DETECTED:", text);
        addWarning(node);
    }
}

/**
 * Auto-fill logic for axrn.in
 */
function handleAxrnAutoFill() {
    if (window.location.hostname.includes('axrn.in')) {
        chrome.storage.local.get(['scanText'], (result) => {
            if (result.scanText) {
                // Try to find the input field (Heuristic: usually the first textarea or input type text)
                const inputField = document.querySelector('textarea') || document.querySelector('input[type="text"]');

                if (inputField) {
                    inputField.value = result.scanText;
                    inputField.dispatchEvent(new Event('input', { bubbles: true }));
                    inputField.focus();

                    // Clear storage to prevent auto-filling on next visit
                    chrome.storage.local.remove('scanText');
                } else {
                    // Fallback: Copy to clipboard not possible without user interaction in this context easily
                    // But we can alert the user
                    console.log("ScamShield: Could not find input field on axrn.in");
                }
            }
        });
    }
}

/**
 * Deep Scan of the entire page using TreeWalker
 * This finds ALL text, regardless of class names.
 */
function scanPageAggressive() {
    // Run auto-fill if on axrn.in
    handleAxrnAutoFill();

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                if (!isValidNode(node)) return NodeFilter.FILTER_REJECT;
                if (node.parentElement && node.parentElement.offsetParent === null) return NodeFilter.FILTER_REJECT; // Hidden
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let node;
    while (node = walker.nextNode()) {
        // Skip if parent already scanned 
        if (node.parentElement.hasAttribute(CONFIG.scannedAttribute)) continue;

        // Check text
        checkScam(node.textContent, node);

        // Mark parent as scanned to avoid checking same text repeatedly in this loop
        // (We rely on Observer for new stuff)
        // node.parentElement.setAttribute(CONFIG.scannedAttribute, 'true'); 
    }
}

// Observer for real-time updates
const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0 || mutation.type === 'characterData') {
            shouldScan = true;
            break;
        }
    }
    if (shouldScan) {
        scanPageAggressive();
    }
});

if (window.ScamDetector) {
    // Initial Scan
    scanPageAggressive();

    // Start Observer
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Periodic Cleanup/Rescan (Optional backup)
    setInterval(scanPageAggressive, 3000);
}

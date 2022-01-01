const connections = {};
let openCount = 0;
chrome.runtime.onConnect.addListener(function(port) {
    if (port.name !== "devtools-page") {
        return;
    }
    // assign the listener function to a variable so we can remove it later
    function onMessageListener(message, sender, sendResponse) {
        // The original connection event doesn't include the tab ID of the
        // DevTools page, so we need to send it explicitly.
        if (message.name == "init") {
            connections[message.tabId] = port;
            return;
        }
    }
    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(onMessageListener);
    port.onDisconnect.addListener(function removeDevTools() {
        port.onMessage.removeListener(onMessageListener);
        const tabs = Object.keys(connections);
        for (let i=0, len=tabs.length; i < len; i++) {
            if (connections[tabs[i]] == port) {
                delete connections[tabs[i]]
                break;
            }
        }
        openCount--;
        if (openCount == 0) {
            console.log("Last DevTools window closing.");
        }
    });
    if (openCount == 0) {
        console.log("DevTools window opening.");
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {name: "onDevToolsOpen"});
    });
    openCount++;
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (sender.tab) {
        const tabId = sender.tab.id;
        if (tabId in connections) {
            console.log("Sending message to tab",tabId,request);
            connections[tabId].postMessage(request);
        } else {
            console.log("Tab not found in connection list.");
        }
    } else {
        console.log("sender.tab not defined.");
    }
    return true;
});

window.addEventListener('message', function(event) {
    // Only accept messages from the same frame
    if (event.source !== window) {
        return;
    }
    const message = event.data;
    // Only accept messages that we know are ours
    if (typeof message !== 'object' || message === null ||
        !message.source === 'use-function-state-devtools') {
        return;
    }
    // we need to call window.postMessage({state:state,source:'use-function-state-devtools'},'*');
    chrome.runtime.sendMessage(message);
});

chrome.runtime.onMessage.addListener((message) => {
    if(message.name === 'onDevToolsOpen'){
        window.dispatchEvent(new CustomEvent('usefunctionstatedevtoolsopen'));
    }
});
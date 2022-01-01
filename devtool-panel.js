$(function() {
    let lastMessage = undefined;
    function renderJson(input) {
        if(!input){
            input = lastMessage;
        }
        const options = {
            collapsed: $('#collapsed').is(':checked'),
            rootCollapsable: $('#root-collapsable').is(':checked'),
            withQuotes: $('#with-quotes').is(':checked'),
            withLinks: $('#with-links').is(':checked')
        };
        $('#json-renderer').jsonViewer(input, options);
        lastMessage = input;
    }

    const backgroundPageConnection = chrome.runtime.connect({name: "devtools-page"});

    backgroundPageConnection.postMessage({
        name: 'init',
        tabId: chrome.devtools.inspectedWindow.tabId
    });

    backgroundPageConnection.onMessage.addListener(function (message) {
        renderJson(message);
    });

    // Generate on option change
    $('p.options input[type=checkbox]').click(() => renderJson());

    // Display JSON sample on page load
    renderJson({message:'Nothing in useFunctionState'});
});
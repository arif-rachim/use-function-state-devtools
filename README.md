# useFunctionState DevTools

useFunctionState DevTools is a small Chrome extension, first committed in January 2022, that adds a **FunctionState** panel to Chrome DevTools for watching the state of a web app that uses a `useFunctionState` hook. A state hook keeps its data inside the running page, where it is hard to see while debugging. This extension lets the page push a snapshot of that state out through `window.postMessage`, and shows the latest snapshot in DevTools as a JSON tree you can expand and collapse. It is meant for developers debugging an app that already publishes its state in this format; the hook itself is not part of this repo. The extension is plain JavaScript on Manifest V2, with no build step. It has a content script, a background page that routes messages to the DevTools panel of the matching tab, and the jQuery JSON Viewer plugin for rendering. It is a prototype with no tests.

> Status: prototype (Manifest V2), last changed in 2022.

## Features

- DevTools panel named **FunctionState** that renders the most recent state message as a JSON tree
- Viewer options on the panel: collapse nodes, make the root collapsible, quote keys, turn URL values into links
- Messages are routed per tab, so each DevTools window shows only its own page's state
- A `usefunctionstatedevtoolsopen` event is sent to the page when DevTools opens, so the page can send its current state right away
- `example.html` test page that sends sample messages

## Tech stack

JavaScript · Chrome Extensions (Manifest V2, DevTools API) · jQuery · jQuery JSON Viewer

## Getting started

There is nothing to install or build.

1. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select this folder.
2. Serve the folder over HTTP, because the content script only runs on `http://` and `https://` pages, not `file://`. For example:

   ```bash
   python3 -m http.server 8000
   ```

3. Open `http://localhost:8000/example.html`, open DevTools, and go to the **FunctionState** panel.
4. Click **Send message to devtools** on the page to send a test message.

Manifest V2 extensions are being phased out of Chrome, so current Chrome versions may refuse to load it.

## Usage

To publish state from your app, post a message whose `source` is `use-function-state-devtools`:

```javascript
window.postMessage({ state, source: 'use-function-state-devtools' }, '*');

// Send the current state again when DevTools opens
window.addEventListener('usefunctionstatedevtoolsopen', () => {
  window.postMessage({ state, source: 'use-function-state-devtools' }, '*');
});
```

The whole message object is shown in the panel.

## How it works

1. `content_script.js` runs on every http(s) page. It listens for `message` events from the same window and forwards them with `chrome.runtime.sendMessage`.
2. `background.js` keeps a map of tab ID to DevTools connection. It relays each message to the DevTools panel for the tab it came from. When a DevTools panel connects, it tells the active tab's content script, which dispatches `usefunctionstatedevtoolsopen` on the page.
3. `devtools.js` registers the panel. `devtool-panel.js` connects to the background page, sends its tab ID, and renders each incoming message with `jsonViewer`.

## Project structure

```text
manifest.json          extension manifest (MV2)
background.js          routes messages from pages to DevTools panels
content_script.js      forwards page messages to the extension
devtools.html/.js      registers the FunctionState panel
devtool-panel.html/.js panel UI and JSON rendering
lib/json-viewer/       jQuery and jQuery JSON Viewer
example.html           test page
```

## Limitations

- The check on `message.source` in `content_script.js` is written as `!message.source === '...'`, which is always false. As a result, every object posted to the window is forwarded to the panel, not only messages from `useFunctionState`.
- Only the latest message is shown. There is no history or diffing.
- Manifest V2 only.

# useFunctionState DevTools

A Chrome DevTools extension for inspecting app state published by the `useFunctionState` hook. It adds a panel to DevTools that shows the state messages the page sends, displayed as a JSON tree you can explore.

> Status: prototype (Manifest V2).

## How it works

- The page sends state with `window.postMessage({ ..., source: 'use-function-state-devtools' }, '*')`.
- `content_script.js` passes those messages to the extension through `background.js`.
- The DevTools panel (`devtool-panel.html`) shows them using a jQuery JSON viewer.
- When the panel opens, the page receives a `usefunctionstatedevtoolsopen` event so it can send its current state.

## Try it

1. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select this folder.
2. Open `example.html`, open DevTools, and go to the **Function State** panel.
3. Click the button on the page to send a test message.

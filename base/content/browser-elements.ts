/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/AppConstants.sys.mjs"
);

let elements = {
    "browser-tab": "chrome://dot/content/widgets/browser-tab.js",
    "browser-panel": "chrome://dot/content/widgets/browser-panel.js",
    "browser-frame": "chrome://dot/content/widgets/browser-frame.js",
    "browser-status": "chrome://dot/content/widgets/browser-status.js",
    "browser-modals": "chrome://dot/content/widgets/browser-modals.js",
    "browser-content-popup": "chrome://dot/content/widgets/browser-content-popup.js",
    "browser-window-controls": "chrome://dot/content/widgets/browser-window-controls.js",
}

// Define developer-only elements
// Locked behind MOZILLA_OFICIAL so they don't end up in release builds
if (!AppConstants.MOZILLA_OFFICIAL) {
    elements = {
        ...elements,
        "dev-debug-panel": "chrome://dot/content/widgets/dev-debug-panel.js"
    } as any;
}

for (const [element, chromeURI] of Object.entries(elements)) {
    customElements.setElementCreationCallback(element, () => {
        Services.scriptloader.loadSubScript(
            chromeURI,
            window
        );
    });
}
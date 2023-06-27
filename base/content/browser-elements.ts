/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

customElements.setElementCreationCallback("browser-tab", () => {
    Services.scriptloader.loadSubScript(
        "chrome://dot/content/browser-tab.js",
        window
    );
});

customElements.setElementCreationCallback("browser-panel", () => {
    Services.scriptloader.loadSubScript(
        "chrome://dot/content/browser-panel.js",
        window
    );
});

customElements.setElementCreationCallback("browser-frame", () => {
    Services.scriptloader.loadSubScript(
        "chrome://dot/content/browser-frame.js",
        window
    );
});

customElements.setElementCreationCallback("browser-status", () => {
    Services.scriptloader.loadSubScript(
        "chrome://dot/content/browser-status.js",
        window
    );
});

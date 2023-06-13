/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

customElements.setElementCreationCallback("browser-tab", () => {
    Services.scriptloader.loadSubScript(
        "chrome://dot/content/browser-tab.js",
        window
    );
});

customElements.setElementCreationCallback("browser-statuspanel", () => {
    Services.scriptloader.loadSubScript(
        "resource://dot/components/browser-element/content/StatusPanel.js",
        window
    );
});

customElements.setElementCreationCallback("browser-panel", () => {
    Services.scriptloader.loadSubScript(
        "resource://dot/components/panel/Panel.js",
        window
    );
});
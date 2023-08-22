/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIWebProgress} nsIWebProgress
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIRequest} nsIRequest
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIChannel} nsIChannel
 */

var { BrowserTabsUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

class BrowserReloadButton extends HTMLButtonElement {
    constructor() {
        super();
    }

    /**
     * The currently selected browser
     */
    get browser() {
        const tab = gDot.tabs.selectedTab;

        if (!gDot.tabs._isWebContentsBrowserElement(tab.webContents)) {
            return null;
        }

        return /** @type {ChromeBrowser} */ (tab.webContents);
    }

    /**
     * The icon for the relaod button
     * @returns {BrowserIcon}
     */
    get icon() {
        return this.querySelector("browser-icon");
    }

    connectedCallback() {
        this.appendChild(html("browser-icon", { name: "reload" }));

        this.addEventListener("click", this);
        window.addEventListener("BrowserTabs::BrowserStateChange", this);
    }

    handleReload(cached = false) {
        gDotCommands.execCommand(
            "browsing.reload_stop_page",
            { browser: this.browser, cached }
        );
    }

    /**
     * Fired when the state changes a browser
     * @param {object} data
     * @param {ChromeBrowser} data.browser
     * @param {nsIWebProgress} data.webProgress
     * @param {nsIRequest} data.request
     * @param {number} data.stateFlags
     * @param {string} data.status
     */
    onStateChanged({ browser, webProgress, request, stateFlags, status }) {
        const { STATE_START, STATE_IS_NETWORK } = Ci.nsIWebProgressListener;

        this.icon.name = (
            webProgress.isTopLevel &&
            stateFlags & STATE_START &&
            stateFlags & STATE_IS_NETWORK &&
            BrowserTabsUtils.shouldShowProgress(/** @type {nsIChannel} */(request))
        ) ? "close" : "reload";
    }

    /**
     * Handle incoming events
     * @param {MouseEvent | CustomEvent} event 
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":
                this.handleReload(/** @type {MouseEvent} */(event).shiftKey);
                break;
            case "BrowserTabs::BrowserStateChange":
                this.onStateChanged(event.detail);
                break;
        }
    }

    disconnectedCallback() {
        this.removeEventListener("click", this);
        window.removeEventListener("BrowserTabs::BrowserStateChange", this);
    }
}

customElements.define("reload-button", BrowserReloadButton, { extends: "button" });
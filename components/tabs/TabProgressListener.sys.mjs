/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIWebProgress} nsIWebProgress
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIRequest} nsIRequest
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 */

function fireBrowserStatusChange(browser, data) {
    const win = browser.ownerGlobal;

    const evt = new CustomEvent(win.gDot.tabs.EVENT_BROWSER_STATUS_CHANGE, {
        detail: data
    });

    browser.dispatchEvent(evt);
}

export class TabProgressListener {
    QueryInterface = ChromeUtils.generateQI(["nsIWebProgressListener"]);

    /**
     * The tab attached to this progress listener
     * @type {BrowserTab}
     */
    tab = null;

    /**
     * The browser element attached to this progress listener
     * @type {ChromeBrowser}
     */
    browser = null;

    /**
     * The window attached to this progress listener
     */
    get win() {
        return this.browser.ownerGlobal;
    }

    /**
     * @param {BrowserTab} tab
     * @param {ChromeBrowser} browser
     */
    constructor(tab, browser) {
        this.tab = tab;
        this.browser = browser;
    }

    /**
     * Fired when the status of the browser is updated
     * @param {nsIWebProgress} webProgress
     * @param {nsIRequest} request
     * @param {number} status
     * @param {string} message
     */
    onStatusChange(webProgress, request, status, message) {
        console.log("TabProgressListener::onStatusChange", webProgress, request, status, message);

        fireBrowserStatusChange(this.browser, {
            webProgress,
            request,
            status,
            message,
            type: "busy"
        });
    }

    /**
     * Fired when the location of the browser is changed
     * @param {nsIWebProgress} webProgress
     * @param {nsIRequest} request
     * @param {nsIURI} locationURI
     * @param {number} flags
     * @param {boolean} isSimulated
     */
    onLocationChange(webProgress, request, locationURI, flags, isSimulated) {
        // We only care about the top level location changes
        // Any changes to subframes should be ignored
        if (!webProgress.isTopLevel) return;

        console.log(
            "TabProgressListener::onLocationChange",
            webProgress,
            request,
            locationURI,
            flags,
            isSimulated
        );
    }

    /**
     * Fired when the state of the browser changes
     * @param {nsIWebProgress} webProgress
     * @param {nsIRequest} request
     * @param {number} stateFlags
     * @param {number} status
     */
    onStateChange(webProgress, request, stateFlags, status) {
        const { STATE_START, STATE_STOP, STATE_IS_NETWORK } = Ci.nsIWebProgressListener;

        console.log("TabProgressListener::onStateChange", webProgress, request, stateFlags, status);

        const win = this.browser.ownerGlobal;

        if (stateFlags & STATE_START && stateFlags & STATE_IS_NETWORK) {
            win.gDot.tabs.isBusy = true;
        } else if (stateFlags & STATE_STOP) {
            win.gDot.tabs.isBusy = false;

            fireBrowserStatusChange(this.browser, {
                message: "",
                type: "busy"
            });
        }
    }
}

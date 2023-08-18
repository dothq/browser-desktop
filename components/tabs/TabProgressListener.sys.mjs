/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIWebProgress} nsIWebProgress
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIRequest} nsIRequest
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIChannel} nsIChannel
 */

function fireBrowserEvent(event, browser, data) {
    const evt = new CustomEvent(`BrowserTabs::${event}`, {
        detail: data
    });

    browser.dispatchEvent(evt);
}

/**
 * Determines whether we should show the 
 * progress spinner for a particular page
 * @param {nsIChannel} request 
 * @returns 
 */
function shouldShowProgress(request) {
    return !(
        // @ts-ignore
        request instanceof Ci.nsIChannel &&
        request.originalURI.schemeIs("about")
    )
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

        fireBrowserEvent("BrowserStatusChange", this.browser, {
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
        const evt = new CustomEvent("BrowserTabs::LocationChange", {
            detail: {
                webProgress,
                request,
                locationURI,
                flags,
                isSimulated
            }
        });
        this.win.dispatchEvent(evt);

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
        const { TAB_PROGRESS_NONE, TAB_PROGRESS_BUSY } = this.tab;

        console.log("TabProgressListener::onStatusChange", webProgress, request, stateFlags, status);
        console.log("REMOTE_TYPE", this.browser.remoteType);

        const win = this.browser.ownerGlobal;

        if (stateFlags & STATE_START && stateFlags & STATE_IS_NETWORK) {
            if (webProgress && webProgress.isTopLevel) {
                this.tab.progress = TAB_PROGRESS_BUSY;
                this.tab.updateLabel("");
            }

            if (this.tab.selected) {
                win.gDot.tabs.isBusy = true;
            }
        } else if (stateFlags & STATE_STOP) {
            if (this.tab.progress) {
                this.tab.progress = TAB_PROGRESS_NONE;
            }

            if (this.tab.selected) {
                win.gDot.tabs.isBusy = false;
            }
        }
    }

    /**
     * Fired when the progress of the browser changes
     * @param {nsIWebProgress} webProgress 
     * @param {nsIRequest} request 
     * @param {number} curSelfProgress 
     * @param {number} maxSelfProgress 
     * @param {number} curTotalProgress 
     * @param {number} maxTotalProgress 
     */
    onProgressChange(
        webProgress,
        request,
        curSelfProgress,
        maxSelfProgress,
        curTotalProgress,
        maxTotalProgress
    ) {
        const { TAB_PROGRESS_TRANSIT } = this.tab;

        const totalProgress = maxTotalProgress
            ? curTotalProgress / maxTotalProgress
            : 0;

        if (!shouldShowProgress(/** @type {nsIChannel} */(request))) {
            return;
        }

        if (totalProgress && this.tab.progress) {
            this.tab.progress = TAB_PROGRESS_TRANSIT;
        }

        if (curTotalProgress && maxTotalProgress) {
            this.tab.progressPercent = curTotalProgress / maxTotalProgress;
        }
    }
}

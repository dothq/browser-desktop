/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/AppConstants.sys.mjs"
);

const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
)

/** @type {Set<Window>} */
let _trackedWindows = new Set();

export const DotWindowTracker = {
    get windowCount() {
        return _trackedWindows.size;
    },

    /**
     * Tracks a browser window
     * @param {Window} win 
     */
    track(win) {
        if (_trackedWindows.has(win)) return;

        _trackedWindows.add(win);
    },

    /**
     * Launches a new browser window
     * @param {object} options
     * @param {boolean} [options.isPrivate]
     * @param {string} [options.features]
     * @param {any} [options.args]
     * @returns 
     */
    openWindow({
        isPrivate = false,
        features = undefined,
        args = null,
    } = {}) {
        let windowFeatures = ["chrome", "dialog=no", "all"];

        if (features) {
            windowFeatures = windowFeatures.concat(features.split(","));
        }

        if (isPrivate) {
            windowFeatures.push("private");
        }

        return Services.ww.openWindow(
            null,
            AppConstants.BROWSER_CHROME_URL,
            "_blank",
            windowFeatures.join(","),
            args
        );
    },

    /**
     * Get all tracked windows
     * This shouldn't be used to fetch a particular window, see getTopWindow
     * @returns {Set<Window>}
     */
    getWindows() {
        return _trackedWindows;
    },

    /**
     * Get the most recent window
     * @param {object} options
     * @param {boolean} [options.allowPopups]
     * @param {boolean} [options.private]
     */
    getTopWindow(options = {}) {
        for (const win of _trackedWindows) {
            if (
                !win.closed && // Make sure the window is still open
                (options.allowPopups || !win.document.documentElement.hasAttribute("chromepopup")) &&
                (
                    !("private" in options) ||
                    PrivateBrowsingUtils.permanentPrivateBrowsing ||
                    PrivateBrowsingUtils.isWindowPrivate(win) == options.private
                )
            ) {
                return win;
            }
        }

        return null;
    },

    /**
     * Get a webContents by its ID
     * @param {number} id 
     */
    getWebContentsById(id) {
        for (const win of _trackedWindows) {
            for (const tab of win.gDot.tabs.list) {
                if (tab.webContentsId == id) {
                    return tab.webContents;
                }
            }
        }

        return null;
    }
}
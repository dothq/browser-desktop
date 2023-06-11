/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** 
 * @typedef {import("./content/browser-tab").BrowserTab} BrowserTab 
 */

/**
 * Oversees control over all tabs in the current browser window
 */
export const BrowserTabs = {
    /** @type {Map<number, BrowserTab>} */
    _tabs: new Map(),

    /**
     * All currently open tabs in the browser
     */
    get list() {
        const sup = this;

        // Dynamically generate the list using a Proxy
        return new Proxy([], {
            has: (target, name) => {
                if (typeof name == "string" && Number.isInteger(parseInt(name))) {
                    return name in sup._tabs;
                }

                return false;
            },
            get: (target, name) => {
                if (name == "length") return sup.tabs.size;

                if (typeof name == "string" && Number.isInteger(parseInt(name))) {
                    if (!(name in sup.tabs)) {
                        return undefined;
                    }

                    return sup.tabs[name].linkedBrowser;
                }

                return target[name];
            },
        })
    },

    /**
     * The number of open tabs in the browser
     */
    get length() {
        return this.list.length;
    },

    _selectedTab: null,

    /**
     * The currently selected tab
     * @type {BrowserTab}
     */
    get selectedTab() {
        return this._selectedTab;
    },

    /**
     * Updates the currently selected tab in the browser
     * @param {BrowserTab} tab 
     */
    set selectedTab(tab) {
        this._selectedTab = tab;
    },

    /**
     * Initialises and creates the <tab> element
     * @private
     * @param {*} uriString
     * @param {*} options
     * @returns {BrowserTab}
     */
    _addTab(uriString, options) {
        const el = document.createElement("browser-tab");

        return el;
    },

    /**
     * Creates a new tab
     *
     * @param {string} uriString
     * @param {object} options
     */
    createTab(uriString, options) {
        const tabEl = this._addTab(uriString, options);
        this.selectedTab = tabEl;
    },

    /**
     * Find a tab using its <xul:browser> element
     * @param {import("third_party/dothq/gecko-types/lib").ChromeBrowser} browser 
     */
    getTabForBrowser(browser) {
        return this._tabs.get(browser.browserId);
    }
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Oversees control over all tabs in the current browser window
 */
export const BrowserTabs = {
    EVENT_TAB_SELECT: "BrowserTabs::TabSelect",

    /** @type {Window} */
    _win: null,

    /** @type {number} */
    _uniqueTabIdCounter: null,

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
                // Get using index notation
                if (typeof name == "string" && Number.isInteger(parseInt(name))) {
                    return sup._tabs.has(Array.from(sup._tabs.keys())[name]);
                }

                return false;
            },
            get: (target, name) => {
                if (name == "length") return sup._tabs.size;

                if (typeof name == "string" && Number.isInteger(parseInt(name))) {
                    if (!Array.from(sup._tabs.keys())[name]) {
                        return undefined;
                    }

                    return sup._tabs.get(Array.from(sup._tabs.keys())[name]);
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

        this._dispatchEvent(this.EVENT_TAB_SELECT, { detail: tab });
    },

    get _tabslistEl() {
        return this._win.document.getElementById("tabslist")
    },

    /**
     * Initialises and creates the <tab> element
     * @private
     * @param {*} uriString
     * @param {*} options
     * @returns {BrowserTab}
     */
    _addTab(uriString, options) {
        /** @type {BrowserTab} */
        // @ts-ignore
        const el = this._win.document.createElement("browser-tab");

        el.id = this._generateUniqueTabID();

        return el;
    },

    /**
     * Dispatches an event to the `document`.
     * @param {string} type
     * @param {CustomEventInit} options
     */
    _dispatchEvent(type, options) {
        const ev = new CustomEvent(type, options);

        this._win.document.dispatchEvent(ev);
    },

    /**
     * Generates a unique ID to be used on the tab
     */
    _generateUniqueTabID() {
        if (!this._uniqueTabIdCounter) {
            this._uniqueTabIdCounter = 0;
        }

        const { outerWindowID } = this._win.docShell;

        return `tab-${outerWindowID}-${++this._uniqueTabIdCounter}`;
    },

    /**
     * Creates a new tab
     *
     * @param {string} uriString
     * @param {object} options
     */
    createTab(uriString, options) {
        const tabEl = this._addTab(uriString, options);

        const li = this._win.document.createElement("li");
        li.appendChild(tabEl);

        this._tabslistEl.appendChild(li);

        this.selectedTab = tabEl;
    },

    /**
     * Find a tab using its <xul:browser> element
     * @param {import("third_party/dothq/gecko-types/lib").ChromeBrowser} browser 
     */
    getTabForBrowser(browser) {
        return this._tabs.get(browser.browserId);
    },

    /**
     * Initialises the BrowserTabs 
     * @param {Window} win 
     */
    init(win) {
        this._win = win;

        this._win.MozXULElement.insertFTLIfNeeded("dot/tabs.ftl");
    }
};

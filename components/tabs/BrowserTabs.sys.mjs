/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabProgressListener } = ChromeUtils.importESModule(
    "resource://gre/modules/TabProgressListener.sys.mjs"
);

const { E10SUtils } = ChromeUtils.importESModule("resource://gre/modules/E10SUtils.sys.mjs");

const { NavigationHelper } = ChromeUtils.importESModule(
    "resource://gre/modules/NavigationHelper.sys.mjs"
);

/**
 * Clamps a number between a min and max value
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Ensure that these icons match up with the actual page favicon
// Reflect any changes here with base/content/browser-init.ts
const INITIAL_FAVICONS = {
    "about:home": "chrome://dot/skin/home.svg",
    "about:newtab": "chrome://dot/skin/home.svg",
    "about:welcome": "chrome://branding/content/icon32.png",
    "about:privatebrowsing": "chrome://browser/skin/privatebrowsing/favicon.svg"
};

const {
    LOAD_FLAGS_NONE,
    LOAD_FLAGS_FROM_EXTERNAL,
    LOAD_FLAGS_FIRST_LOAD,
    LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL,
    LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP,
    LOAD_FLAGS_FIXUP_SCHEME_TYPOS,
    LOAD_FLAGS_FORCE_ALLOW_DATA_URI,
    LOAD_FLAGS_DISABLE_TRR
} = Ci.nsIWebNavigation;

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").ChromeBrowser} ChromeBrowser
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIWebProgress} nsIWebProgress
 * @typedef {import("components/tabs/TabProgressListener.sys.mjs").TabProgressListener} TabProgressListener
 */

/**
 * Oversees control over all tabs in the current browser window
 */
export const BrowserTabs = {
    EVENT_TAB_SELECT: "BrowserTabs::TabSelect",

    /** @type {Window} */
    _win: null,

    /** @type {number} */
    _uniqueTabIdCounter: null,

    /** @type {number} */
    _uniquePanelIdCounter: null,

    /** A mapping between webContentsId -> BrowserTab
     * @type {Map<number, BrowserTab>}
     * */
    _tabs: new Map(),

    /**
     * A mapping between BrowserTab -> TabProgressListener
     * @type {Map<BrowserTab, TabProgressListener>}
     */
    _tabListeners: new Map(),

    /**
     * A mapping between BrowserTab -> nsIWebProgress
     * @type {Map<BrowserTab, nsIWebProgress>}
     */
    _tabFilters: new Map(),

    /**
     * All currently open tabs in the browser
     * @returns {BrowserTab[]}
     */
    get list() {
        // @ts-ignore
        return Array.from(this._tabslistEl.children).map((child) => child);
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

        for (const t of this.list) {
            t.webContentsPanel.hidden = this._selectedTab.id !== t.id;
        }

        this._dispatchEvent(this.EVENT_TAB_SELECT, { detail: tab });
    },

    get _tabslistEl() {
        return this._win.document.getElementById("tabslist");
    },

    get _tabpanelBoxEl() {
        return this._win.document.getElementById("tabspanel");
    },

    /**
     * Initialises and creates the <tab> element
     * @private
     * @returns {BrowserTab}
     */
    _createTabElement() {
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
     * Generates a unique ID to be used on the browser panel
     */
    _generateUniquePanelID() {
        if (!this._uniquePanelIdCounter) {
            this._uniquePanelIdCounter = 0;
        }

        const { outerWindowID } = this._win.docShell;

        return `panel-${outerWindowID}-${++this._uniquePanelIdCounter}`;
    },

    /**
     * Creates a new MozBrowser
     *
     * @param {object} options - Browser Options
     * @param {boolean} [options.initiallyActive] - Determines whether the browser should be active when initialised
     * @param {number} [options.userContextId] - Determines what user context (container) to use for this browser
     * @param {any} [options.openWindowInfo] - Information relating to the opened window?
     * @param {string} [options.name] - Controls the name of the opened window?
     * @param {boolean} [options.uriIsAboutBlank] - Determines whether the URI is about:blank
     * @param {boolean} [options.skipLoad] - Skips initial loading of about:blank
     * @param {nsIURI} [options.uri] - The URI to load into the browser
     * @param {string} [options.preferredRemoteType] - The preferred remote type to use when loading this browser
     * @param {ChromeBrowser} [options.openerBrowser] - The existing browser element that opened this new browser
     * @param {any} [options.referrerInfo] - Information relating to the referrer of this browser
     * @param {boolean} [options.forceNotRemote] - Force a not remote state onto the browser
     */
    _createBrowser(options) {
        if (!options.preferredRemoteType && options.openerBrowser) {
            options.preferredRemoteType = options.openerBrowser.remoteType;
        }

        const originAttributes = E10SUtils.predictOriginAttributes({
            window: this._win,
            userContextId: options.userContextId
        });

        const remoteType = options.forceNotRemote
            ? E10SUtils.NOT_REMOTE
            : E10SUtils.getRemoteTypeForURI(
                options.uri.spec,
                this._win.gDot.isMultiProcess,
                this._win.gDot.usesRemoteSubframes,
                options.preferredRemoteType,
                null,
                originAttributes
            );

        const browser = this._win.document.createXULElement("browser");

        browser.permanentKey = new (Cu.getGlobalForObject(Services).Object)();

        const attributes = {
            message: "true",
            messagemanagergroup: "browsers",
            type: "content"
        };

        for (const key in attributes) {
            browser.setAttribute(key, attributes[key]);
        }

        if (this._win.gDot.isMultiProcess) browser.setAttribute("maychangeremoteness", "true");

        browser.setAttribute("remoteType", remoteType);
        browser.setAttribute("remote", "true");

        if (!options.initiallyActive) {
            browser.setAttribute("initiallyactive", "false");
        }

        if (options.userContextId) {
            browser.setAttribute("usercontextid", options.userContextId.toString());
        }

        if (options.openWindowInfo) {
            browser.openWindowInfo = options.openWindowInfo;
        }

        if (options.name) {
            browser.setAttribute("name", options.name);
        }

        if (!options.uriIsAboutBlank || options.skipLoad) {
            browser.setAttribute("nodefaultsrc", "true");
        }

        return browser;
    },

    /**
     * Creates a new tab
     *
     * @param {object} options - Tab Options - most of these options aren't needed, but are here for the sake of compatibility
     * @param {string} [options.uri] - The URI to load
     * @param {ChromeBrowser | Element} [options.webContents] - The tab's webContents
     * @param {any} options.triggeringPrincipal - The triggering principal to use for this tab
     * @param {string} [options.openerTabId] - The tab that opened this new tab
     * @param {string} [options.title] - The initial title to use for this tab
     * @param {string} [options.preferredRemoteType] - The preferred remote type to use to load this page
     * @param {number} [options.userContextId] - The user context ID (container) to use for this tab
     * @param {boolean} [options.pinned] - Whether the tab should be pinned or not
     * @param {number} [options.index] - Position of the tab in the tablist
     * @param {any} [options.referrerInfo] - Information relating to the referrer of this browser
     * @param {boolean} [options.forceNotRemote] - Force a not remote state onto the browser
     * @param {any} [options.openWindowInfo] - Information relating to the opened window?
     * @param {boolean} [options.inBackground] - Determines whether the tab should be opened in the background or foreground
     * @param {any} [options.originPrincipal] - The origin principal used to load this tab
     * @param {any} [options.originStoragePrincipal] - The origin storage principal used for this tab
     * @param {boolean} [options.allowInheritPrincipal] - Whether the tab is allowed to inherit the principal
     * @param {boolean} [options.skipLoad] - Skip loading anything into the tab
     * @param {boolean} [options.allowThirdPartyFixup] - Allow transforming the url into a search query
     * @param {string} [options.triggeringRemoteType] - The remoteType triggering this load
     * @param {any} [options.csp] - The CSP that should apply to the load
     * @param {object} [options.globalHistoryOptions] - Used by places to keep track of search related metadata for loads
     * @param {boolean} [options.fromExternal] - Indicates the load was started outside of the browser, e.g. passed on the commandline or through OS mechanisms
     * @param {boolean} [options.disableTRR] - Disables TRR for resolving host names
     * @param {boolean} [options.forceAllowDataURI] - Allows for data: URI navigation
     * @param {any} [options.postData] - The POST data to submit with the returned URI (see nsISearchSubmission).
     */
    createTab(options) {
        if (!options.triggeringPrincipal) {
            throw new Error("Required 'triggeringPrincipal' in createTab options.");
        }

        // If we happen to not have a uriString, default to about:blank
        if (!options.uri) {
            options.uri = "about:blank";
        }

        let uri;

        try {
            uri = Services.io.newURI(options.uri);
        } catch (e) { }

        const tabEl = this._createTabElement();

        const openerTab = options.openerTabId ? this.getTabByTabId(options.openerTabId) : null;

        // If this new tab was opened by another existing tab, make
        // sure we tell the new tab who opened this to dictate the
        // position/index of the tab in the tablist.
        if (openerTab) {
            tabEl._openerTab = openerTab;
        }

        // If we have an openerTab, we will want to pass the opener's
        // user context ID to the new tab to avoid leakage and maintain
        // containerisation across related tabs.
        if (options.userContextId == null && openerTab) {
            options.userContextId = parseInt(openerTab.getAttribute("usercontextid")) || 0;
        }

        if (options.userContextId) {
            tabEl.userContextId = options.userContextId;
        }

        if (options.pinned && options.pinned == true) {
            tabEl.pinned = true;
        }

        const uriIsAboutBlank = options.uri == "about:blank";

        // Wrap in a try-catch so we can recover in the event of an error
        try {
            // Insert the tab into its position in the tablist
            this.insertTabAt(tabEl, { index: options.index, openerTab });

            // If we didn't provide webContents when creating the tab,
            // we can build a browser element to swap in.
            if (!options.webContents) {
                const openerBrowser =
                    openerTab &&
                        openerTab.webContents &&
					/** @type {ChromeBrowser} */ (openerTab.webContents).browserId
                        ? openerTab.webContents
                        : null;
                const { preferredRemoteType, referrerInfo, forceNotRemote, openWindowInfo } =
                    options;

                options.webContents = this._createBrowser({
                    uri,
                    preferredRemoteType,
					/** @type {any} */ openerBrowser,
                    uriIsAboutBlank,
                    referrerInfo,
                    forceNotRemote,
                    openWindowInfo
                });

                this._setInitialIcon(tabEl, uri.spec);
            }

            this._insertTabWebContents(tabEl, options.webContents);
        } catch (e) {
            console.error("Error while creating tab!");
            console.error(e);
            if (tabEl.webContentsPanel) {
                tabEl.webContentsPanel.remove();
            }
            tabEl.remove();
            // @todo: unload browser and listeners
            return null;
        }

        this._dispatchEvent(this.EVENT_TAB_CREATE, { detail: tabEl });

        // We should only consider loading anything into the tab if the webContents are a browser element
        if (this._isWebContentsBrowserElement(tabEl.webContents)) {
            if (options.originPrincipal && options.originStoragePrincipal && options.uri) {
                // Unless we know for sure we're not inheriting principals,
                // force the about:blank viewer to have the right principal:
                if (
                    !uri ||
                    Services.io.getDynamicProtocolFlags(uri) &
                    Ci.nsIProtocolHandler.URI_INHERITS_SECURITY_CONTEXT
                ) {
					/** @type {ChromeBrowser} */ (tabEl.webContents).createAboutBlankContentViewer(
                    options.originPrincipal,
                    options.originStoragePrincipal
                );
                }
            }

            if ((!uriIsAboutBlank || !options.allowInheritPrincipal) && !options.skipLoad) {
                let flags = LOAD_FLAGS_NONE;
                if (options.allowThirdPartyFixup) {
                    flags |= LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP | LOAD_FLAGS_FIXUP_SCHEME_TYPOS;
                }
                if (options.fromExternal) flags |= LOAD_FLAGS_FROM_EXTERNAL;
                if (!options.allowInheritPrincipal) flags |= LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL;
                if (options.disableTRR) flags |= LOAD_FLAGS_DISABLE_TRR;
                if (options.forceAllowDataURI) flags |= LOAD_FLAGS_FORCE_ALLOW_DATA_URI;

                try {
					/** @type {ChromeBrowser} */ (tabEl.webContents).fixupAndLoadURIString(
                    options.uri,
                    {
                        flags,
                        triggeringPrincipal: options.triggeringPrincipal,
                        referrerInfo: options.referrerInfo,
                        postData: options.postData,
                        csp: options.csp,
                        globalHistoryOptions: options.globalHistoryOptions,
                        triggeringRemoteType: options.triggeringRemoteType
                    }
                );
                } catch (e) {
                    console.error("Failed to load URI into tab.");
                    console.error(e);
                }
            }
        }

        if (!options.inBackground) {
            this.selectedTab = tabEl;
        }

        return tabEl;
    },

    /**
     * Pushes a tab into a position in the tablist
     * @param {BrowserTab} tab - The tab to insert
     * @param {object} options
     * @param {number} [options.index] - The index (position) to place the tab in the tablist
     * @param {BrowserTab} [options.openerTab] - The tab that opened `tab`
     */
    insertTabAt(tab, options) {
        let pos = options.index;

        if (!options.index && typeof options.index != "number") {
            // By default, we want to just send the tab to the end
            pos = Infinity;

            // If this tab was opened by another tab, we need to honour
            // the position of this tab instead of the index.
            if (options && options.openerTab) {
                // If the browser is configured to insert "related" tabs after the current one,
                // we will simply just add one to the openerTab's index.
                if (Services.prefs.getBoolPref("browser.tabs.insertRelatedAfterCurrent")) {
                    pos = options.openerTab.index + 1;
                }
            }
        }

        if (!tab.pinned) {
            pos = clamp(pos, 0, this.list.length);
        }

        const tabAfter = this.list[pos] || null;
        this._tabslistEl.insertBefore(tab, tabAfter);
    },

    /**
     * Update a tab's favicon
     *
     * @param {BrowserTab} tab
     * @param {string} iconURI
     */
    setIcon(tab, iconURI) {
        tab.updateIcon(iconURI);
    },

    /**
     * Sets the initial icon of a tab to avoid preloading
     * @param {BrowserTab} tab
     * @param {string} uri
     */
    _setInitialIcon(tab, uri) {
        if (uri && uri in INITIAL_FAVICONS) {
            this.setIcon(tab, INITIAL_FAVICONS[uri]);
        }
    },

    /**
     * Determines whether a webContents is a browser element
     * @param {any} webContents
     * @returns {boolean}
     */
    _isWebContentsBrowserElement(webContents) {
        return webContents.constructor.name == "MozBrowser" && webContents.browserId;
    },

    /**
     * Inserts the webContents into the tab panel area
     * @param {BrowserTab} tab
     * @param {Element} webContents
     */
    _insertTabWebContents(tab, webContents) {
        // Return early if the window happens to be closed
        if (this._win.closed) {
            return;
        }

        tab.webContents = webContents;

        const panel = this._win.document.createElement("browser-panel");
        const panelId = this._generateUniquePanelID();
        panel.id = panelId;

        tab.webContents.classList.add("browser-web-contents");

        panel.appendChild(tab.webContents);
        tab._webContentsPanelId = panelId;

        this._tabpanelBoxEl.appendChild(panel);

        if (this._isWebContentsBrowserElement(tab.webContents)) {
            const progressListener = new TabProgressListener(
                tab,
				/** @type {ChromeBrowser} */(tab.webContents)
            );

            const filter = Cc[
                "@mozilla.org/appshell/component/browser-status-filter;1"
            ].createInstance(Ci.nsIWebProgress);

            const { NOTIFY_ALL } = Ci.nsIWebProgress;

            filter.addProgressListener(progressListener, NOTIFY_ALL);

			/** @type {ChromeBrowser} */ (webContents).webProgress.addProgressListener(
                filter,
                NOTIFY_ALL
            );

            this._tabListeners.set(tab, progressListener);
            this._tabFilters.set(tab, filter);
        }

		/** @type {ChromeBrowser} */ (tab.webContents).droppedLinkHandler =
            this.onBrowserDroppedLink.bind(this, tab.webContents);

		/** @type {ChromeBrowser} */ (tab.webContents).loadURI = NavigationHelper.loadURI.bind(
                NavigationHelper,
                tab.webContents
            );

		/** @type {ChromeBrowser} */ (tab.webContents).fixupAndLoadURIString =
            NavigationHelper.fixupAndLoadURIString.bind(NavigationHelper, tab.webContents);

        // If we transitioned from one browser to two browsers, we need to set
        // hasSiblings=false on both the existing browser and the new browser.
        // @todo(EnderDev) What does this mean?
        if (this.list.length == 2) {
            if (this._isWebContentsBrowserElement(this.list[0].webContents)) {
				/** @type {ChromeBrowser} */ (
                    this.list[0].webContents
                ).browsingContext.hasSiblings = true;
            }

            if (this._isWebContentsBrowserElement(this.list[1].webContents)) {
				/** @type {ChromeBrowser} */ (
                    this.list[1].webContents
                ).browsingContext.hasSiblings = true;
            }
        } else if (this._isWebContentsBrowserElement(tab.webContents)) {
			/** @type {ChromeBrowser} */ (tab.webContents).browsingContext.hasSiblings =
                this.list.length > 1;
        }

        if (tab.userContextId) {
            tab.webContents.setAttribute("usercontextid", tab.userContextId);
        }

        if (this._isWebContentsBrowserElement(tab.webContents)) {
			/** @type {ChromeBrowser} */ (tab.webContents).browsingContext.isAppTab = tab.pinned;
        }
    },

    /**
     * Fetches an open tab by its tab ID
     * @param {string} id
     * @returns {BrowserTab | null}
     */
    getTabByTabId(id) {
        return this._tabslistEl.querySelector(`#tab-${id}`);
    },

    /**
     * Gets the ID from a webContents
     * @param {any} webContents
     * @returns {number}
     */
    _getWebContentsId(webContents) {
        /** @type {any} */
        const xulBrowser = this._win.customElements.get("browser");

        if (webContents instanceof xulBrowser && webContents.browserId) {
            return webContents.browserId;
        }

        return parseInt(webContents.id);
    },

    /**
     * Find a tab using its webContents
     * @param {ChromeBrowser | Element} webContents
     */
    getTabForWebContents(webContents) {
        const id = this._getWebContentsId(webContents);
        return this._tabs.get(id);
    },

    /**
     * Fired when a link is dropped onto the browser contents
     *
     * This function is overloaded:
     * event, uris, name, triggeringPrincipal
     * event, uris, triggeringPrincipal
     * @param {Event} event
     * @param {string | { url: string, nameOrTriggeringPrincipal: any, type: string }[]} uris
     * @param {any} nameOrTriggeringPrincipal
     * @param {any} triggeringPrincipal
     */
    onBrowserDroppedLink(event, uris, nameOrTriggeringPrincipal, triggeringPrincipal) {
        console.log(
            "onBrowserDroppedLink",
            event,
            uris,
            nameOrTriggeringPrincipal,
            triggeringPrincipal
        );
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

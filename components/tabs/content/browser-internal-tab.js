/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Compatibility layer over Dot tabs for Mozilla APIs
 * 
 * This shouldn't be modified, unless it improves coverage for existing APIs. 
 * New features should be put into BrowserTab instead.
 * 
 * @param {BrowserTab} tab
 */
function injectCompat(tab) {
    const { BrowserCompatibility: compat } = ChromeUtils.importESModule(
        "resource://gre/modules/BrowserCompatibility.sys.mjs"
    );

    compat.defineGetter(tab, "linkedBrowser", () => tab.webContents);
}

const kDefaultTabIcon = "chrome://dot/skin/globe.svg";

const kDefaultTabTitles = {
    "about:blank": "New Tab",
    "about:home": "New Tab",
    "about:newtab": "New Tab",
}

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").ChromeBrowser} ChromeBrowser
 */

class BrowserTab extends MozElements.MozTab {
    TAB_PROGRESS_NONE = 0;
    TAB_PROGRESS_BUSY = 1;
    TAB_PROGRESS_TRANSIT = 2;

    constructor() {
        super();

        injectCompat(this);
    }

    static get observedAttributes() {
        return [
            "label",
            "icon"
        ];
    }

    _openerTab = null

    /** 
     * The opener tab is the tab that opened this current tab
     * @type {false | BrowserTab} 
     */
    get openerTab() {
        if (!this._openerTab) return false;

        const tabId = this._openerTab.id;
        const tab = gDot.tabs.getTabByTabId(tabId);

        if (!tab) return false;
        return this._openerTab;
    }

    /**
     * The tab's contents
     * This can either be a MozBrowser or any other element.
     * @type {ChromeBrowser | Element}
     */
    webContents = null

    /**
     * The webContents' unique numerical ID
     * 
     * The ID can either be from a MozBrowser or from 
     * any element attached to the Tab as webContents.
     * @returns {number}
     */
    get webContentsId() {
        // @ts-ignore
        if (this.webContents.constructor.name == "MozBrowser" && this.webContents.browserId) {
            // @ts-ignore
            return this.webContents.browserId;
        }

        return parseInt(this.webContents.id);
    }

    _pinned = false
    get pinned() {
        return this._pinned;
    }

    set pinned(val) {
        this._pinned = val;
        this.toggleAttribute("pinned", val);
    }

    get visible() {
        return !this.hidden;
    }

    set visible(val) {
        this.hidden = !val;
    }

    /**
     * Determines the tab's loading progress state
     */
    get progress() {
        return parseInt(this.getAttribute("progress"));
    }

    /**
     * Updates the tab's loading progress state
     * @property {number} val
     */
    set progress(val) {
        if (!val) {
            this.removeAttribute("progress");
            return;
        }

        this.setAttribute("progress", val.toString());
    }

    initialDragX = 0;

    /**
     * Determines the tab's dragging state
     */
    get dragging() {
        return this.hasAttribute("dragging");
    }

    _progressPercent = 0;

    /**
     * The percentage of content loaded for tab
     */
    get progressPercent() {
        return this._progressPercent;
    }

    set progressPercent(val) {
        this.setAttribute("progresspercent", val + "%");
        console.log(val + "%");
        this._progressPercent = val;
    }

    /**
     * Determines whether the tab is selected or not
     */
    get selected() {
        return gDot.tabs.selectedTab.id == this.id;
    }

    /**
     * The ID of the userContext (container) to use
     */
    userContextId = null

    get permanentKey() {
        // @ts-ignore
        return this.webContents.permanentKey;
    }

    _webContentsPanelId = null

    /**
     * The webContent's panel element
     * 
     * The panel element is responsible for containing 
     * the browser/webContents within the UI.
     */
    get webContentsPanel() {
        return document.getElementById(this._webContentsPanelId);
    }

    /**
     * The index of the tab in relation to the tabs list
     */
    get index() {
        return Array.from(gDot.tabs.list).indexOf(
            // @ts-ignore
            document.getElementById(this.id)
        );
    }

    /**
     * The tab's modal box
     * 
     * The modal box is responsible for housing any
     * tab modals or popups in the browser frame.
     * 
     * @type {BrowserModals}
     */
    get modalBox() {
        return this.webContents.parentElement.querySelector("browser-modals");
    }

    /**
     * Register any event listeners that require webContents to be setup and ready
     * 
     * Putting these into connectedCallback can't guarantee it will work, as 
     * webContents could get added to the tab too late.
     */
    registerEventListeners() {
        this.webContents.addEventListener("pagetitlechanged", this);
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        if (!this.getAttribute("label")) {
            this.updateLabel("Untitled");
        }

        if (!this.getAttribute("icon")) {
            this.updateIcon(kDefaultTabIcon);
        }

        document.addEventListener("BrowserTabs::TabSelect", this);
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;

        document.removeEventListener("BrowserTabs::TabSelect", this);

        this.webContents.removeEventListener("pagetitlechanged", this);
    }

    /**
     * Handles listened to events
     * @param {CustomEvent} event 
     */
    handleEvent(event) {
        switch (event.type) {
            case "BrowserTabs::TabSelect":
                this._onTabSelected(event);
                break;
            case "pagetitlechanged":
                if (this.webContents.tagName == "browser") {
                    this.updateLabel(/** @type {ChromeBrowser} */(this.webContents).contentTitle);
                }
                break;
        }
    }

    /**
     * Updates the tab's label
     * @param {string} newLabel 
     */
    updateLabel(newLabel) {
        if (newLabel.trim().length <= 0) {
            newLabel = /** @type {ChromeBrowser} */(this.webContents).contentTitle;
        }

        if (newLabel.trim().length <= 0) {
            try {
                newLabel = /** @type {ChromeBrowser} */(this.webContents).currentURI.spec

                if (kDefaultTabTitles[newLabel]) {
                    newLabel = kDefaultTabTitles[newLabel];
                }
            } catch (e) {
                console.error("Unable to use currentURI for tab title:", e);
                newLabel = "Untitled";
            }
        }

        this.setAttribute("label", newLabel);
    }

    /**
     * Updates the tab's icon
     * @param {string} newIconURI 
     */
    updateIcon(newIconURI) {
        if (!newIconURI) newIconURI = kDefaultTabIcon;

        this.setAttribute("icon", newIconURI);
    }

    /**
     * Clears the tab's icon
     */
    clearIcon() {
        this.updateIcon(null);
    }

    _onTabSelected(event) {
        /** @type {BrowserTab} */
        const tab = event.detail;

        this.toggleAttribute("selected", tab.id === this.id);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.isConnectedAndReady) return;

        switch (name) {
            case "label":
                if (newValue !== oldValue) {
                    this.updateLabel(this.getAttribute(name));
                }
                break;
            case "icon":
                if (newValue !== oldValue) {
                    this.updateIcon(this.getAttribute(name));
                }
        }
    }
}

customElements.define("browser-internal-tab", BrowserTab, { extends: "tab" });
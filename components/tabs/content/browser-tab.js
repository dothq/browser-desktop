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

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").ChromeBrowser} ChromeBrowser
 */

class BrowserTab extends MozElements.MozTab {
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
     * The elements of the Tab
     * 
     * @typedef {Object} TabElements
     * @property {HTMLSpanElement} label - The tab's label/title
     * @property {HTMLImageElement} icon - The tab's favicon
     * 
     * @returns {TabElements}
     */
    get elements() {
        return {
            label: this.querySelector(".browser-tab-label"),
            icon: this.querySelector(".browser-tab-icon")
        }
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

        this.appendChild(html("img", { class: "browser-tab-icon" }));
        this.appendChild(html("span", { class: "browser-tab-label" }));

        if (!this.getAttribute("label")) {
            this.updateLabel("Untitled");
        }

        this.addEventListener("mousedown", this);
        document.addEventListener(gDot.tabs.EVENT_TAB_SELECT, this);
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.removeEventListener("mousedown", this);
        document.removeEventListener(gDot.tabs.EVENT_TAB_SELECT, this);

        this.webContents.removeEventListener("pagetitlechanged", this);
    }

    /**
     * Handles listened to events
     * @param {CustomEvent} event 
     */
    handleEvent(event) {
        switch (event.type) {
            case "mousedown":
                this._onTabMouseDown(event);
                break;
            case gDot.tabs.EVENT_TAB_SELECT:
                this._onTabSelected(event);
                break;
            case "pagetitlechanged":
                if (this.webContents.tagName == "browser") {
                    this.updateLabel(/** @type {ChromeBrowser} */(this.webContents).contentTitle);
                }
        }
    }

    /**
     * Updates the tab's label
     * @param {string} newLabel 
     */
    updateLabel(newLabel) {
        this.elements.label.textContent = newLabel;
        this.setAttribute("label", newLabel);
    }

    /**
     * Updates the tab's icon
     * @param {string} newIconURI 
     */
    updateIcon(newIconURI) {
        this.elements.icon.src = newIconURI;
        this.setAttribute("icon", newIconURI);
    }

    // @ts-ignore
    _onTabMouseDown(event) {
        gDot.tabs.selectedTab = this;
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
                    this.updateLabel(newValue);
                }
                break;
            case "icon":
                if (newValue !== oldValue) {
                    this.updateIcon(newValue);
                }
        }
    }
}

customElements.define("browser-tab", BrowserTab, { extends: "tab" });
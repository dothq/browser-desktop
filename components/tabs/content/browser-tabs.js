/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabsElement extends MozHTMLElement {
    constructor() {
        super();
    }

    /**
     * The currently selected tab
     */
    get selectedTab() {
        return this.getRenderedTabByInternalId(gDot.tabs.selectedTab.id);
    }

    /**
     * Fired when we have incoming events
     * @param {CustomEvent} event 
     */
    handleEvent(event) {
        const { tab } = event.detail;

        switch (event.type) {
            case "BrowserTabsCollator::TabAdded":
                this._onTabAdded(tab);
                break;
            case "BrowserTabsCollator::TabRemoved":
                this._onTabRemoved(tab);
                break;
            case "BrowserTabsCollator::TabAttributeUpdate":
                const { attributeName, oldValue, newValue } = event.detail;

                this._onTabAttributeUpdated(tab, attributeName, oldValue, newValue);
                break;
        }
    }

    /**
     * Gets the associated rendered tab for an internal tab
     * @param {string} id 
     * @returns {BrowserRenderedTab | null}
     */
    getRenderedTabByInternalId(id) {
        return this.querySelector(`[tab=${id}]`);
    }

    /**
     * Fired when a new tab is added to the tabs collator
     * @param {BrowserTab} tab 
     */
    _onTabAdded(tab) {
        const renderedTab = /** @type {BrowserRenderedTab} */ (document.createElement("browser-tab"));
        renderedTab.linkedTab = tab;

        this.appendChild(renderedTab);
    }

    /**
     * Fired when an existing tab is removed from the tabs collator
     * @param {BrowserTab} tab 
     */
    _onTabRemoved(tab) {
        const renderedTab = this.getRenderedTabByInternalId(tab.id);

        if (renderedTab) {
            renderedTab.remove();
        }
    }

    /**
     * Fired when an attribute on an existing tab is modified
     * @param {BrowserTab} tab 
     * @param {string} attributeName
     * @param {string} oldValue
     * @param {string} newValue
     */
    _onTabAttributeUpdated(tab, attributeName, oldValue, newValue) {
        const renderedTab = this.getRenderedTabByInternalId(tab.id);

        if (renderedTab) {
            renderedTab.attributeChangedCallback(attributeName, oldValue, newValue);
        }
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        window.addEventListener("BrowserTabsCollator::TabAdded", this);
        window.addEventListener("BrowserTabsCollator::TabRemoved", this);
        window.addEventListener("BrowserTabsCollator::TabAttributeUpdate", this);
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;

        window.removeEventListener("BrowserTabsCollator::TabAdded", this);
        window.removeEventListener("BrowserTabsCollator::TabRemoved", this);
        window.removeEventListener("BrowserTabsCollator::TabAttributeUpdate", this);
    }
}

customElements.define("browser-tabs", BrowserTabsElement);
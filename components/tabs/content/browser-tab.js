/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserRenderedTab extends MozHTMLElement {
    constructor() {
        super();
    }

    _linkedTab = null;

    /**
     * The internal tab that this tab is linked to
     * @type {BrowserTab}
     */
    get linkedTab() {
        return this._linkedTab;
    }

    set linkedTab(tab) {
        if (this._linkedTab !== null) return;

        this._linkedTab = tab;
        this.setAttribute("tab", tab.id);
    }

    /**
     * The anatomy of the Tab
     * 
     * @typedef {Object} TabElements
     * @property {HTMLSpanElement} label - The tab's label/title
     * @property {HTMLImageElement} icon - The tab's favicon
     * @property {HTMLDivElement} spinner - The tab's loading spinner
     * 
     * @returns {TabElements}
     */
    get elements() {
        return {
            label: this.querySelector(".browser-tab-label"),
            icon: this.querySelector(".browser-tab-icon"),
            spinner: this.querySelector(".browser-tab-spinner"),
        }
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.appendChild(
            html(
                "div",
                { class: "browser-tab-icon-container" },
                html("img", { class: "browser-tab-icon" }),
                html("div", { class: "browser-tab-spinner" })
            )
        );

        this.appendChild(
            html(
                "div",
                { class: "browser-tab-label-container" },
                html("span", { class: "browser-tab-label" })
            )
        );
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;
    }

    /**
     * Fired whenever an attribute is updated on an internal tab
     * @param {string} name 
     * @param {string} oldValue 
     * @param {string} newValue 
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.isConnectedAndReady) return;

        this.setAttribute(name, newValue);
        this.toggleAttribute(name, this.linkedTab.hasAttribute(name));

        switch (name) {
            case "label":
                if (newValue !== oldValue) {
                    this.elements.label.textContent = newValue;
                }
                break;
            case "icon":
                if (newValue !== oldValue) {
                    this.elements.icon.src = newValue;
                }
                break;
            case "progresspercent":
                this.style.setProperty("--tab-load-percent", newValue);
                break;
        }
    }
}

customElements.define("browser-tab", BrowserRenderedTab);

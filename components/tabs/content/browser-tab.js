/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTab extends MozHTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return [
            "label",
            "icon"
        ];
    }

    get elements() {
        return {
            label: this.querySelector(".browser-tab-label")
        }
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.appendChild(html("span", { class: "browser-tab-label" }, ""));

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
        }
    }
}

customElements.define("browser-tab", BrowserTab);
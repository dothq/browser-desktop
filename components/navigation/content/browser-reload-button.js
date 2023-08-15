/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserReloadButton extends HTMLButtonElement {
    constructor() {
        super();
    }

    get browser() {
        const tab = gDot.tabs.selectedTab;

        if (!gDot.tabs._isWebContentsBrowserElement(tab.webContents)) {
            return null;
        }

        return /** @type {ChromeBrowser} */ (tab.webContents);
    }

    connectedCallback() {
        this.appendChild(html("browser-icon", { name: "reload" }));

        this.addEventListener("click", this);
    }

    handleReload(cached = false) {
        let flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;

        if (cached == true) {
            flags |= Ci.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE;
        }

        this.browser.reloadWithFlags(flags);
    }

    /**
     * Handle incoming events
     * @param {MouseEvent} event 
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":
                this.handleReload(event.shiftKey);
                break;
        }
    }

    disconnectedCallback() {
        this.removeEventListener("click", this);
    }
}

customElements.define("reload-button", BrowserReloadButton, { extends: "button" });
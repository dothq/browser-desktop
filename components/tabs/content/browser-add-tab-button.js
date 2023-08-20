/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { BrowserTabsUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

var { NavigationHelper } = ChromeUtils.importESModule(
    "resource:///modules/NavigationHelper.sys.mjs"
);

var { StartPage } = ChromeUtils.importESModule("resource:///modules/StartPage.sys.mjs");

class BrowserAddTabButton extends HTMLButtonElement {
    constructor() {
        super();
    }

    /**
     * The currently selected browser
     */
    get browser() {
        const tab = gDot.tabs.selectedTab;

        if (!gDot.tabs._isWebContentsBrowserElement(tab.webContents)) {
            return null;
        }

        return /** @type {ChromeBrowser} */ (tab.webContents);
    }

    /**
     * The icon for the add tab button
     * @returns {BrowserIcon}
     */
    get icon() {
        return this.querySelector("browser-icon");
    }

    connectedCallback() {
        this.appendChild(html("browser-icon", { name: "add" }));

        this.addEventListener("click", this);
    }

    handleClick() {
        const [urlToLoad] = StartPage.getHomePage();

        NavigationHelper.openTrustedLinkIn(window, urlToLoad, "tab");
    }

    /**
     * Handle incoming events
     * @param {MouseEvent | CustomEvent} event
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":
                this.handleClick();
                break;
        }
    }

    disconnectedCallback() {
        this.removeEventListener("click", this);
    }
}

customElements.define("add-tab-button", BrowserAddTabButton, { extends: "button" });

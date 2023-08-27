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

class BrowserAddTabButton extends BrowserToolbarButton {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.label = "New Tab";
        this.icon = "add";

        this.addEventListener("click", this);
    }

    handleClick(event) {
        gDotCommands.execCommand(
            "application.new_tab"
        );
    }

    /**
     * Handle incoming events
     * @param {MouseEvent} event 
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":
                this.handleClick(event);
                break;
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.removeEventListener("click", this);
    }
}

customElements.define("add-tab-button", BrowserAddTabButton, { extends: "button" });

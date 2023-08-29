/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const createButton = (direction) => class extends BrowserToolbarButton {
    constructor() {
        super();

        this.routineId = direction == "back" ? "navigate-back" : "navigate-forward";
    }

    connectedCallback() {
        super.connectedCallback();

        window.addEventListener("BrowserTabs::LocationChange", this);
        window.addEventListener("load", this);

        this.disabled = true;
    }

    /**
     * Handles incoming events
     * @param {Event & { command?: string }} event 
     * @returns 
     */
    handleEvent(event) {
        switch (event.type) {
            case "load":
            case "BrowserTabs::LocationChange":
                if (direction == "back") {
                    this.disabled = !this.context.browser.canGoBack;
                } else if (direction == "forward") {
                    this.disabled = !this.context.browser.canGoForward;
                }

                break;
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        window.removeEventListener("BrowserTabs::LocationChange", this);
        window.removeEventListener("load", this);
    }
}

customElements.define("back-button", createButton("back"), { extends: "button" });
customElements.define("forward-button", createButton("forward"), { extends: "button" });
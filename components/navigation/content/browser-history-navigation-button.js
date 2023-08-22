/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const createButton = (direction) => class extends HTMLButtonElement {
    constructor() {
        super();

        this.direction = direction;
    }

    direction = ""

    get browser() {
        const tab = gDot.tabs.selectedTab;

        if (!gDot.tabs._isWebContentsBrowserElement(tab.webContents)) {
            return null;
        }

        return /** @type {ChromeBrowser} */ (tab.webContents);
    }

    connectedCallback() {
        const iconName = this.direction == "back"
            ? "arrow-left"
            : this.direction == "forward"
                ? "arrow-right"
                : ""

        this.appendChild(html("browser-icon", { name: iconName }));

        this.addEventListener("click", this);
        window.addEventListener("AppCommand", this);
        window.addEventListener("BrowserTabs::LocationChange", this);
        window.addEventListener("load", this);

        this.disabled = true;
    }

    updateDisabled() {
        if (this.direction == "back") {
            this.disabled = !this.browser.canGoBack;
        } else if (this.direction == "forward") {
            this.disabled = !this.browser.canGoForward;
        }
    }

    /**
     * Handles incoming events
     * @param {Event & { command?: string }} event 
     * @returns 
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":
            case "AppCommand":
                if (
                    event.type == "AppCommand" &&
                    event.command.toLowerCase() !== this.direction
                ) return;

                if (this.direction == "back") {
                    gDotCommands.execCommand(
                        "browsing.navigate_back",
                        { browser: this.browser }
                    );
                } else if (this.direction == "forward") {
                    gDotCommands.execCommand(
                        "browsing.navigate_forward",
                        { browser: this.browser }
                    );
                }

                break;
            case "load":
            case "BrowserTabs::LocationChange":
                this.updateDisabled();

                break;
        }
    }

    disconnectedCallback() {
        this.removeEventListener("click", this);
        window.removeEventListener("AppCommand", this);
    }
}

customElements.define("back-button", createButton("back"), { extends: "button" });
customElements.define("forward-button", createButton("forward"), { extends: "button" });
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const createButton = (direction) => class extends BrowserToolbarButton {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.label = direction == "back" ? "Back" : "Forward";
        this.icon = direction == "back" ? "arrow-left" : "arrow-right";

        this.addEventListener("click", this);
        window.addEventListener("AppCommand", this);
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
            case "click":
            case "AppCommand":
                if (
                    event.type == "AppCommand" &&
                    event.command.toLowerCase() !== direction
                ) return;

                gDotCommands.execCommand(
                    `browsing.navigate_${direction}`,
                    { browser: this.context.browser }
                );

                break;
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

        this.removeEventListener("click", this);
        window.removeEventListener("AppCommand", this);
        window.removeEventListener("BrowserTabs::LocationChange", this);
        window.removeEventListener("load", this);
    }
}

customElements.define("back-button", createButton("back"), { extends: "button" });
customElements.define("forward-button", createButton("forward"), { extends: "button" });
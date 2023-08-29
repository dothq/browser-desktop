/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserWindowControls extends MozHTMLElement {
    constructor() {
        super();
    }

    /**
     * All window control elements
     * @type {Record<string, HTMLButtonElement>}
     */
    get elements() {
        return {
            min: this.querySelector(".control-min"),
            max: this.querySelector(".control-max"),
            restore: this.querySelector(".control-restore"),
            close: this.querySelector(".control-close")
        };
    }

    /**
     * Handle incoming events to window controls
     * @param {Event} event
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":
                return this.onControlClick(event);
            case "sizemodechange":
                return this.onSizeModeChange(event);
            case "DOMContentLoaded":
                this.elements.max.setAttribute(
                    "data-l10n-args",
                    JSON.stringify({
                        isPopup: window.gDot.isPopupWindow
                    })
                );
                break;
        }
    }

    /**
     * Handle clicks to a window control
     * @param {Event} event
     */
    onControlClick(event) {
        switch (event.target) {
            case this.elements.min:
                return window.minimize();
            case this.elements.max:
                return window.maximize();
            case this.elements.restore:
                return window.fullScreen ? console.log("todo: exit fullscreen") : window.restore();
            case this.elements.close:
                return window.close();
        }
    }

    /**
     * Handles size mode changes to the window
     */
    onSizeModeChange(event) {
        this.elements.max.hidden = window.windowState == window.STATE_MAXIMIZED;
        this.elements.restore.hidden = !this.elements.max.hidden;
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.appendChild(
            html("button", {
                class: "control-min",
                dataL10nId: "browser-window-minimize-button"
            })
        );

        this.appendChild(
            html("button", {
                class: "control-max",
                dataL10nId: "browser-window-maximize-button",
                dataL10nArgs: JSON.stringify({ isPopup: false })
            })
        );

        this.appendChild(
            html("button", {
                class: "control-restore",
                dataL10nId: "browser-window-restore-button"
            })
        );

        this.appendChild(
            html("button", {
                class: "control-close",
                dataL10nId: "browser-window-close-button"
            })
        );

        this.elements.min.addEventListener("click", this);
        this.elements.max.addEventListener("click", this);
        this.elements.restore.addEventListener("click", this);
        this.elements.close.addEventListener("click", this);

        window.addEventListener("sizemodechange", this);
        window.addEventListener("DOMContentLoaded", this);

        this.onSizeModeChange();
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.elements.min.removeEventListener("click", this);
        this.elements.max.removeEventListener("click", this);
        this.elements.restore.removeEventListener("click", this);
        this.elements.close.removeEventListener("click", this);

        window.removeEventListener("sizemodechange", this);
    }
}

customElements.define("browser-window-controls", BrowserWindowControls);

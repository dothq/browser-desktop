/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserWindowControls extends MozHTMLElement {
    constructor() {
        super();
    }

    /** @type {MediaQueryList} */
    csdReversedMediaQuery = null;

    /**
     * All window control elements
     */
    get elements() {
        return {
            min: /** @type {HTMLButtonElement} */ (
                this.querySelector(".control-min") ||
                html("button", {
                    class: "control-min",
                    dataL10nId: "browser-window-minimize-button"
                })
            ),
            max: /** @type {HTMLButtonElement} */ (
                this.querySelector(".control-max") ||
                html("button", {
                    class: "control-max",
                    dataL10nId: "browser-window-maximize-button",
                    dataL10nArgs: JSON.stringify({ isPopup: false })
                })
            ),
            restore: /** @type {HTMLButtonElement} */ (
                this.querySelector(".control-restore") ||
                html("button", {
                    class: "control-restore",
                    dataL10nId: "browser-window-restore-button"
                })
            ),
            close: /** @type {HTMLButtonElement} */ (
                this.querySelector(".control-close") ||
                html("button", {
                    class: "control-close",
                    dataL10nId: "browser-window-close-button"
                })
            )
        };
    }

    /**
     * Handle incoming events to window controls
     * @param {Event} event
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":
                this.onControlClick(event);
                break;
            case "sizemodechange":
                this.onSizeModeChange(event);
                break;
            case "DOMContentLoaded":
                this.elements.max.setAttribute(
                    "data-l10n-args",
                    JSON.stringify({
                        isPopup: window.gDot.isPopupWindow
                    })
                );
                break;
            case "change":
                this.render(/** @type {MediaQueryListEvent} */(event).matches);
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

        this.csdReversedMediaQuery = window.matchMedia("(-moz-gtk-csd-available) and (-moz-gtk-csd-reversed-placement)")
        this.csdReversedMediaQuery.addEventListener("change", this);

        window.addEventListener("sizemodechange", this);
        window.addEventListener("DOMContentLoaded", this);

        this.render(this.csdReversedMediaQuery.matches);
    }

    render(reversed = false) {
        this.elements.min.removeEventListener("click", this);
        this.elements.max.removeEventListener("click", this);
        this.elements.restore.removeEventListener("click", this);
        this.elements.close.removeEventListener("click", this);

        this.replaceChildren();

        if (reversed) {
            this.append(
                this.elements.close,
                this.elements.min,
                this.elements.max,
                this.elements.restore
            );
        } else {
            this.append(
                this.elements.min,
                this.elements.max,
                this.elements.restore,
                this.elements.close
            );
        }

        this.elements.min.addEventListener("click", this);
        this.elements.max.addEventListener("click", this);
        this.elements.restore.addEventListener("click", this);
        this.elements.close.addEventListener("click", this);

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

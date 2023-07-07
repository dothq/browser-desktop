/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserContentPopup extends MozHTMLElement {
    constructor() {
        super();
    }

    /**
     * The browser element associated with this popup
     * @type {ChromeBrowser}
     */
    browser = null

    /**
     * The page window associated with the popup browser
     */
    get win() {
        return this.browser.contentWindow;
    }

    /**
     * The page document associated with the popup browser
     */
    get doc() {
        return this.browser.contentDocument;
    }

    /**
     * Initialise the popup browser 
     * @param {string} id
     */
    initialise(id) {
        this.browser = document.createXULElement("browser");
        this.browser.classList.add("browser-content-popup-frame");
        this.browser.setAttribute("name", `popup_${id}`);
    }

    /**
     * Patch the internal window APIs to divert resizing and close requests
     */
    patchPopupWindow() {
        const oldResizeBy = this.win.resizeBy;

        this.win.resizeBy = (x, y) => {
            this.contentWidth += x;
            this.contentHeight += y;

            oldResizeBy.call(
                this.win,
                x,
                y
            )
        }

        const oldClose = this.win.close;

        this.win.close = () => {
            this.hide();

            const closeEvent = new CustomEvent("popupclosed");

            this.dispatchEvent(closeEvent);

            oldClose.call(this.win);
        }

        this.win.minimize = () => {
            // noop
        }

        this.win.maximize = () => {
            this.show();
        }
    }

    /**
     * Handle incoming window features
     * @param {string} features 
     */
    setWindowFeatures(features) {
        const featureList = features.split(",");

        const getFlagWithParam = (name) => {
            const [key, value] = featureList.find(f => f == name || f.startsWith(`${name}=`)).split("=");

            return [key, value];
        }

        var [_, width] = getFlagWithParam("width");
        if (width) {
            try {
                this.contentWidth = parseInt(width);
            } catch (e) {
                console.error("Could not cast popup feature 'width' to integer!", e);
            }
        }

        var [_, height] = getFlagWithParam("width");
        if (height) {
            try {
                this.contentHeight = parseInt(height);
            } catch (e) {
                console.error("Could not cast popup feature 'height' to integer!", e);
            }
        }
    }

    show() {
        this.hidden = false;

        const modalBox = this.closest("browser-modals");

        if (modalBox) {
            // @todo: this can be hit or miss, what if we aren't in a browser-modals element?
            /** @type {BrowserModals} */ (modalBox).recalculateVisibility();
        }
    }

    hide() {
        this.hidden = true;

        const modalBox = this.closest("browser-modals");

        if (modalBox) {
            // @todo: this can be hit or miss, what if we aren't in a browser-modals element?
            /** @type {BrowserModals} */ (modalBox).recalculateVisibility();
        }
    }

    /**
     * The width of the popup content in pixels
     */
    get contentWidth() {
        const width = parseInt(this.style.getPropertyValue("--popup-content-width"));

        return Number.isNaN(width) ? 0 : width;
    }

    /**
     * Set the width of the popup in pixels
     * @param {number} width
     */
    set contentWidth(width) {
        if (Number.isNaN(width)) return;

        this.style.setProperty("--popup-content-width", `${width}px`);
    }

    /**
     * The height of the popup content in pixels
     */
    get contentHeight() {
        const height = parseInt(this.style.getPropertyValue("--popup-content-height"));

        return Number.isNaN(height) ? 0 : height;
    }

    /**
     * Set the height of the popup in pixels
     * @param {number} height
     */
    set contentHeight(height) {
        if (Number.isNaN(height)) return;

        this.style.setProperty("--popup-content-height", `${height}px`);
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.appendChild(this.browser);
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;
    }
}

customElements.define("browser-content-popup", BrowserContentPopup);
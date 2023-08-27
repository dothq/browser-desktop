/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserToolbar extends MozHTMLElement {
    constructor() {
        super();
    }

    /**
     * Determines the toolbar's display mode
     *
     * `icons` - Only show icons in toolbar buttons
     *
     * `text` - Only show text in toolbar buttons
     *
     * `icons_beside_text` - Show icons beside text in toolbar buttons
     */
    get mode() {
        return this.getAttribute("mode");
    }

    /**
     * Update the toolbar's display mode
     */
    set mode(newMode) {
        this.setAttribute("mode", newMode);
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.mode = "icons";
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;
    }
}

customElements.define("browser-toolbar", BrowserToolbar);

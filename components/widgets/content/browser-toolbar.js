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
     * `icons_text` - Show icons beside text in toolbar buttons
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

    /**
     * The name of this toolbar
     */
    get name() {
        return this.getAttribute("name");
    }

    /**
     * Update the toolbar's name
     */
    set name(newName) {
        this.setAttribute("name", newName);
    }

    /**
     * Determine whether this toolbar is the initial toolbar in the browser
     * 
     * We need a way of working out which toolbar is the first in the DOM
     * so we can display the CSD in the correct location.
     */
    maybePromoteToolbar() {
        const allToolbars = Array.from(document.querySelectorAll("browser-toolbar"));

        const index = allToolbars.findIndex(n => n.isEqualNode(this));

        const bounds = this.getBoundingClientRect();

        const isInitial = (
            bounds.width > 0 &&
            bounds.height > 0 &&
            !Array.from(document.querySelectorAll("browser-toolbar")).find(tb => tb.hasAttribute("initial"))
        );

        console.log(isInitial);

        this.toggleAttribute("initial", isInitial);
    }

    /**
     * Toggles the collapsed state of this toolbar
     */
    toggleCollapsed() {
        this.toggleAttribute("collapse");
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.attachShadow({ mode: "open" });

        this.shadowRoot.appendChild(
            html("link", {
                rel: "stylesheet",
                href: "chrome://dot/content/widgets/browser-window-controls.css"
            })
        );

        this.shadowRoot.appendChild(html("slot", { part: "content" }));
        this.shadowRoot.appendChild(html("browser-window-controls", { part: "csd" }));

        this.mode = "icons";

        this.maybePromoteToolbar();
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;
    }
}

customElements.define("browser-toolbar", BrowserToolbar);

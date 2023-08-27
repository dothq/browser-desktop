/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @callback Resolvable
 * @param {ReturnType<typeof gDotCommands.createContext>} [data]
 * @returns {any}
 *
 * @typedef StaticOrResolvable
 * @type {(any | (Resolvable))}
 *
 */

class BrowserToolbarButton extends HTMLButtonElement {
    constructor() {
        super();

        this._context = gDotCommands.createContext({ win: window });
    }

    /**
     * Button handler context
     */
    get context() {
        return this._context;
    }

    /**
     * The anatomy of the toolbar button
     *
     * @typedef {Object} ToolbarButtonElements
     * @property {HTMLSpanElement} label - The toolbar buttons's label
     * @property {BrowserIcon} icon - The toolbar button's icon
     *
     * @returns {ToolbarButtonElements}
     */
    get elements() {
        return {
            label:
                this.querySelector(".toolbar-button-label") ||
				/** @type {HTMLSpanElement} */ (html("span", { class: "toolbar-button-label" })),
            icon:
                this.querySelector(".toolbar-button-icon") ||
				/** @type {BrowserIcon} */ (html("browser-icon", { class: "toolbar-button-icon" }))
        };
    }

    /**
     * The icon of the toolbar button
     */
    get icon() {
        return this.elements.icon.name;
    }

    /**
     * Updates the icon on the toolbar button
     * @param {string} newIcon
     */
    set icon(newIcon) {
        this.elements.icon.name = newIcon;
    }

    /**
     * The label of the toolbar button
     */
    get label() {
        return this.elements.label.textContent;
    }

    /**
     * Updates the label of the toolbar button
     */
    set label(newLabel) {
        this.elements.label.textContent = newLabel;
        this.title = newLabel;
    }

    /**
     * The browser-toolbar element for this toolbar button
     * @type {BrowserToolbar | null}
     */
    get toolbar() {
        return this.closest("browser-toolbar");
    }

    /**
     * Handles clicks when the toolbar button is disabled
     * @param {MouseEvent} event 
     */
    onDisabledClick(event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    connectedCallback() {
        this.classList.add("toolbar-button");

        this.appendChild(this.elements.icon);
        this.appendChild(this.elements.label);

        this.title = this.label;

        this.addEventListener("click", this.onDisabledClick.bind(this));
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.onDisabledClick.bind(this));
    }
}

customElements.define("browser-toolbar-button", BrowserToolbarButton);

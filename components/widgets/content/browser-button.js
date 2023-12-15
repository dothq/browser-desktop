/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserButton extends BrowserContextualMixin(HTMLButtonElement) {
	constructor() {
		super();
	}

	/**
	 * The allowed customizable attributes for the browser button
	 */
	static get customizableAttributes() {
		return {
			mode: "mode"
		};
	}

	/**
	 * The anatomy of the button
	 *
	 * @typedef {Object} BrowserButtonElements
	 * @property {HTMLSpanElement} label - The buttons's label
	 * @property {BrowserIcon} icon - The button's icon
	 *
	 * @returns {BrowserButtonElements}
	 */
	get elements() {
		return {
			label:
				this.querySelector(".browser-button-label") ||
				/** @type {HTMLSpanElement} */ (
					html(
						"span",
						{ class: "browser-button-label" },
						this.getAttribute("label") || ""
					)
				),
			icon:
				this.querySelector(".browser-button-icon[active]") ||
				/** @type {BrowserIcon} */ (
					html("browser-icon", {
						class: "browser-button-icon",
						name: this.getAttribute("icon") || "",
						active: ""
					})
				)
		};
	}

	/**
	 * The icon of the browser button
	 */
	get icon() {
		try {
			let uri = Services.io.newURI(this.elements.icon.name);

			return uri.spec;
		} catch (e) {}

		return this.elements.icon.name;
	}

	/**
	 * Updates the icon on the browser button
	 * @param {string} newIcon
	 */
	set icon(newIcon) {
		if (newIcon == this.icon) return;

		this.setAttribute("icon", newIcon);

		this.elements.icon.style.removeProperty("--src");

		try {
			let uri = Services.io.newURI(newIcon);

			if (uri.spec) {
				this.elements.icon.style.setProperty(
					"--src",
					`url(${CSS.escape(newIcon)})`
				);
			}
		} catch (e) {}

		this.elements.icon.name = newIcon;
	}

	/**
	 * The label of the browser button
	 */
	get label() {
		return this.elements.label.textContent;
	}

	/**
	 * Updates the label of the browser button
	 */
	set label(newLabel) {
		if (!this.elements.label.isConnected) {
			this.setAttribute("label", newLabel);
		}

		this.elements.label.textContent = newLabel;
		this.title = newLabel;
	}

	/**
	 * The tooltip of the browser button
	 */
	get tooltip() {
		return this.title;
	}

	/**
	 * Updates the tooltip of the browser button
	 */
	set tooltip(newTooltip) {
		this.title = newTooltip;
	}

	/**
	 * The mode of the browser button
	 */
	get mode() {
		return this.getAttribute("mode");
	}

	/**
	 * Updates the mode of the browser button
	 */
	set mode(newMode) {
		if (!newMode || !newMode.length) {
			this.removeAttribute("mode");
			return;
		}

		this.setAttribute("mode", newMode);
	}

	connectedCallback() {
		this.classList.add("browser-button");
		this.classList.toggle(
			/** @type {any} */ (this).buttonId,
			"buttonId" in this
		);

		this.appendChild(
			html(
				"div",
				{ class: "browser-button-container" },
				this.elements.icon,
				this.elements.label
			)
		);
	}

	disconnectedCallback() {}
}

customElements.define("browser-button", BrowserButton);

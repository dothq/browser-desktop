/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabIcon extends BrowserContextualMixin(HTMLElement) {
	constructor() {
		super();
	}

	get elements() {
		return {
			image: /** @type {HTMLImageElement} */ (
				this.querySelector(".browser-tab-image") ||
					html("img", { class: "browser-tab-image" })
			),
			spinner: /** @type {HTMLDivElement} */ (
				this.querySelector(".browser-tab-spinner") ||
					html("div", { class: "browser-tab-spinner" })
			)
		};
	}

	/**
	 * Handles incoming events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabsCollator::TabAttributeUpdate":
			// if (event.detail.tab === this.context.tab) {
			// 	this.updateAttributes();
			// }
		}
	}

	/**
	 * Updates the attributes with the current context tab's
	 */
	updateAttributes() {
		// const tab = this.context.tab;
		// this.setAttribute("progress", tab.getAttribute("progress"));
		// this.toggleAttribute("progress", tab.hasAttribute("progress"));
		// if (this.associatedAreaElement instanceof BrowserRenderedTab) {
		// 	this.setAttribute("hideicon", tab.getAttribute("hideicon"));
		// 	this.toggleAttribute("hideicon", tab.hasAttribute("hideicon"));
		// }
		// if (this.elements.image.src !== tab.getAttribute("icon")) {
		// 	this.elements.image.src = tab.getAttribute("icon");
		// }
	}

	connectedCallback() {
		this.append(this.elements.image, this.elements.spinner);

		window.addEventListener(
			"BrowserTabsCollator::TabAttributeUpdate",
			this
		);

		// if (this.context.tab) {
		// 	this.updateAttributes();
		// }
	}

	disconnectedCallback() {
		window.removeEventListener(
			"BrowserTabsCollator::TabAttributeUpdate",
			this
		);
	}
}

customElements.define("browser-tab-icon", BrowserTabIcon);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MozPopupElement = MozElements.MozElementMixin(XULPopupElement);

class BrowserUrlbarPanel extends BrowserContextualMixin(MozPopupElement) {
	/**
	 * The urlbar host element that owns this element
	 * @returns {BrowserUrlbar}
	 */
	get urlbarHost() {
		return this.host?.closest("browser-urlbar");
	}

	/**
	 * The element that houses all urlbar panel elements
	 */
	get container() {
		return /** @type {HTMLDivElement} */ (
			this.querySelector(".urlbar-panel-container") ||
				html("div", { class: "urlbar-panel-container" })
		);
	}

	/**
	 * The anatomy of the urlbar panel
	 */
	get #elements() {
		return {
			view: /** @type {HTMLDivElement} */ (
				this.querySelector(".urlbar-panel-view") ||
					html("div", { class: "urlbar-panel-view" })
			),
			background: /** @type {HTMLDivElement} */ (
				this.querySelector(".urlbar-panel-background") ||
					html("div", { class: "urlbar-panel-background" })
			)
		};
	}

	constructor() {
		super();

		this.setAttribute("is", "browser-urlbar-panel");
	}

	/**
	 * Fired when the panel is fully hidden
	 * @param {Event} event
	 */
	#onPanelHidden(event) {
		this.remove();
	}

	/**
	 * Fired when the panel is fully shown
	 * @param {Event} event
	 */
	#onPanelShown(event) {
		this.toggleAttribute("showing", true);
	}

	/**
	 * Handles incoming events to the urlbar panel
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "popupshown":
				this.#onPanelShown(event);
				break;
			case "popuphidden":
				this.#onPanelHidden(event);
				break;
		}
	}

	/**
	 * Shows the urlbar panel popup
	 */
	show() {
		const localBounds = this.urlbarHost.getBoundingClientRect();
		const { width, height, x, y } = window.windowUtils.toScreenRect(
			localBounds.x,
			localBounds.y,
			localBounds.width,
			localBounds.height
		);

		// Only setting width, as height is dynamic
		this.style.setProperty(
			"--urlbar-panel-width",
			localBounds.width + "px"
		);

		this.openPopupAtScreenRect("", x, y, width, height);
	}

	connectedCallback() {
		this.addEventListener("popupshown", this);
		this.addEventListener("popuphidden", this);

		this.appendChild(this.#elements.view);
		this.#elements.view.appendChild(this.#elements.background);
		this.#elements.view.appendChild(this.container);

		this.container.appendChild(html("browser-urlbar-results"));
	}

	disconnectedCallback() {
		this.removeEventListener("popupshown", this);
		this.removeEventListener("popuphidden", this);
	}
}

customElements.define("browser-urlbar-panel", BrowserUrlbarPanel, {
	extends: "panel"
});

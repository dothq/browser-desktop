/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserToolbar extends BrowserCustomizableOverflowableArea {
	constructor() {
		super();
	}

	/**
	 * The allowed customizable attributes for the toolbar
	 */
	static get customizableAttributes() {
		return {
			width: "flexibleDimension",
			height: "flexibleDimension",

			background: "namedColor",

			mode: "mode"
		};
	}

	/**
	 * The customizable components to inherit from when used in this area
	 */
	static get customizableComponents() {
		return {
			button: html("button", { is: "browser-toolbar-button" })
		};
	}

	/**
	 * The anatomy of the toolbar's shadow DOM
	 */
	get shadowElements() {
		return {
			csd: /** @type {BrowserWindowControls} */ (
				this.shadowRoot.querySelector("browser-window-controls") ||
					html("browser-window-controls", { part: "csd" })
			)
		};
	}

	/**
	 * Toggles the collapsed state of this toolbar
	 */
	toggleCollapsed() {
		this.toggleAttribute("collapse");
	}

	/**
	 * Updates the CSD's position within the toolbar
	 */
	updateCSDPosition() {
		if (this.isCSDReversed) {
			this.shadowRoot.prepend(this.shadowElements.csd);
		} else {
			this.shadowRoot.append(this.shadowElements.csd);
		}
	}

	/**
	 * Determines whether the CSD should be reversed
	 */
	get isCSDReversed() {
		return window.matchMedia(
			"(-moz-gtk-csd-available) and (-moz-gtk-csd-reversed-placement)"
		).matches;
	}

	/**
	 * Handles incoming events
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserWindowControls::UpdatePosition":
				this.updateCSDPosition();
				break;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		super.connect("toolbar", {
			styles: ["chrome://dot/content/widgets/browser-toolbar.css"]
		});

		this.addEventListener("BrowserWindowControls::UpdatePosition", this);

		this.updateCSDPosition();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener("BrowserWindowControls::UpdatePosition", this);
	}
}

customElements.define("browser-toolbar", BrowserToolbar);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserToolbar extends BrowserCustomizableElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	attributesSchema = {
		properties: {
			width: {
				$ref: "#/$defs/length"
			},
			height: {
				$ref: "#/$defs/length"
			},
			mode: {
				$ref: "#/$defs/mode"
			}
		},
		required: ["mode", "width", "height"]
	};

	/**
	 * The anatomy of the toolbar's shadow DOM
	 */
	get shadowElements() {
		return {
			slot: /** @type {HTMLSlotElement} */ (
				this.shadowRoot.querySelector("slot") || html("slot")
			),
			container: /** @type {HTMLDivElement} */ (
				this.shadowRoot.querySelector(".toolbar-container") ||
					html("div", {
						class: "toolbar-container customizable-shelf"
					})
			),
			csd: /** @type {BrowserWindowControls} */ (
				this.shadowRoot.querySelector("browser-window-controls") ||
					html("browser-window-controls", { part: "csd" })
			)
		};
	}

	/**
	 * Determine whether this toolbar is the initial toolbar in the browser
	 *
	 * We need a way of working out which toolbar is the first in the DOM
	 * so we can display the CSD in the correct location.
	 */
	maybePromoteToolbar() {
		const bounds = this.getBoundingClientRect();

		const isInitial =
			bounds.width > 0 &&
			bounds.height > 0 &&
			!Array.from(document.querySelectorAll("browser-toolbar")).find(
				(tb) => tb.hasAttribute("initial")
			);

		this.toggleAttribute("initial", isInitial);
	}

	/**
	 * Toggles the collapsed state of this toolbar
	 */
	toggleCollapsed() {
		this.toggleAttribute("collapse");
	}

	/**
	 * Handles incoming events
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "change":
				this.onCSDPositionChange(
					/** @type {MediaQueryListEvent} */ (event)
				);
				break;
		}
	}

	/**
	 * Handles changes to the CSD's position
	 * @param {MediaQueryListEvent | MediaQueryList} event
	 */
	onCSDPositionChange(event) {
		const reversed = event.matches;

		if (reversed) {
			this.shadowRoot.prepend(this.shadowElements.csd);
		} else {
			this.shadowRoot.append(this.shadowElements.csd);
		}
	}

	/**
	 * Appends a component to the shadow root of the toolbar
	 * @param {Node} node
	 */
	appendComponent(node) {
		this.shadowRoot.appendChild(this.shadowElements.container);
		this.shadowElements.container.appendChild(node);
	}

	connectedCallback() {
		super.connectedCallback();

		if (this.delayConnectedCallback()) return;

		this.shadowRoot.appendChild(this.shadowElements.csd);

		this.maybePromoteToolbar();
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;
	}
}

customElements.define("browser-toolbar", BrowserToolbar);

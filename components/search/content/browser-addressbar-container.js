/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserAddressbarContainer extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	/**
	 * The main addressbar component
	 */
	get addressbar() {
		return /** @type {BrowserAddressbar} */ (this.parentElement);
	}

	/**
	 * Inherited context from the addressbar parent
	 */
	get context() {
		return this.addressbar.context;
	}

	/**
	 * Dispatches an event to an element with optional detail
	 * @param {Element} element
	 * @param {string} event
	 * @param {Record<string, any>} [detail]
	 */
	_dispatchEvent(element, event, detail) {
		const evt = new CustomEvent(`BrowserAddressbar::${event}`, { detail });

		element.dispatchEvent(evt);
	}

	/**
	 * Handles mouse down events on the addressbar container
	 * @param {MouseEvent} event
	 */
	_onContainerMousedown(event) {
		console.log("_onContainerMousedown", event);

		this._dispatchEvent(this.addressbar, "DrawerOpen");

		this.slot = "panel";
	}

	/**
	 * Handles incoming events to the addressbar container
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "mousedown":
				this._onContainerMousedown(/** @type {MouseEvent} */ (event));
				break;
		}
	}

	connectedCallback() {
		super.connect("addressbar-container", {
			orientation: "horizontal",
			styles: [
				"chrome://dot/content/widgets/browser-addressbar-container.css"
			]
		});

		this.slot = "content";

		this.customizableContainer.appendChild(
			this.addressbar.customizableContainer.content.cloneNode(true)
		);

		this.customizableContainer.addEventListener("mousedown", this);
	}

	disconnectedCallback() {
		this.customizableContainer.removeEventListener("mousedown", this);
	}
}

customElements.define(
	"browser-addressbar-container",
	BrowserAddressbarContainer
);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserAddressBar extends HTMLInputElement {
	constructor() {
		super();

		this.placeholder = "Search the web";
	}

	connectedCallback() {
		this.addEventListener("keypress", this);
	}

	/**
	 * Handles key down events
	 * @param {KeyboardEvent} event
	 */
	onKeyDown(event) {
		switch (event.code) {
			case "Enter":
				this.onBeforeNavigate(event);
				break;
		}
	}

	/**
	 * Handles the process before we start to navigate
	 * @param {Event} event
	 */
	async onBeforeNavigate(event) {
		if (this.value.startsWith("http:")) {
		} else {
			const defaultEngine = await Services.search.getDefault();

			defaultEngine;
		}
	}

	/**
	 * Handles incoming events
	 * @param {KeyboardEvent | Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "keydown":
				this.onKeyDown(/** @type {KeyboardEvent} */ (event));
				break;
		}
	}
}

customElements.define("address-bar", BrowserAddressBar, { extends: "input" });

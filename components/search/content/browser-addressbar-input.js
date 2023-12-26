/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserAddressbarInput extends BrowserContextualMixin(HTMLInputElement) {
	constructor() {
		super();

		this.inputMode = "mozAwesomebar";
		this.placeholder = "Search or enter address";
	}

	/**
	 * Fired when a tab is selected
	 * @param {BrowserTab} tab
	 */
	_onTabSelect(tab) {
		if (tab !== this.hostContext.tab) return;

		this._update();
	}

	/**
	 * Fired when a browser event is sent
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 */
	_onBrowserEvent({ browser }) {
		if (browser !== this.hostContext.browser) return;

		this._update();
	}

	/**
	 * Updates the value of the input from the contextual tab
	 */
	_update() {
		const { location } = this.hostContext.tab;

		this.value = location.inputValue;
	}

	/**
	 * Handles incoming events to the addressbar input
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::TabSelect":
				this._onTabSelect(/** @type {CustomEvent} */ (event).detail);
				break;
			case "BrowserTabs::BrowserStateChange":
			case "BrowserTabs::BrowserLocationChange":
				this._onBrowserEvent(/** @type {CustomEvent} */ (event).detail);
				break;
		}
	}

	connectedCallback() {
		this.toggleAttribute("padded", true);

		window.addEventListener("BrowserTabs::TabSelect", this);
		window.addEventListener("BrowserTabs::BrowserStateChange", this);
		window.addEventListener("BrowserTabs::BrowserLocationChange", this);
	}

	disconnectedCallback() {
		window.removeEventListener("BrowserTabs::TabSelect", this);
		window.removeEventListener("BrowserTabs::BrowserStateChange", this);
		window.removeEventListener("BrowserTabs::BrowserLocationChange", this);
	}
}

customElements.define("browser-addressbar-input", BrowserAddressbarInput, {
	extends: "input"
});

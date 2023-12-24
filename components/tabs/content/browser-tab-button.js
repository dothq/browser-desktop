/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabButton extends BrowserCommandButton {
	constructor() {
		super();

		// Tab buttons can only be in icons mode, due
		// to the restriction of space in tab contents.
		this.mode = "icons";
	}

	connectedCallback() {
		super.connectedCallback();

		this.classList.add("browser-tab-button");
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("browser-tab-button", BrowserTabButton, {
	extends: "button"
});

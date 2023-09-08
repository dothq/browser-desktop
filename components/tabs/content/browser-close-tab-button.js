/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCloseTabButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.routineId = "close-tab";
		this.buttonId = "close-tab-button";
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("close-tab-button", BrowserCloseTabButton, {
	extends: "button"
});

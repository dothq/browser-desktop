/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserSelectAllButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.buttonId = "select-all-button";
		this.commandId = "internal/select-all";
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("select-all-button", BrowserSelectAllButton, {
	extends: "button"
});

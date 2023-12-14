/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCutButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.buttonId = "cut-button";
		this.commandId = "internal/cut";
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("cut-button", BrowserCutButton, {
	extends: "button"
});

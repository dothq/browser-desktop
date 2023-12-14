/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserPasteButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.buttonId = "paste-button";
		this.commandId = "internal/paste";
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("paste-button", BrowserPasteButton, {
	extends: "button"
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomToolbarButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.update();
	}

	update() {
		this.label = this.getArgument("label") || "Button";
		this.icon = this.getArgument("icon") || "info";
		this.mode = this.getArgument("mode") || "";
	}

	connectedCallback() {
		super.connectedCallback();

		this.update();
	}
}

customElements.define("custom-button", BrowserCustomToolbarButton, {
	extends: "button"
});

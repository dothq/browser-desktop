/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserAddressbarPanel extends BrowserPanel {
	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();

		this.setAttribute("animate", "true");

		this.appendChild(
			html(
				"div",
				{ class: "browser-panel-container" },
				html("slot", { name: "panel" })
			)
		);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("browser-addressbar-panel", BrowserAddressbarPanel, {
	extends: "panel"
});

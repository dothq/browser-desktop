/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserAddressBar extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	connectedCallback() {
		super.connect({
			name: "addressbar",

			layout: "addressbar"
		});

		window.addEventListener("BrowserTabs::BrowserLocationChange", this);
		window.addEventListener("BrowserTabs::TabSelect", this);
	}

	disconnectedCallback() {
		window.removeEventListener("BrowserTabs::BrowserLocationChange", this);
		window.removeEventListener("BrowserTabs::TabSelect", this);
	}
}

customElements.define("browser-addressbar", BrowserAddressBar);

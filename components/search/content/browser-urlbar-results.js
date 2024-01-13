/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserUrlbarResults extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	connectedCallback() {
		this.connect("urlbar-results", {
			orientation: "vertical",
			styles: ["chrome://dot/content/widgets/browser-urlbar-results.css"]
		});

		this.customizableContainer.appendChild(html("h1", {}, "Results"));
	}
}

customElements.define("browser-urlbar-results", BrowserUrlbarResults);

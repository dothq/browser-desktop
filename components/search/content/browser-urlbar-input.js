/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserUrlbarInput extends BrowserContextualMixin(HTMLInputElement) {
	connectedCallback() {
		this.setAttribute("inputmode", "mozAwesomebar");
		this.placeholder = "Search using DuckDuckGo or enter address";
	}
}

customElements.define("browser-urlbar-input", BrowserUrlbarInput, {
	extends: "input"
});

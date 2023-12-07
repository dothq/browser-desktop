/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserWebFrame extends MozHTMLElement {
	constructor() {
		super();
	}

	get webContents() {
		return this.querySelector(".browser-web-contents");
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.appendChild(html("browser-status"));
		this.appendChild(html("browser-modals"));
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;
	}
}

customElements.define("browser-web-frame", BrowserWebFrame);

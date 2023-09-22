/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableWebContents extends BrowserCustomizableElement {
	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();

		if (this.customizable.root.querySelector("slot[name=web-contents]")) {
			this.remove();
			return;
		}

		this.appendChild(html("slot", { name: "web-contents" }));
	}
}

customElements.define(
	"customizable-web-contents",
	BrowserCustomizableWebContents
);

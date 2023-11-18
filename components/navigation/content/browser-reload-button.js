/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIWebProgress} nsIWebProgress
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIRequest} nsIRequest
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIChannel} nsIChannel
 */

var { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

class BrowserReloadButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.buttonId = "reload-button";
		this.commandId = "reload-tab";
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("reload-button", BrowserReloadButton, {
	extends: "button"
});

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

		this.routineId = "reload-page";
	}

	connectedCallback() {
		super.connectedCallback();

		window.addEventListener("BrowserTabs::BrowserStateChange", this.handleEvent.bind(this));
	}

	/**
	 * Fired when the state changes a browser
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 * @param {nsIWebProgress} data.webProgress
	 * @param {nsIRequest} data.request
	 * @param {number} data.stateFlags
	 * @param {string} data.status
	 */
	onStateChanged({ browser, webProgress, request, stateFlags, status }) {
		const { STATE_START, STATE_IS_NETWORK } = Ci.nsIWebProgressListener;

		const isLoading =
			webProgress.isTopLevel &&
			stateFlags & STATE_START &&
			stateFlags & STATE_IS_NETWORK &&
			BrowserTabsUtils.shouldShowProgress(/** @type {nsIChannel} */ (request));

		this.routineId = isLoading ? "stop-page" : "reload-page";
	}

	/**
	 * Handle incoming events
	 * @param {MouseEvent | CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::BrowserStateChange":
				this.onStateChanged(event.detail);
				break;
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		window.removeEventListener("BrowserTabs::BrowserStateChange", this.handleEvent.bind(this));
	}
}

customElements.define("reload-button", BrowserReloadButton, {
	extends: "button"
});

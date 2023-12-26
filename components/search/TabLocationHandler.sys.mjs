/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

export class TabLocationHandler {
	/**
	 * @param {BrowserTab} tab
	 */
	constructor(tab) {
		this.tab = tab;

		this.win.addEventListener("BrowserTabs::BrowserLocationChange", this);
	}

	/**
	 * The window associated with this location handler
	 * @type {Window}
	 */
	get win() {
		return this.tab.ownerGlobal;
	}

	/**
	 * The tab associated with this location handler
	 * @type {BrowserTab}
	 */
	tab = null;

	get browser() {
		return this.tab.linkedBrowser;
	}

	/**
	 * The addressbar's input value for this tab
	 * @type {string}
	 */
	inputValue = "";

	/**
	 * Fired when the location of the associated tab changes
	 * @param {CustomEvent<{ browser: ChromeBrowser, webProgress: import("third_party/dothq/gecko-types/lib").nsIWebProgress }>} event
	 */
	_onLocationChanged(event) {
		if (event.detail.browser !== this.browser) return;

		const { webProgress } = event.detail;

		this.inputValue = this.browser.currentURI?.spec || "";
	}

	/**
	 * Handles incoming events to the location handler
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::BrowserLocationChange":
				this._onLocationChanged(/** @type {CustomEvent} */ (event));
				break;
		}
	}
}

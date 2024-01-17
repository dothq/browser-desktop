/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

export class TabCommand extends Command {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.context.window.addEventListener(
			"BrowserTabs::BrowserStateChange",
			this._handleTabEvent.bind(this),
			{ signal: this.abortController.signal }
		);

		this.context.window.addEventListener(
			"BrowserTabs::LocationChange",
			this._handleTabEvent.bind(this),
			{ signal: this.abortController.signal }
		);

		this.context.window.addEventListener(
			"BrowserTabs::TabSelect",
			this._handleTabEvent.bind(this),
			{
				signal: this.abortController.signal
			}
		);
	}

	/**
	 * Fired when the state changes the browser in context
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 * @param {import("third_party/dothq/gecko-types/lib").nsIWebProgress} data.webProgress
	 * @param {import("third_party/dothq/gecko-types/lib").nsIRequest} data.request
	 * @param {number} data.stateFlags
	 * @param {string} data.status
	 */
	onContextualBrowserStateChanged({
		browser,
		webProgress,
		request,
		stateFlags,
		status
	}) {}

	/**
	 * Fired when the location changes the browser in context
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 * @param {import("third_party/dothq/gecko-types/lib").nsIWebProgress} data.webProgress
	 * @param {import("third_party/dothq/gecko-types/lib").nsIRequest} data.request
	 * @param {nsIURI} data.locationURI
	 * @param {number} data.flags
	 * @param {boolean} data.isSimulated
	 */
	onContextualBrowserLocationChanged({
		browser,
		webProgress,
		request,
		locationURI,
		flags,
		isSimulated
	}) {}

	/**
	 * Fired when the contextual tab becomes selected
	 * @param {BrowserTab} tab
	 */
	onContextualTabSelected(tab) {}

	/**
	 * Fired when any tab becomes selected
	 * @param {BrowserTab} tab
	 */
	onTabSelected(tab) {}

	/**
	 * Handles incoming tab events to the command
	 * @param {CustomEvent} event
	 */
	_handleTabEvent(event) {
		switch (event.type) {
			case "BrowserTabs::BrowserStateChange":
				if (event.detail.browser != this.context.browser) return;

				this.onContextualBrowserStateChanged(event.detail);
				break;
			case "BrowserTabs::TabSelect":
				this.onTabSelected(event.detail);
				if (event.detail != this.context.tab) return;

				this.onContextualTabSelected(event.detail);
				break;
			case "BrowserTabs::LocationChange":
				if (event.detail.browser != this.context.browser) return;

				this.onContextualBrowserLocationChanged(event.detail);
				break;
		}
	}
}

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
	 * @param {nsIWebProgress} data.webProgress
	 * @param {nsIRequest} data.request
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
	 * Fired when the contextual tab becomes selected
	 * @param {BrowserTab} tab
	 */
	onContextualTabSelected(tab) {}

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
				if (event.detail != this.context.tab) return;

				this.onContextualTabSelected(event.detail);
				break;
		}
	}
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { StatusManager } = ChromeUtils.importESModule(
	"resource://gre/modules/StatusManager.sys.mjs"
);

/**
 * Formats the items in a list into a formatted string
 * @param {any[]} items
 */
function formatList(items) {
	const formatter = new Intl.ListFormat(undefined, {
		style: "short",
		type: "unit"
	});

	return formatter.format(items);
}

export class BrowserStatus extends StatusManager {
	/**
	 * The currently selected tab
	 */
	get tab() {
		return this.win.gDot.tabs.selectedTab;
	}

	/**
	 * The currently selected browser
	 */
	get browser() {
		return this.tab.linkedBrowser;
	}

	/**
	 * Dispatches a new event with detail
	 * @param {string} name
	 * @param {object} detail
	 * @param {string} detail.type
	 * @param {string} detail.status
	 * @param {ChromeBrowser} [detail.browser]
	 */
	#dispatchEvent(name, detail) {
		const evt = new CustomEvent(`BrowserStatus::${name}`, {
			detail
		});

		this.win.dispatchEvent(evt);
	}

	/**
	 * Fired when a tab's status updates
	 * @param {BrowserTab} tab
	 * @param {"overLink" | "busy" | string} type
	 * @param {string} statusText
	 */
	onTabStatusUpdate(tab, type, statusText) {
		if (tab !== this.tab) return;

		this.#dispatchEvent("BrowserStatusChange", {
			browser: this.browser,
			type,
			status: statusText
		});
	}

	/**
	 * Obtains the current status value by its type for a tab
	 * @param {BrowserTab} tab
	 * @param {string} type
	 */
	getTabStatus(tab, type) {
		return tab.status.getStatus(type);
	}

	/**
	 * Updates the statuspanel
	 * @param {"overLink" | "busy" | string} type
	 * @param {string | string[]} status
	 */
	setStatus(type, status) {
		const statusText = this._setStatus(type, status);

		this.#dispatchEvent("StatusChange", {
			type,
			status: statusText
		});
	}

	/**
	 * Updates the tab statuspanel
	 * @param {BrowserTab} tab
	 * @param {"overLink" | "busy" | string} type
	 * @param {string | string[]} status
	 */
	setTabStatus(tab, type, status) {
		tab.status.setStatus(type, status);
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		super(win);
	}
}

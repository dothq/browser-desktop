/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { StatusManager } = ChromeUtils.importESModule(
	"resource://gre/modules/StatusManager.sys.mjs"
);

export class TabStatusManager extends StatusManager {
	/**
	 * The tab associated with this tab status manager
	 * @type {BrowserTab}
	 */
	#tab = null;

	/**
	 * The browser associated with this tab status manager
	 */
	get browser() {
		return this.#tab.linkedBrowser;
	}

	/**
	 * The global status handler for the whole window
	 */
	get globalStatus() {
		return this.win.gDot.status;
	}

	/**
	 * Updates this tab's status text
	 * @param {"overLink" | "busy" | string} type
	 * @param {string | string[]} status
	 */
	setStatus(type, status) {
		this.globalStatus.onTabStatusUpdate(
			this.#tab,
			type,
			this._setStatus(type, status)
		);
	}

	/**
	 * @param {BrowserTab} tab
	 */
	constructor(tab) {
		super(tab.ownerGlobal);

		this.#tab = tab;
	}
}

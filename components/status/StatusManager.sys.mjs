/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
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

export class StatusManager {
	/** @type {Window} */
	win = null;

	/** @type {Map<string, string>} */
	_status = new Map();

	/**
	 * Obtains the current status value using its type
	 * @param {string} type
	 */
	getStatus(type) {
		return this._status.get(type) || null;
	}

	/**
	 * Updates this tab's status text
	 * @param {"overLink" | "busy" | string} type
	 * @param {string | string[]} status
	 */
	_setStatus(type, status) {
		let statusText =
			status && Array.isArray(status)
				? status
				: [/** @type {string} */ (status)];

		if (type == "overLink" && status) {
			statusText = statusText.map((text) =>
				BrowserTabsUtils.formatURI(text, {
					trimProtocol: true,
					trimTrailingSlash: true
				})
			);
		}

		const value = status && status.length ? formatList(statusText) : null;

		this._status.set(type, value);

		return value;
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.win = win;
	}
}

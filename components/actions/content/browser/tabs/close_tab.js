/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("components/actions/Action.sys.mjs").ActionDispatchEvent<T>} ActionDispatchEvent
 * @template T
 */

const { Action } = ChromeUtils.importESModule(
	"resource://gre/modules/Action.sys.mjs"
);

export class BrowserTabsCloseTabAction extends Action {
	static id = "browser.tabs.close_tab";

	constructor() {
		super();
	}

	/**
	 * The name of this action
	 */
	get name() {
		return "Close tab";
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{ tab: BrowserTab }>} event
	 */
	run(event) {
		const { args } = event.detail;

		args.tab.maybeClose();
	}
}

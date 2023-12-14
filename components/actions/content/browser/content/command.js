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

export class BrowserContentCommandAction extends Action {
	static id = "browser.content.command";

	constructor() {
		super();
	}

	/**
	 * The name of this action
	 */
	get name() {
		return "Command";
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{ command: string; }>} event
	 */
	run(event) {
		const { command } = event.detail.args;
		const win = event.target.ownerGlobal;

		const { gDot } = win;

		gDot.tabs.selectedTab.doCommandInBrowser(command);
	}
}

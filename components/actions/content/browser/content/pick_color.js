/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("components/actions/ActionsIPC.sys.mjs").ActionDispatchEvent<T>} ActionDispatchEvent
 * @template T
 */

const { Action } = ChromeUtils.importESModule(
	"resource://gre/modules/Action.sys.mjs"
);

export class BrowserContentPickColorAction extends Action {
	static id = "browser.content.pick_color";

	constructor() {
		super();
	}

	/**
	 * The name of this action
	 */
	get name() {
		return "Pick Color";
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{ tab: BrowserTab; }>} event
	 */
	async run(event) {
		const { args } = event.detail;

		await args.tab.devTools.toggleColorPickerHighlight();
	}
}

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

export class BrowserPanelsOpenAction extends Action {
	static id = "browser.panels.open";

	constructor() {
		super();
	}

	/**
	 * The name of this action
	 */
	get name() {
		return "Open a panel";
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{ id: string; opener?: Element; }>} event
	 */
	run(event) {
		const { args } = event.detail;

		console.log(
			this.id,
			"open panel",
			args.id,
			"with",
			event.target.context,
			"on",
			args.opener || event.target.context.window
		);
	}
}

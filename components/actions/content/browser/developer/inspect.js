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

const { DevToolsShim } = ChromeUtils.importESModule(
	"chrome://devtools-startup/content/DevToolsShim.sys.mjs"
);

export class BrowserDeveloperInspectAction extends Action {
	static id = "browser.developer.inspect";

	constructor() {
		super();
	}

	/**
	 * The name of this action
	 */
	get name() {
		return "Inspect";
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{ tab: BrowserTab }>} event
	 */
	run(event) {
		const { tab } = event.detail.args;

		DevToolsShim.inspectNode(tab);
	}
}

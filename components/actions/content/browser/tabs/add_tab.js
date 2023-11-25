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

export class BrowserTabsAddTabAction extends Action {
	static id = "browser.tabs.add_tab";

	constructor() {
		super();
	}

	/**
	 * The name of this action
	 */
	get name() {
		return "Create tab";
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{ url: string | string[] }>} event
	 */
	run(event) {
		const { args } = event.detail;

		if (!args.url) throw new Error("No 'url' argument supplied!");

		const win = event.target.ownerGlobal;
		const { gDot } = win;

		const params = {
			triggeringPrincipal:
				Services.scriptSecurityManager.getSystemPrincipal()
		};

		gDot.tabs.createTabs(
			Array.isArray(args.url) ? args.url : [args.url],
			params
		);
	}
}

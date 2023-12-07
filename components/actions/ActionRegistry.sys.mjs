/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Action } = ChromeUtils.importESModule(
	"resource://gre/modules/Action.sys.mjs"
);

const ALL_ACTIONS = [
	// browser.panels
	"browser.panels.open",

	// browser.tabs
	"browser.tabs.add_tab",
	"browser.tabs.close_tab",
	"browser.tabs.go_back",
	"browser.tabs.go_forward",
	"browser.tabs.reload_page",
	"browser.tabs.stop_page"
];

/**
 * @extends {Map<string, Action>}
 */
export class ActionRegistry extends Map {
	/** @type {Window} */
	#win = null;

	/**
	 * Registers a new action to the registry
	 * @param {string} path
	 */
	registerAction(path) {
		const mod = ChromeUtils.importESModule(
			`chrome://dot/content/actions/${path.replace(/\./g, "/")}.js`
		);

		const initialExport = Object.values(mod)[0];

		if (!("id" in initialExport)) {
			throw new Error(
				`${this.constructor.name}: Cannot register action as it is missing a static id property!`
			);
		}

		this.set(initialExport.id, initialExport);
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		super();

		this.#win = win;

		// Register all our actions
		for (const action of ALL_ACTIONS) {
			this.registerAction(action);
		}
	}
}

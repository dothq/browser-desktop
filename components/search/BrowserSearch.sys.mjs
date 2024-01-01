/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ConsoleAPI } = ChromeUtils.importESModule(
	"resource://gre/modules/Console.sys.mjs"
);

export class BrowserSearch {
	/**
	 * @type {Window}
	 */
	#win = null;

	/**
	 * The logger singleton for the search module
	 * @type {Console}
	 */
	get logger() {
		if (this._logger) return this._logger;

		return (this._logger = new ConsoleAPI({
			maxLogLevel: "warn",
			maxLogLevelPref: "dot.search.loglevel",
			prefix: `${this.constructor.name}`
		}));
	}

	/**
	 * Initialises the search module
	 */
	#init() {
		this.logger.debug(`Initializing ${this.constructor.name}...`);
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.#win = win;

		this.#init();
	}
}

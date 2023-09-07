/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { AddonManager } = ChromeUtils.importESModule(
	"resource://gre/modules/AddonManager.sys.mjs"
);

export class BrowserSearch {
	_isSearchServiceReady = false;

	/**
	 * The internal search service
	 */
	get _servicePromise() {
		if (this._isSearchServiceReady) return Promise.resolve(Services.search);

		return Services.search.init().then((_) => {
			this._isSearchServiceReady = true;
			return Services.search;
		});
	}

	/**
	 * Returns a list of all installed search engines
	 */
	async getEngines() {
		return this._servicePromise.then((service) => {
			return service.getEngines();
		});
	}

	_defaultEngineId = "";

	/**
	 * The user's default search engine
	 */
	get defaultEngine() {
		return this._servicePromise.then(async (service) => {
			return service.defaultEngine;
		});
	}

	/**
	 * The ID of the user's default search engine
	 */
	get defaultEngineId() {
		return this._defaultEngineId;
	}

	/**
	 * Updates the defaultEngine getter using an ID
	 */
	set defaultEngineId(newId) {
		this._servicePromise.then(async (service) => {
			const engine = service.getEngineById(newId);

			await service.setDefault(engine);
			this._defaultEngineId = newId;
		});
	}

	async init() {
		const service = await this._servicePromise;

		this._defaultEngineId = service.defaultEngine.id;
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.win = win;

		this.init();
	}
}

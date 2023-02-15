/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DotCustomizableUI } from "../../components/customizableui/CustomizableUI";

ChromeUtils.defineESModuleGetters(globalThis, {
	DotAppConstants: "resource://app/modules/DotAppConstants.sys.mjs"
});

/**
 * Registers all web components needed in the UI.
 *
 * @note Use of inline require here is normal, despite this being an ES Module.
 */
const registerWebComponents = async () => {
	require("resource://dot/components/browser-element/content/StatusPanel");
	require("resource://dot/components/panel/Panel");
};

// This is exported only for type checking reasons, this should never be imported directly
export const _dBrowser = {
	_done: false,

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (this._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

		// Call Mozilla's gBrowser init method
		window._gBrowser.init();

		registerWebComponents();

		DotCustomizableUI.initialize();

		this._done = true;
	}
};

/**
 * Proxy wrapper for Dot Browser and Mozilla APIs
 *
 * Allows for incremental adoption of features and services
 * without breaking existing functionality in dependent code
 *
 * @deprecated This should never be imported directly! Instead use the **gBrowser** global.
 */
export const _gBrowser = new Proxy(_dBrowser, {
	get: (target, key) => {
		const targetToUse = target[key] ? target : window._gBrowser;
		const value = targetToUse[key];

		return value instanceof Function ? value.bind(targetToUse) : value;
	},
	set(target, key, newValue) {
		if (target[key]) {
			target[key] = newValue;
		} else if (window._gBrowser[key]) {
			window._gBrowser[key] = newValue;
		}

		return true;
	}
}) as typeof window.gBrowser;

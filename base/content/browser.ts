/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.defineESModuleGetters(globalThis, {
	DotAppConstants: "resource://gre/modules/DotAppConstants.sys.mjs",
	DotCustomizableUI: "resource:///modules/DotCustomizableUI.sys.mjs"
});

const { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

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

	openLinkIn: NavigationHelper.openLinkIn.bind(this, window),
	loadOneOrMoreURIs: NavigationHelper.loadOneOrMoreURIs.bind(this, window),

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

		// @todo(EnderDev) add types for DotCustomizableUI
		globalThis.DotCustomizableUI.initialize();

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
export const _gBrowser = (function () {
	const validator = {
		get: (target: typeof window.gBrowser, key: string) => {
			const targetToUse = target[key] ? target : window._gBrowser;
			const value = targetToUse[key];

			return value instanceof Function ? value.bind(targetToUse) : value;
		},
		set(target: typeof window.gBrowser, key: string, newValue: any) {
			if (target[key]) {
				target[key] = newValue;
			} else if (window._gBrowser[key]) {
				window._gBrowser[key] = newValue;
			}

			return true;
		}
	};

	return new Proxy(_dBrowser, validator);
})() as typeof window.gBrowser;

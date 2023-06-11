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

const { BrowserTabs } = ChromeUtils.importESModule(
	"resource:///modules/BrowserTabs.sys.mjs"
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
export const _gDot = {
	_done: false,

    tabs: BrowserTabs,

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (this._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

		// Call Mozilla's gBrowser init method
		// window._gBrowser.init();

		registerWebComponents();

		// @todo(EnderDev) add types for DotCustomizableUI
		globalThis.DotCustomizableUI.initialize();

		this._done = true;
	}
};
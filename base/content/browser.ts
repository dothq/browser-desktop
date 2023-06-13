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

// This is exported only for type checking reasons, this should never be imported directly
export const _gDot = {
	_done: false,

    tabs: BrowserTabs,

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (gDot._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

		// Call Mozilla's gBrowser init method
		// window._gBrowser.init();

        gDot.tabs.init(window);

		// @todo(EnderDev) add types for DotCustomizableUI
		globalThis.DotCustomizableUI.initialize();

		gDot._done = true;
	}
};
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.defineESModuleGetters(globalThis, {
	DotAppConstants: "resource://gre/modules/DotAppConstants.sys.mjs",
	DotCustomizableUI: "resource:///modules/DotCustomizableUI.sys.mjs"
});

var { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

var { BrowserTabs } = ChromeUtils.importESModule(
	"resource:///modules/BrowserTabs.sys.mjs"
);

// This is exported only for type checking reasons, this should never be imported directly
export const _gDot = {
	_done: false,

    tabs: BrowserTabs,

    /**
     * Determines whether the browser session supports multiple processes
     */
    get isMultiProcess(): boolean {
        return window.docShell.QueryInterface(
            Ci.nsILoadContext
        ).useRemoteTabs
    },

    /**
     * Determines whether this browser session uses remote subframes
     */
    get usesRemoteSubframes(): boolean {
        return window.docShell.QueryInterface(
            Ci.nsILoadContext
        ).useRemoteSubframes;
    },

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
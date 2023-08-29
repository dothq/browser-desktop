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

var { NativeTitlebar } = ChromeUtils.importESModule(
    "resource:///modules/NativeTitlebar.sys.mjs"
);

// This is exported only for type checking reasons, this should never be imported directly
export const _gDot = {
	_done: false,

    tabs: null as typeof BrowserTabs.prototype,

    /**
     * The toolbox for this browser session
     */
    get toolbox() {
        return document.querySelector("browser-toolbox") as BrowserToolbox;
    },

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
     * Determines whether the current browser window is a popup
     */
    get isPopupWindow() {
        return (
            document.documentElement.hasAttribute("chromehidden") && 
            document.documentElement.hasAttribute("chromepopup")
        );
    },

    get usesNativeTitlebar() {
        return NativeTitlebar.enabled;
    },

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (gDot._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

        gDot.tabs = new BrowserTabs(window);

		// @todo(EnderDev) add types for DotCustomizableUI
		globalThis.DotCustomizableUI.initialize();

        gDotRoutines.init();

		gDot._done = true;
	}
};
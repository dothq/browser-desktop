/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.defineESModuleGetters(globalThis, {
	DotAppConstants: "resource://gre/modules/DotAppConstants.sys.mjs"
});

var { DotCustomizableUI } = ChromeUtils.importESModule(
	"resource:///modules/DotCustomizableUI.sys.mjs"
);

var { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

var { BrowserTabs } = ChromeUtils.importESModule(
	"resource:///modules/BrowserTabs.sys.mjs"
);

var { BrowserSearch } = ChromeUtils.importESModule(
	"resource:///modules/BrowserSearch.sys.mjs"
);

var { NativeTitlebar } = ChromeUtils.importESModule(
	"resource:///modules/NativeTitlebar.sys.mjs"
);

// This is exported only for type checking reasons, this should never be imported directly
const _gDot = {
	_done: false,

	/** @type {typeof BrowserTabs.prototype} */
	tabs: null,

	/** @type {typeof BrowserSearch.prototype} */
	search: null,

	/**
	 * The toolbox for this browser session
	 * @returns {BrowserToolbox}
	 */
	get toolbox() {
		return document.querySelector("browser-toolbox");
	},

	/**
	 * Determines whether the browser session supports multiple processes
	 * @returns {boolean}
	 */
	get isMultiProcess() {
		return window.docShell.QueryInterface(Ci.nsILoadContext).useRemoteTabs;
	},

	/**
	 * Determines whether this browser session uses remote subframes
	 * @returns {boolean}
	 */
	get usesRemoteSubframes() {
		return window.docShell.QueryInterface(Ci.nsILoadContext)
			.useRemoteSubframes;
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

	get prefersReducedMotion() {
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	},

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (gDot._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

		gDot.tabs = new BrowserTabs(window);
		gDot.search = new BrowserSearch(window);

		DotCustomizableUI.init(window);

		gDotRoutines.init();

		// Listens for changes to the reduced motion preference
		window
			.matchMedia("(prefers-reduced-motion: reduce)")
			.addEventListener("change", (e) => {
				document.documentElement.toggleAttribute(
					"reducedmotion",
					e.matches
				);
			});

		gDot._done = true;
	}
};

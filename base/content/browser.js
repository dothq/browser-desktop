/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.defineESModuleGetters(globalThis, {
	DotAppConstants: "resource://gre/modules/DotAppConstants.sys.mjs"
});

var { BrowserCustomizable } = ChromeUtils.importESModule(
	"resource:///modules/BrowserCustomizable.sys.mjs"
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

var { BrowserShortcuts } = ChromeUtils.importESModule(
	"resource:///modules/BrowserShortcuts.sys.mjs"
);

var { NativeTitlebar } = ChromeUtils.importESModule(
	"resource:///modules/NativeTitlebar.sys.mjs"
);

class BrowserApplication extends MozHTMLElement {
	constructor() {
		super();
	}

	_done = false;

	/** @type {typeof BrowserCustomizable.prototype} */
	customizable = null;

	/** @type {typeof BrowserTabs.prototype} */
	tabs = null;

	/** @type {typeof BrowserSearch.prototype} */
	search = null;

	/** @type {typeof BrowserShortcuts.prototype} */
	shortcuts = null;

	/**
	 * Determines whether the browser session supports multiple processes
	 * @returns {boolean}
	 */
	get isMultiProcess() {
		return window.docShell.QueryInterface(Ci.nsILoadContext).useRemoteTabs;
	}

	/**
	 * Determines whether this browser session uses remote subframes
	 * @returns {boolean}
	 */
	get usesRemoteSubframes() {
		return window.docShell.QueryInterface(Ci.nsILoadContext)
			.useRemoteSubframes;
	}

	/**
	 * Determines whether the current browser window is a popup
	 */
	get isPopupWindow() {
		return (
			document.documentElement.hasAttribute("chromehidden") &&
			document.documentElement.hasAttribute("chromepopup")
		);
	}

	get usesNativeTitlebar() {
		return NativeTitlebar.enabled;
	}

	get prefersReducedMotion() {
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.attachShadow({ mode: "open" });

		this.shadowRoot.appendChild(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/skin/browser.css"
			})
		);
	}

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (this._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

		this.customizable = new BrowserCustomizable(this);
		this.tabs = new BrowserTabs(window);
		this.search = new BrowserSearch(window);
		this.shortcuts = new BrowserShortcuts(window);

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

		this._done = true;
	}
}

customElements.define("browser-application", BrowserApplication);

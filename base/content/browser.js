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

var { BrowserCommands } = ChromeUtils.importESModule(
	"resource:///modules/BrowserCommands.sys.mjs"
);

var { BrowserActions } = ChromeUtils.importESModule(
	"resource:///modules/BrowserActions.sys.mjs"
);

var { BrowserPanels } = ChromeUtils.importESModule(
	"resource:///modules/BrowserPanels.sys.mjs"
);

var { BrowserStorage } = ChromeUtils.importESModule(
	"resource:///modules/BrowserStorage.sys.mjs"
);

var { BrowserAccessibility } = ChromeUtils.importESModule(
	"resource:///modules/BrowserAccessibility.sys.mjs"
);

var { NativeTitlebar } = ChromeUtils.importESModule(
	"resource:///modules/NativeTitlebar.sys.mjs"
);

var { DOMUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/DOMUtils.sys.mjs"
);

var { CommandAudiences } = ChromeUtils.importESModule(
	"resource:///modules/CommandAudiences.sys.mjs"
);

class BrowserApplication extends BrowserCustomizableArea {
	constructor() {
		super();

		this.toolbarMutationObserver = new MutationObserver(
			this.maybePromoteToolbars.bind(this)
		);
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

	/** @type {typeof BrowserCommands.prototype} */
	commands = null;

	/** @type {typeof BrowserActions.prototype} */
	actions = null;

	/** @type {typeof BrowserPanels.prototype} */
	panels = null;

	/** @type {typeof BrowserStorage.prototype} */
	storage = null;

	/** @type {typeof BrowserAccessibility.prototype} */
	accessibility = null;

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
		super.connect("root", {
			orientation: "vertical"
		});

		this.toolbarMutationObserver.observe(this, {
			childList: true,
			attributes: true,
			attributeFilter: ["initial"]
		});

		this.addEventListener(
			"CustomizableUI::DidMount",
			this.didMount.bind(this)
		);
	}

	/**
	 * The customizable components to inherit from when used in this area
	 */
	static get customizableComponents() {
		return {
			// Using a toolbar button here, as there's no point
			// creating a button specifically for root use
			button: html("button", { is: "browser-toolbar-button" })
		};
	}

	/**
	 * The context for the entire browser application
	 */
	get context() {
		const self = this;

		return {
			self,
			audience: CommandAudiences.DEFAULT,

			get window() {
				return self.ownerGlobal;
			},

			get tab() {
				return self.tabs.selectedTab;
			},

			get browser() {
				return this.tab.linkedBrowser;
			}
		};
	}

	/**
	 * Fired when the browser mounts its customizable UI
	 */
	didMount() {
		this.maybePromoteToolbars();
	}

	/**
	 * Determines which toolbar can be considered "initial"
	 *
	 * Initial is an attribute we can add onto a browser-toolbar,
	 * giving it control of the window CSD.
	 *
	 * Typically, the initial toolbar will be the one closest to
	 * the top of the window, to keep the CSD position consistent
	 */
	maybePromoteToolbars() {
		const toolbars = DOMUtils.shadowedQuerySelectorAll(
			this,
			"browser-toolbar"
		);

		if (toolbars.length) {
			/** @type {[number, Element][]} */
			const boundings = toolbars.map((tb) => [
				tb.getBoundingClientRect().y,
				tb
			]);

			const initialToolbar = boundings.sort((a, b) => a[0] - b[0])[0][1];

			for (const toolbar of toolbars) {
				toolbar.toggleAttribute("initial", toolbar === initialToolbar);
			}
		}
	}

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (this._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

		this.storage = new BrowserStorage(window);
		this.customizable = new BrowserCustomizable(this);
		this.tabs = new BrowserTabs(window);
		this.search = new BrowserSearch(window);
		this.shortcuts = new BrowserShortcuts();
		this.commands = new BrowserCommands(window);
		this.actions = new BrowserActions(this);
		this.panels = new BrowserPanels(window);
		this.accessibility = new BrowserAccessibility(window);

		document.commandDispatcher.addCommandUpdater(this, "*", "*");

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

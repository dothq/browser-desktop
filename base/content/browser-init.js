/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { XPCOMUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/XPCOMUtils.sys.mjs"
);

ChromeUtils.defineESModuleGetters(globalThis, {
	DevToolsShim: "chrome://devtools-startup/content/DevToolsShim.sys.mjs",
	SessionStartup: "resource:///modules/sessionstore/SessionStartup.sys.mjs",
	SessionStore: "resource:///modules/sessionstore/SessionStore.sys.mjs"
});

XPCOMUtils.defineLazyScriptGetter(
	globalThis,
	[
		"BrowserAddonUI",
		"gExtensionsNotifications",
		"gUnifiedExtensions",
		"gXPInstallObserver"
	],
	"chrome://browser/content/browser-addons.js"
);

XPCOMUtils.defineLazyModuleGetters(globalThis, {
	AddonManager: "resource://gre/modules/AddonManager.jsm"
});

XPCOMUtils.defineLazyServiceGetters(globalThis, {
	BrowserHandler: ["@mozilla.org/browser/clh;1", "nsIBrowserHandler"]
});

var { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

var { Color } = ChromeUtils.importESModule(
	"resource://gre/modules/Color.sys.mjs"
);

var { LightweightThemeConsumer } = ChromeUtils.importESModule(
	"resource://gre/modules/LightweightThemeConsumer.sys.mjs"
);

var { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

var { DotWindowTracker } = ChromeUtils.importESModule(
	"resource:///modules/DotWindowTracker.sys.mjs"
);

var { nsBrowserAccess } = ChromeUtils.importESModule(
	"resource:///modules/DotBrowserWindow.sys.mjs"
);

var { NativeTitlebar } = ChromeUtils.importESModule(
	"resource:///modules/NativeTitlebar.sys.mjs"
);

var { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

var { DevToolsSocketStatus } = ChromeUtils.importESModule(
	"resource://devtools/shared/security/DevToolsSocketStatus.sys.mjs"
);

var { ModifierKeyManager } = ChromeUtils.importESModule(
	"resource://gre/modules/ModifierKeyManager.sys.mjs"
);

var { AccentColorManager } = ChromeUtils.importESModule(
	"resource://gre/modules/AccentColorManager.sys.mjs"
);

/**
 * This is used to delay the startup of the browser
 * until we have completed the delayed startup.
 */
globalThis.delayedStartupPromise = new Promise((resolve) => {
	// We are assuming this is already defined by chrome://browser/content/browser.js
	globalThis._resolveDelayedStartup = resolve;
});

if (AppConstants.ENABLE_WEBDRIVER) {
	XPCOMUtils.defineLazyServiceGetter(
		globalThis,
		"Marionette",
		"@mozilla.org/remote/marionette;1",
		"nsIMarionette"
	);

	XPCOMUtils.defineLazyServiceGetter(
		globalThis,
		"RemoteAgent",
		"@mozilla.org/remote/agent;1",
		"nsIRemoteAgent"
	);
} else {
	globalThis.Marionette = { running: false };
	globalThis.RemoteAgent = { running: false };
}

const gRemoteControl = {
	observe(subject, topic, data) {
		this.updateVisualCue();
	},

	updateVisualCue() {
		// Disable updating the remote control cue for performance tests,
		// because these could fail due to an early initialization of Marionette.
		const disableRemoteControlCue = Services.prefs.getBoolPref(
			"browser.chrome.disableRemoteControlCueForTests",
			false
		);

		if (disableRemoteControlCue && Cu.isInAutomation) {
			return;
		}

		const doc = document.documentElement;

		if (this.isBeingControlled()) {
			doc.setAttribute("remotecontrol", "true");
		} else {
			doc.removeAttribute("remotecontrol");
		}
	},

	isBeingControlled() {
		return (
			DevToolsSocketStatus.hasSocketOpened({
				excludeBrowserToolboxSockets: true
			}) ||
			Marionette.running ||
			RemoteAgent.running
		);
	}
};

/** @global */
var gDotInit = {
	_startTime: Date.now(),

	_canBlur: true,

	onBeforeInitialXULLayout() {
		// Add an observer to watch all pref changes.
		Services.prefs.addObserver("", (...args) => console.log(...args));

		Services.obs.addObserver(
			(...args) => console.log(...args),
			"look-and-feel-changed"
		);

		// Set a sane starting width/height for all resolutions on new profiles.
		if (Services.prefs.getBoolPref("privacy.resistFingerprinting")) {
			// When the fingerprinting resistance is enabled, making sure that we don't
			// have a maximum window to interfere with generating rounded window dimensions.
			document.documentElement.setAttribute("sizemode", "normal");
		} else if (!document.documentElement.hasAttribute("width")) {
			const TARGET_WIDTH = 1280;
			const TARGET_HEIGHT = 1040;
			let width = Math.min(screen.availWidth * 0.9, TARGET_WIDTH);
			let height = Math.min(screen.availHeight * 0.9, TARGET_HEIGHT);

			document.documentElement.setAttribute("width", width.toString());
			document.documentElement.setAttribute("height", height.toString());

			if (width < TARGET_WIDTH && height < TARGET_HEIGHT) {
				document.documentElement.setAttribute("sizemode", "maximized");
			}
		}

		NativeTitlebar.init(document);
		ModifierKeyManager.init(window);

		new LightweightThemeConsumer(document);
		new AccentColorManager(document);

		// Check whether we are on Windows 8, if so apply a dark window frame if it is dark enough
		if (AppConstants.platform == "win") {
			if (
				window.matchMedia("(-moz-platform: windows-win8)").matches &&
				window.matchMedia("(-moz-windows-default-theme)").matches
			) {
				var { Windows8WindowFrameColor } = ChromeUtils.importESModule(
					"resource:///modules/Windows8WindowFrameColor.sys.mjs"
				);
				const windowFrameColor = new Color(
					Windows8WindowFrameColor.get()
				);

				// Default to black for foreground text.
				if (
					!windowFrameColor.isContrastRatioAcceptable(
						new Color(0, 0, 0)
					)
				) {
					document.documentElement.setAttribute(
						"darkwindowframe",
						"true"
					);
				}
			}
		}
	},

	onDOMContentLoaded() {
		console.time("onDOMContentLoaded");

		// Creates an nsIXULBrowserWindow instance to handle browser communication and events
		const XULBrowserWindow = new nsIXULBrowserWindow();

		window.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;
		globalThis.XULBrowserWindow = XULBrowserWindow;
		window.browserDOMWindow = new nsBrowserAccess(window);

		Object.defineProperty(globalThis, "gDot", {
			get: () => {
				if (document.querySelector("browser-application")) {
					return document.querySelector("browser-application");
				}

				const app = document.createElement("browser-application");
				document.body.appendChild(app);
				return app;
			}
		});

		// @ts-ignore
		delete globalThis._gDot;

		// Initialise browser
		gDot.init();

		DotWindowTracker.track(window);

		console.timeEnd("onDOMContentLoaded");
	},

	getTabToAdopt() {
		// If we've already checked for a tab to adopt, return it
		if (this._tabToAdopt !== undefined) return this._tabToAdopt;

		// Checking whether the first argument provided to the window is a XULElement type
		if (
			window.arguments &&
			window.XULElement.isInstance(window.arguments[0])
		) {
			this._tabToAdopt = window.arguments[0];

			// Remove the tab property from arguments
			window.arguments[0] = null;
		} else {
			// If we don't have a tab to adopt, set this to null
			this._tabToAdopt = null;
		}

		return this._tabToAdopt;
	},

	_uriToLoadPromise: null,
	get uriToLoadPromise() {
		// Delete the existing promise if it exists
		delete this._uriToLoadPromise;

		// Create a new promise for us to use once
		return (this._uriToLoadPromise = (() => {
			// The first argument is going to be the URI to load
			// This can be in a few different formats, so we need to handle them all
			const uri = window.arguments?.[0];

			// If it is a XULElement, we don't want to load it as it is a tab
			// Tab adoption is handled in getTabToAdopt()
			if (!uri || window.XULElement.isInstance(uri)) {
				return null;
			}

			// Get the default arguments of the browser
			// This is going to be the homepage most of the time
			const defaultArgs = globalThis.BrowserHandler.defaultArgs;

			if (uri != defaultArgs) {
				// If the argument passed url is not the same as the one
				// in the default arguments, we want to load it.

				console.log("Not default", uri);

				if (uri instanceof Ci.nsIArray) {
					// Transform the nsIArray of nsISupportsString's into a JS Array of
					// JS strings.
					return Array.from(
						/** @type {any} */ (uri).enumerate(
							Ci.nsISupportsString
						),
						(supportStr) => supportStr.data
					);
				} else if (uri instanceof Ci.nsISupportsString) {
					return uri.data;
				} else if (defaultArgs.includes("|")) {
					return Array.from(
						new Set([...defaultArgs.split("|"), uri])
					);
				}

				return uri;
			}

			return uri;
		})());
	},

	/**
	 * Gets the initial URL to load when booting the browser
	 * For the first execution, this will probably be a promise
	 * so we need to wait until it resolves before loading the URL.
	 * @param {(uriToLoad: string | string[]) => void} callback
	 */
	callWithURIToLoad(callback) {
		const uriToLoad = this.uriToLoadPromise;
		if (uriToLoad && uriToLoad.then) {
			uriToLoad.then(callback);
		} else {
			callback(uriToLoad);
		}
	},

	handleURIToLoad() {
		this.callWithURIToLoad((uriToLoad) => {
			// If we don't have a URL to load, we don't need to do anything
			if (!uriToLoad) return;

			console.log("uriToLoad", uriToLoad);

			// window.arguments[1]: extraOptions (nsIPropertyBag)
			//                 [2]: referrerInfo (nsIReferrerInfo)
			//                 [3]: postData (nsIInputStream)
			//                 [4]: allowThirdPartyFixup (bool)
			//                 [5]: userContextId (int)
			//                 [6]: originPrincipal (nsIPrincipal)
			//                 [7]: originStoragePrincipal (nsIPrincipal)
			//                 [8]: triggeringPrincipal (nsIPrincipal)
			//                 [9]: allowInheritPrincipal (bool)
			//                 [10]: csp (nsIContentSecurityPolicy)
			//                 [11]: nsOpenWindowInfo

			// We need to check if the URL is a string or an array
			// Handle these cases separately, but we don't need to
			// handle XULElement as it has already been handled and
			// cleared.
			if (Array.isArray(uriToLoad)) {
				// If the URI is malformed, loadTabs will throw an exception.
				// Ensure we handle this to not disrupt the browser boot.
				try {
					gDot.tabs.createTabs(uriToLoad, {
						inBackground: false,
						replaceInitialTab: true,
						userContextId: window.arguments[5],
						triggeringPrincipal:
							window.arguments[8] ||
							Services.scriptSecurityManager.getSystemPrincipal(),
						allowInheritPrincipal: window.arguments[9],
						csp: window.arguments[10],
						fromExternal: true
					});
				} catch (e) {
					console.error("Failed to create multiple tabs", e);
				}
			} else if (window.arguments.length >= 3) {
				const userContextId =
					window.arguments[5] != undefined
						? window.arguments[5]
						: Ci.nsIScriptSecurityManager.DEFAULT_USER_CONTEXT_ID;

				let hasValidUserGestureActivation = undefined;
				let fromExternal = undefined;
				let globalHistoryOptions = undefined;
				let triggeringRemoteType = undefined;
				let forceAllowDataURI = false;

				// Check if we have any extra options
				if (window.arguments[1]) {
					// Check if the extra options are a type of property bag
					if (!(window.arguments[1] instanceof Ci.nsIPropertyBag2)) {
						throw new Error(
							"window.arguments[1] must be null or Ci.nsIPropertyBag2!"
						);
					}

					const extraOptions = window.arguments[1];

					if (extraOptions.hasKey("hasValidUserGestureActivation"))
						hasValidUserGestureActivation =
							extraOptions.getPropertyAsBool(
								"hasValidUserGestureActivation"
							);

					if (extraOptions.hasKey("fromExternal"))
						fromExternal =
							extraOptions.getPropertyAsBool("fromExternal");

					if (extraOptions.hasKey("triggeringRemoteType"))
						triggeringRemoteType =
							extraOptions.getPropertyAsACString(
								"triggeringRemoteType"
							);

					if (extraOptions.hasKey("forceAllowDataURI"))
						forceAllowDataURI =
							extraOptions.getPropertyAsBool("forceAllowDataURI");
				}

				try {
					openLinkIn(uriToLoad, "current", {
						referrerInfo: window.arguments[2] || null,
						postData: window.arguments[3] || null,
						allowThirdPartyFixup: window.arguments[4] || false,
						userContextId,
						// pass the origin principal (if any) and force its use to create
						// an initial about:blank viewer if present:
						originPrincipal: window.arguments[6],
						originStoragePrincipal: window.arguments[7],
						triggeringPrincipal: window.arguments[8],
						// TODO fix allowInheritPrincipal to default to false.
						// Default to true unless explicitly set to false because of bug 1475201.
						allowInheritPrincipal: window.arguments[9] !== false,
						csp: window.arguments[10],
						forceAboutBlankViewerInCurrent: !!window.arguments[6],
						forceAllowDataURI,
						hasValidUserGestureActivation,
						fromExternal,
						globalHistoryOptions,
						triggeringRemoteType
					});
				} catch (e) {
					console.error(e);
				}
				window.focus();
			} else {
				console.log(uriToLoad);
				// Note: loadOneOrMoreURIs *must not* be called if window.arguments.length >= 3.
				// Such callers expect that window.arguments[0] is handled as a single URI.
				loadOneOrMoreURIs(
					uriToLoad,
					Services.scriptSecurityManager.getSystemPrincipal(),
					null
				);
			}
		});
	},

	cancelDelayedStartup() {
		window.removeEventListener("MozAfterPaint", this._boundDelayedStartup);
		this._boundDelayedStartup = null;
	},

	doDelayedStartup() {
		console.log("doDelayedStartup");

		// Cancel delayed startup to avoid duplicate calls to this function
		this.cancelDelayedStartup();

		// Initialise the hidden DOM window here, as we need it for macOS.
		// hiddenDOMWindow is used to call certain APIs, especially from the
		// menu bar/context menus when a main browser window is not available.
		Services.appShell.hiddenDOMWindow;

		// Listen for any changes to the permission state
		// This is typically fired when there is user gesture
		// to a permission request such as block/allow/ignore.
		console.log(
			"gBrowser::addEventListener",
			"PermissionStateChange",
			true
		);

		this.handleURIToLoad();

		Services.obs.addObserver(gRemoteControl, "devtools-socket");
		Services.obs.addObserver(gRemoteControl, "marionette-listening");
		Services.obs.addObserver(gRemoteControl, "remote-listening");

		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-disabled"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-started"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-blocked"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-fullscreen-blocked"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-origin-blocked"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-policy-blocked"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-webapi-blocked"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-failed"
		);
		Services.obs.addObserver(
			globalThis.gXPInstallObserver,
			"addon-install-confirmation"
		);

		this.delayedStartupFinished = true;
		globalThis._resolveDelayedStartup();
		Services.obs.notifyObservers(
			window,
			"browser-delayed-startup-finished"
		);
	},

	onLoad() {
		console.time("onLoad");

		Services.obs.notifyObservers(window, "browser-window-ready");

		// @todo: make the url bar disabled if the toolbar is not visible
		// i.e in a popup window
		if (!window.toolbar.visible) {
		}

		// Ensure we update the remote control visual cue
		gRemoteControl.updateVisualCue();

		// Get the tab to adopt if there is one
		const tabToAdopt = this.getTabToAdopt();

		if (tabToAdopt) {
			// Stop the about:blank load in the new tab
			console.log("gBrowser::stop()");
			// Ensure we have the docShell in memory
			console.log("gBrowser::docShell");

			// @todo: we need to write the logic for swapping the browsers out with the new tab to adopt
			console.log("tabToAdopt", tabToAdopt);
		}

		// Wait until chrome is painted before executing code not critical to making the window visible
		this._boundDelayedStartup = this.doDelayedStartup.bind(this);
		window.addEventListener("MozAfterPaint", this._boundDelayedStartup);

		console.timeEnd("onLoad");

		if (!Services.prefs.getBoolPref("dot.startup.did-first-run", false)) {
			Services.prefs.setBoolPref("dot.startup.did-first-run", true);
			Services.prefs.lockPref("dot.startup.did-first-run");
		}

		console.debug(`gDotInit: ready in ${Date.now() - this._startTime}ms`);
	},

	onUnload() {
		console.time("onUnload");

		console.timeEnd("onUnload");
	},

	/**
	 * Handles window closing events
	 * @param {Event} event
	 */
	onWindowClosing(event) {
		// Determines whether the browser is allowed to close
		console.log("WindowIsClosing", event);
		return true;
	}
};

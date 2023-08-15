/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants, Color, nsIArray, nsIURI } from "../../third_party/dothq/gecko-types/lib";
import { _gDot } from "./browser";
import { BrowserRemoteControl } from "./browser-remote-control";
import { TabsProgressListener } from "./browser-tabs";
import { nsIXULBrowserWindow } from "./browser-window";

const { XPCOMUtils } = ChromeUtils.importESModule("resource://gre/modules/XPCOMUtils.sys.mjs");

ChromeUtils.defineESModuleGetters(globalThis, {
	DevToolsShim: "chrome://devtools-startup/content/DevToolsShim.sys.mjs",
	SessionStartup: "resource:///modules/sessionstore/SessionStartup.sys.mjs",
	SessionStore: "resource:///modules/sessionstore/SessionStore.sys.mjs"
});

XPCOMUtils.defineLazyScriptGetter(
	globalThis,
	["BrowserAddonUI", "gExtensionsNotifications", "gUnifiedExtensions", "gXPInstallObserver"],
	"chrome://browser/content/browser-addons.js"
);

XPCOMUtils.defineLazyModuleGetters(globalThis, {
    AddonManager: "resource://gre/modules/AddonManager.jsm"
})

XPCOMUtils.defineLazyServiceGetters(globalThis, {
	BrowserHandler: ["@mozilla.org/browser/clh;1", "nsIBrowserHandler"]
});

var { AppConstants } = ChromeUtils.importESModule("resource://gre/modules/AppConstants.sys.mjs");

var { Color } = ChromeUtils.importESModule("resource://gre/modules/Color.sys.mjs");

var { LightweightThemeConsumer } = ChromeUtils.importESModule(
	"resource://gre/modules/LightweightThemeConsumer.sys.mjs"
);

var { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

var { DotWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/DotWindowTracker.sys.mjs"
)

var { nsBrowserAccess } = ChromeUtils.importESModule(
    "resource:///modules/DotBrowserWindow.sys.mjs"
);

var { NativeTitlebar } = ChromeUtils.importESModule(
    "resource:///modules/NativeTitlebar.sys.mjs"
);

// Ensure that these icons match up with the actual page favicon
// Reflect any changes here with components/tabs/BrowserTabs.sys.mjs
const gPageIcons = {
	"about:home": "chrome://dot/skin/home.svg",
	"about:newtab": "chrome://dot/skin/home.svg",
	"about:welcome": "chrome://branding/content/icon32.png",
	"about:privatebrowsing": "chrome://browser/skin/privatebrowsing/favicon.svg"
};

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

/** @global */
var gDotInit = {
	_startTime: Date.now(),

	onBeforeInitialXULLayout() {
		// Add an observer to watch all pref changes.
		Services.prefs.addObserver("", (...args) => console.log(...args));

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

		new LightweightThemeConsumer(document);

		// Check whether we are on Windows 8, if so apply a dark window frame if it is dark enough
		if (AppConstants.platform == "win") {
			if (
				window.matchMedia("(-moz-platform: windows-win8)").matches &&
				window.matchMedia("(-moz-windows-default-theme)").matches
			) {
				var { Windows8WindowFrameColor } = ChromeUtils.importESModule(
					"resource:///modules/Windows8WindowFrameColor.sys.mjs"
				);
				const windowFrameColor = new Color(Windows8WindowFrameColor.get());

				// Default to black for foreground text.
				if (!windowFrameColor.isContrastRatioAcceptable(new Color(0, 0, 0))) {
					document.documentElement.setAttribute("darkwindowframe", "true");
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

		// Exposes gDot to global for debugging
		globalThis.gDot = _gDot;

		// Initialise browser
		gDot.init();

        DotWindowTracker.track(window);

		// Set favicons for special pages on boot to
		// create the illusion of faster load.
		this.callWithURIToLoad((uriToLoad: string) => {
			let url: nsIURI;

			try {
				url = Services.io.newURI(uriToLoad);
			} catch (e) {
				return;
			}

			const nonQuery = url.prePath + url.filePath;
			if (nonQuery in gPageIcons) {
				console.log("gBrowser::setIcon");
			}
		});

		console.timeEnd("onDOMContentLoaded");
	},

	getTabToAdopt() {
		// If we've already checked for a tab to adopt, return it
		if (this._tabToAdopt !== undefined) return this._tabToAdopt;

		// Checking whether the first argument provided to the window is a XULElement type
		if (window.arguments && window.XULElement.isInstance(window.arguments[0])) {
			this._tabToAdopt = window.arguments[0];

			// Remove the tab property from arguments
			window.arguments[0] = null;
		} else {
			// If we don't have a tab to adopt, set this to null
			this._tabToAdopt = null;
		}

		return this._tabToAdopt;
	},

	get uriToLoadPromise() {
		// Delete the existing promise if it exists
		delete this.uriToLoadPromise;

		// Create a new promise for us to use once
		return (this.uriToLoadPromise = (() => {
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

				if (uri instanceof Ci.nsIArray) {
					// Transform the nsIArray of nsISupportsString's into a JS Array of
					// JS strings.
					return Array.from(
						(uri as any).enumerate(Ci.nsISupportsString),
						(supportStr: any) => supportStr.data
					);
				} else if (uri instanceof Ci.nsISupportsString) {
					return uri.data;
				}
                
				return uri;
			} else {
				// Otherwise, we will continue to load the homepage
				// only if Session Restore isn't about to override it.
				const willOverride = globalThis.SessionStartup.willOverrideHomepage;

				// If willOverride is a boolean, we can return the homepage synchronously
				if (typeof willOverride == "boolean") {
					return willOverride ? null : uri;
				}

				// Otherwise, we need to wait for the promise to resolve before returning
				return willOverride.then((willOverrideHomepage: boolean) =>
					willOverrideHomepage ? null : uri
				);
			}
		})());
	},

	// Gets the initial URL to load when booting the browser
	// For the first execution, this will probably be a promise
	// so we need to wait until it resolves before loading the URL.
	callWithURIToLoad(callback: (uriToLoad: string) => void) {
		const uriToLoad = this.uriToLoadPromise;
		if (uriToLoad && uriToLoad.then) {
			uriToLoad.then(callback);
		} else {
			callback(uriToLoad);
		}
	},

	handleURIToLoad() {
		this.callWithURIToLoad((uriToLoad: string | string[]) => {
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
						throw new Error("window.arguments[1] must be null or Ci.nsIPropertyBag2!");
					}

					const extraOptions = window.arguments[1];

					if (extraOptions.hasKey("hasValidUserGestureActivation"))
						hasValidUserGestureActivation = extraOptions.getPropertyAsBool(
							"hasValidUserGestureActivation"
						);

					if (extraOptions.hasKey("fromExternal"))
						fromExternal = extraOptions.getPropertyAsBool("fromExternal");

					if (extraOptions.hasKey("triggeringRemoteType"))
						triggeringRemoteType =
							extraOptions.getPropertyAsACString("triggeringRemoteType");

					if (extraOptions.hasKey("forceAllowDataURI"))
						forceAllowDataURI = extraOptions.getPropertyAsBool("forceAllowDataURI");
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
					})
				} catch (e) {
					console.error(e);
				}
				window.focus();
			} else {
				// Note: loadOneOrMoreURIs *must not* be called if window.arguments.length >= 3.
				// Such callers expect that window.arguments[0] is handled as a single URI.
                loadOneOrMoreURIs(
                    uriToLoad, 
                    Services.scriptSecurityManager.getSystemPrincipal(), 
                    null
                )
			}
		});
	},

	cancelDelayedStartup() {
		window.removeEventListener("MozAfterPaint", this._boundDelayedStartup);
		this._boundDelayedStartup = null;
	},

	doDelayedStartup() {
		// Cancel delayed startup to avoid duplicate calls to this function
		this.cancelDelayedStartup();

		// Initialise the hidden DOM window here, as we need it for macOS.
		// hiddenDOMWindow is used to call certain APIs, especially from the
		// menu bar/context menus when a main browser window is not available.
		Services.appShell.hiddenDOMWindow;

		// Listen for any changes to the permission state
		// This is typically fired when there is user gesture
		// to a permission request such as block/allow/ignore.
		console.log("gBrowser::addEventListener", "PermissionStateChange", true);

		this.handleURIToLoad();

		Services.obs.addObserver(BrowserRemoteControl, "devtools-socket");
		Services.obs.addObserver(BrowserRemoteControl, "marionette-listening");
		Services.obs.addObserver(BrowserRemoteControl, "remote-listening");

		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-disabled");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-started");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-blocked");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-fullscreen-blocked");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-origin-blocked");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-policy-blocked");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-webapi-blocked");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-failed");
		Services.obs.addObserver(globalThis.gXPInstallObserver, "addon-install-confirmation");

		// BrowserOffline.init();
		// CanvasPermissionPromptHelper.init();
		// WebAuthnPromptHelper.init();

		// // Initialize the full zoom setting.
		// // We do this before the session restore service gets initialized so we can
		// // apply full zoom settings to tabs restored by the session restore service.
		// FullZoom.init();
		// PanelUI.init(shouldSuppressPopupNotifications);

		// UpdateUrlbarSearchSplitterState();

		// BookmarkingUI.init();
		// BrowserSearch.delayedStartupInit();
		// SearchUIUtils.init();
		// gProtectionsHandler.init();
		// HomePage.delayedStartup().catch(console.error);

		// let safeMode = document.getElementById("helpSafeMode");
		// if (Services.appinfo.inSafeMode) {
		// 	document.l10n.setAttributes(safeMode, "menu-help-exit-troubleshoot-mode");
		// 	safeMode.setAttribute("appmenu-data-l10n-id", "appmenu-help-exit-troubleshoot-mode");
		// }

		// // BiDi UI
		// gBidiUI = isBidiEnabled();
		// if (gBidiUI) {
		// 	document.getElementById("documentDirection-separator").hidden = false;
		// 	document.getElementById("documentDirection-swap").hidden = false;
		// 	document.getElementById("textfieldDirection-separator").hidden = false;
		// 	document.getElementById("textfieldDirection-swap").hidden = false;
		// }

		// // Setup click-and-hold gestures access to the session history
		// // menus if global click-and-hold isn't turned on
		// if (!Services.prefs.getBoolPref("ui.click_hold_context_menus", false)) {
		// 	SetClickAndHoldHandlers();
		// }

		// function initBackForwardButtonTooltip(tooltipId, l10nId, shortcutId) {
		// 	let shortcut = document.getElementById(shortcutId);
		// 	shortcut = ShortcutUtils.prettifyShortcut(shortcut);

		// 	let tooltip = document.getElementById(tooltipId);
		// 	document.l10n.setAttributes(tooltip, l10nId, { shortcut });
		// }

		// initBackForwardButtonTooltip(
		// 	"back-button-tooltip-description",
		// 	"navbar-tooltip-back-2",
		// 	"goBackKb"
		// );

		// initBackForwardButtonTooltip(
		// 	"forward-button-tooltip-description",
		// 	"navbar-tooltip-forward-2",
		// 	"goForwardKb"
		// );

		// PlacesToolbarHelper.init();

		// ctrlTab.readPref();
		// Services.prefs.addObserver(ctrlTab.prefName, ctrlTab);

		// // The object handling the downloads indicator is initialized here in the
		// // delayed startup function, but the actual indicator element is not loaded
		// // unless there are downloads to be displayed.
		// DownloadsButton.initializeIndicator();

		// if (AppConstants.platform != "macosx") {
		// 	updateEditUIVisibility();
		// 	let placesContext = document.getElementById("placesContext");
		// 	placesContext.addEventListener("popupshowing", updateEditUIVisibility);
		// 	placesContext.addEventListener("popuphiding", updateEditUIVisibility);
		// }

		// FullScreen.init();

		// if (AppConstants.isPlatformAndVersionAtLeast("win", "10")) {
		// 	MenuTouchModeObserver.init();
		// }

		// if (AppConstants.MOZ_DATA_REPORTING) {
		// 	gDataNotificationInfoBar.init();
		// }

		// if (!AppConstants.MOZILLA_OFFICIAL) {
		// 	DevelopmentHelpers.init();
		// }

		// gExtensionsNotifications.init();

		// let wasMinimized = window.windowState == window.STATE_MINIMIZED;
		// window.addEventListener("sizemodechange", () => {
		// 	let isMinimized = window.windowState == window.STATE_MINIMIZED;
		// 	if (wasMinimized != isMinimized) {
		// 		wasMinimized = isMinimized;
		// 		UpdatePopupNotificationsVisibility();
		// 	}
		// });

		// window.addEventListener("mousemove", MousePosTracker);
		// window.addEventListener("dragover", MousePosTracker);

		// gNavToolbox.addEventListener("customizationstarting", CustomizationHandler);
		// gNavToolbox.addEventListener("aftercustomization", CustomizationHandler);

		// SessionStore.promiseInitialized.then(() => {
		// 	// Bail out if the window has been closed in the meantime.
		// 	if (window.closed) {
		// 		return;
		// 	}

		// 	// Enable the Restore Last Session command if needed
		// 	RestoreLastSessionObserver.init();

		// 	SidebarUI.startDelayedLoad();

		// 	PanicButtonNotifier.init();
		// });

		// if (BrowserHandler.kiosk) {
		// 	// We don't modify popup windows for kiosk mode
		// 	if (!gURLBar.readOnly) {
		// 		window.fullScreen = true;
		// 	}
		// }

		// if (Services.policies.status === Services.policies.ACTIVE) {
		// 	if (!Services.policies.isAllowed("hideShowMenuBar")) {
		// 		document.getElementById("toolbar-menubar").removeAttribute("toolbarname");
		// 	}
		// 	let policies = Services.policies.getActivePolicies();
		// 	if ("ManagedBookmarks" in policies) {
		// 		let managedBookmarks = policies.ManagedBookmarks;
		// 		let children = managedBookmarks.filter((child) => !("toplevel_name" in child));
		// 		if (children.length) {
		// 			let managedBookmarksButton = document.createXULElement("toolbarbutton");
		// 			managedBookmarksButton.setAttribute("id", "managed-bookmarks");
		// 			managedBookmarksButton.setAttribute("class", "bookmark-item");
		// 			let toplevel = managedBookmarks.find((element) => "toplevel_name" in element);
		// 			if (toplevel) {
		// 				managedBookmarksButton.setAttribute("label", toplevel.toplevel_name);
		// 			} else {
		// 				managedBookmarksButton.setAttribute("data-l10n-id", "managed-bookmarks");
		// 			}
		// 			managedBookmarksButton.setAttribute("context", "placesContext");
		// 			managedBookmarksButton.setAttribute("container", "true");
		// 			managedBookmarksButton.setAttribute("removable", "false");
		// 			managedBookmarksButton.setAttribute("type", "menu");

		// 			let managedBookmarksPopup = document.createXULElement("menupopup");
		// 			managedBookmarksPopup.setAttribute("id", "managed-bookmarks-popup");
		// 			managedBookmarksPopup.setAttribute(
		// 				"oncommand",
		// 				"PlacesToolbarHelper.openManagedBookmark(event);"
		// 			);
		// 			managedBookmarksPopup.setAttribute(
		// 				"ondragover",
		// 				"event.dataTransfer.effectAllowed='none';"
		// 			);
		// 			managedBookmarksPopup.setAttribute(
		// 				"ondragstart",
		// 				"PlacesToolbarHelper.onDragStartManaged(event);"
		// 			);
		// 			managedBookmarksPopup.setAttribute(
		// 				"onpopupshowing",
		// 				"PlacesToolbarHelper.populateManagedBookmarks(this);"
		// 			);
		// 			managedBookmarksPopup.setAttribute("placespopup", "true");
		// 			managedBookmarksPopup.setAttribute("is", "places-popup");
		// 			managedBookmarksPopup.setAttribute("type", "arrow");
		// 			managedBookmarksButton.appendChild(managedBookmarksPopup);

		// 			gNavToolbox.palette.appendChild(managedBookmarksButton);

		// 			CustomizableUI.ensureWidgetPlacedInWindow("managed-bookmarks", window);

		// 			// Add button if it doesn't exist
		// 			if (!CustomizableUI.getPlacementOfWidget("managed-bookmarks")) {
		// 				CustomizableUI.addWidgetToArea(
		// 					"managed-bookmarks",
		// 					CustomizableUI.AREA_BOOKMARKS,
		// 					0
		// 				);
		// 			}
		// 		}
		// 	}
		// }

		// CaptivePortalWatcher.delayedStartup();

		// SessionStore.promiseAllWindowsRestored.then(() => {
		// 	this._schedulePerWindowIdleTasks();
		// 	document.documentElement.setAttribute("sessionrestored", "true");
		// });

		this.delayedStartupFinished = true;
		globalThis._resolveDelayedStartup();
		Services.obs.notifyObservers(window, "browser-delayed-startup-finished");
	},

	onLoad() {
		console.time("onLoad");

		// Add our own progress listeners
		console.log("gBrowser::addProgressListener", window.XULBrowserWindow);
		console.log("gBrowser::addTabsProgressListener", TabsProgressListener);

		Services.obs.notifyObservers(window, "browser-window-ready");

		// @todo: make the url bar disabled if the toolbar is not visible
		// i.e in a popup window
		if (!window.toolbar.visible) {
		}

		// Ensure we update the remote control visual cue
		BrowserRemoteControl.updateVisualCue();

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

        if (!AppConstants.MOZILLA_OFFICIAL) {
            const devPanel = document.createElement("dev-debug-panel");
            document.body.appendChild(devPanel);
        }

		console.timeEnd("onLoad");

		console.debug(`gDotInit: ready in ${Date.now() - this._startTime}ms`);
	},

	onUnload() {
		console.time("onUnload");

		console.timeEnd("onUnload");
	},

	onWindowClosing(event: CloseEvent) {
		// Determines whether the browser is allowed to close
		return WindowIsClosing(event);
	}
};

// Exported for types
export { gDotInit };

globalThis.gDotInit = gDotInit; // Exposes gDotInit to global for debugging

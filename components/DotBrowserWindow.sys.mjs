/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { XPCOMUtils } = ChromeUtils.importESModule("resource://gre/modules/XPCOMUtils.sys.mjs");

var { AppConstants } = ChromeUtils.importESModule("resource://gre/modules/AppConstants.sys.mjs");

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 */

/**
 * @typedef Lazy
 * @type {object}
 * @property {any} ReferrerInfo
 */

/**
 * @type {Lazy}
 */
const lazy = {
	ReferrerInfo: {}
};

XPCOMUtils.defineLazyGetter(lazy, "ReferrerInfo", () =>
	Components.Constructor("@mozilla.org/referrer-info;1", "nsIReferrerInfo", "init")
);

const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
);

const { DotWindowTracker } = ChromeUtils.importESModule(
	"resource:///modules/DotWindowTracker.sys.mjs"
);

const {
	OPEN_EXTERNAL,
	OPEN_DEFAULTWINDOW,
	OPEN_NO_REFERRER,
	OPEN_NEWWINDOW,
	OPEN_NEWTAB,
	OPEN_PRINT_BROWSER
} = Ci.nsIBrowserDOMWindow;

const { LOAD_FLAGS_NONE, LOAD_FLAGS_FROM_EXTERNAL, LOAD_FLAGS_FIRST_LOAD } = Ci.nsIWebNavigation;

export class nsBrowserAccess {
	QueryInterface = ChromeUtils.generateQI(["nsIBrowserDOMWindow"]);

	/** @type {Window} */
	_win = null;

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this._win = win;
	}

	/**
	 * Opens a URI into a new tab
	 * @param {nsIURI} uri
	 * @param {any} referrerInfo
	 * @param {boolean} isPrivate
	 * @param {boolean} isExternal
	 * @param {boolean} forceNotRemote
	 * @param {number} userContextId
	 * @param {any} openWindowInfo
	 * @param {ChromeBrowser} openerBrowser
	 * @param {any} triggeringPrincipal
	 * @param {string} name
	 * @param {any} csp
	 * @param {boolean} skipLoad
	 * @returns {ChromeBrowser | null}
	 */
	_openURIInNewTab(
		uri,
		referrerInfo,
		isPrivate,
		isExternal,
		forceNotRemote = false,
		userContextId = Ci.nsIScriptSecurityManager.DEFAULT_USER_CONTEXT_ID,
		openWindowInfo = null,
		openerBrowser = null,
		triggeringPrincipal = null,
		name = "",
		csp = null,
		skipLoad = false
	) {
		console.log("_openURIInNewTab", uri, openWindowInfo, openerBrowser);

		let win;
		let needToFocusWin;

		// If the current window isn't a popup window, reuse that
		if (this._win.toolbar.visible) {
			win = this._win;
		} else {
			// Otherwise, find us a new window
			win = DotWindowTracker.getTopWindow({ private: isPrivate });
			needToFocusWin = true;
		}

		if (!win) return null;

		// If we're loading something external, and we don't have a URI or it's blank
		// Get the current webContents instead
		if (isExternal && (!uri || uri.spec == "about:blank")) {
			win.focus();

			if (win.gDot.tabs._isWebContentsBrowserElement(win.gDot.tabs.selectedTab.webContents)) {
				return /** @type {ChromeBrowser} */ (win.gDot.tabs.selectedTab.webContents);
			} else {
				return null;
			}
		}

		const loadInBackground = Services.prefs.getBoolPref(
			"browser.tabs.loadDivertedInBackground"
		);

		const tab = win.gDot.tabs.createTab({
			uri: uri ? uri.spec : "about:blank",
			triggeringPrincipal,
			referrerInfo,
			userContextId,
			fromExternal: isExternal,
			inBackground: loadInBackground,
			forceNotRemote,
			openWindowInfo,
			openerBrowser,
			csp,
			skipLoad
		});

		if (needToFocusWin || (!loadInBackground && isExternal)) {
			win.focus();
		}

		return /** @type {ChromeBrowser} */ (tab.webContents);
	}

	/**
	 * @param {nsIURI} uri
	 * @param {any} openWindowInfo
	 * @param {number} where
	 * @param {number} flags
	 * @param {any} triggeringPrincipal
	 * @param {any} csp
	 */
	createContentWindow(uri, openWindowInfo, where, flags, triggeringPrincipal, csp) {
		console.log(
			"createContentWindow",
			uri,
			openWindowInfo,
			where,
			flags,
			triggeringPrincipal,
			csp
		);

		return this.getContentWindowOrOpenURI(
			null,
			openWindowInfo,
			where,
			flags,
			triggeringPrincipal,
			csp,
			true
		);
	}

	/**
	 * @param {nsIURI} uri
	 * @param {any} openWindowInfo
	 * @param {number} where
	 * @param {number} flags
	 * @param {any} triggeringPrincipal
	 * @param {any} csp
	 */
	openURI(uri, openWindowInfo, where, flags, triggeringPrincipal, csp) {
		if (!uri) {
			console.error("Cannot pass invalid URI to nsBrowserAccess::openURI.");

			throw Components.Exception("", Cr.NS_ERROR_FAILURE);
		}

		return this.getContentWindowOrOpenURI(
			uri,
			openWindowInfo,
			where,
			flags,
			triggeringPrincipal,
			csp,
			false
		);
	}

	/**
	 * Load a URI into a new or existing browser
	 * @param {nsIURI} uri
	 * @param {any} openWindowInfo
	 * @param {number} where
	 * @param {number} flags
	 * @param {any} triggeringPrincipal
	 * @param {any} csp
	 * @param {boolean} skipLoad
	 */
	getContentWindowOrOpenURI(
		uri,
		openWindowInfo,
		where,
		flags,
		triggeringPrincipal,
		csp,
		skipLoad
	) {
		let browsingContext = null;
		const isExternal = !!(flags & OPEN_EXTERNAL);

		// If our load context is external and we have
		// passed openWindowInfo, raise an exception
		if (openWindowInfo && isExternal) {
			console.error(
				"Cannot pass 'openWindowInfo' to nsBrowserAccess::openURI if context is OPEN_EXTERNAL."
			);

			throw Components.Exception("", Cr.NS_ERROR_FAILURE);
		}

		if (isExternal && uri && uri.schemeIs("chrome")) {
			dump("*** Preventing external load of chrome: URI into browser window\n");
			dump("    Use --chrome <uri> instead\n");

			return null;
		}

		if (where & OPEN_DEFAULTWINDOW) {
			// If we're loading an external URI, check if we want
			// to override the behaviour of where to open external URIs
			if (
				isExternal &&
				Services.prefs.prefHasUserValue("browser.link.open_newwindow.override.external")
			) {
				where = Services.prefs.getIntPref("browser.link.open_newwindow.override.external");
			} else {
				where = Services.prefs.getIntPref("browser.link.open_newwindow");
			}
		}

		let referrerInfo;

		// If we open with no referrer, set up an empty referrer
		if (flags & OPEN_NO_REFERRER) {
			referrerInfo = new lazy.ReferrerInfo(
				Ci.nsIReferrerInfo.EMPTY,
				false /* sendReferrer */,
				null /* originalReferrer */
			);
		} else if (openWindowInfo && openWindowInfo.parent && openWindowInfo.parent.window) {
			// Otherwise, inherit the referrer policy from the openWindow
			referrerInfo = new lazy.ReferrerInfo(
				openWindowInfo.parent.window.document.referrerInfo.referrerPolicy,
				true /* sendReferrer */,
				Services.io.newURI(
					openWindowInfo.parent.window.location.href
				) /* originalReferrer */
			);
		} else {
			referrerInfo = new lazy.ReferrerInfo(
				Ci.nsIReferrerInfo.EMPTY,
				true /* sendReferrer */,
				null /* originalReferrer */
			);
		}

		let isPrivate = openWindowInfo
			? openWindowInfo.originAttributes.privateBrowsingId != 0
			: PrivateBrowsingUtils.isWindowPrivate(window);

		if (where != OPEN_NEWWINDOW || where != OPEN_NEWTAB || where != OPEN_PRINT_BROWSER) {
			// If the selectedTab's webContents isn't a browser element,
			// fallback to opening the URL in a new tab rather than the
			// current one.
			if (
				!this._win.gDot.tabs._isWebContentsBrowserElement(
					this._win.gDot.tabs.selectedTab.webContents
				)
			) {
				where = OPEN_NEWTAB;
			}
		}

		switch (where) {
			case OPEN_NEWWINDOW:
				const urlSpec = uri && uri.spec;
				const features = ["all", "dialog=no"];

				if (isPrivate) {
					features.push("private");
				}

				try {
					const extraOptions = Cc["@mozilla.org/hash-property-bag;1"].createInstance(
						Ci.nsIWritablePropertyBag2
					);

					extraOptions.setPropertyAsBool("fromExternal", isExternal);

					this._win.openDialog(
						AppConstants.BROWSER_CHROME_URL,
						"_blank",
						features.join(","),
						// window.arguments
						urlSpec,
						extraOptions,
						null,
						null,
						null,
						null,
						null,
						null,
						triggeringPrincipal,
						null,
						csp,
						openWindowInfo
					);
				} catch (e) {
					console.error(e);
				}

				browsingContext = null;

				break;
			case OPEN_NEWTAB:
				// If the openWindow isn't remote, we shouldn't open this tab as remote.
				const forceNotRemote = openWindowInfo && !openWindowInfo.isRemote;

				// If possible, inherit the userContextId from the openWindow.
				const userContextId = openWindowInfo
					? openWindowInfo.originAttributes.userContextId
					: Ci.nsIScriptSecurityManager.DEFAULT_USER_CONTEXT_ID;

				const browser = this._openURIInNewTab(
					uri,
					referrerInfo,
					isPrivate,
					isExternal,
					forceNotRemote,
					userContextId,
					openWindowInfo,
					openWindowInfo?.parent?.top.embedderElement,
					triggeringPrincipal,
					"",
					csp,
					skipLoad
				);

				if (browser) {
					browsingContext = browser.browsingContext;
				}
			case OPEN_PRINT_BROWSER:
				console.log("todo: handle OPEN_PRINT_BROWSER openURI requests");
				break;
			default:
				// We can assume that the current tab has a browser element type webContents
				browsingContext = /** @type {ChromeBrowser} */ (
					this._win.gDot.tabs.selectedTab.webContents
				).browsingContext;

				if (uri) {
					let loadFlags = LOAD_FLAGS_NONE;

					if (isExternal) {
						loadFlags |= LOAD_FLAGS_FROM_EXTERNAL;
					} else if (!triggeringPrincipal.isSystemPrincipal) {
						loadFlags |= LOAD_FLAGS_FIRST_LOAD;
					}

					// This should ideally be able to call loadURI with the actual URI.
					// However, that would bypass some styles of fixup (notably Windows
					// paths passed as "URI"s), so this needs some further thought. It
					// should be addressed in bug 1815509.
					/** @type {ChromeBrowser} */ (
						this._win.gDot.tabs.selectedTab.webContents
					).fixupAndLoadURIString(uri.spec, {
						triggeringPrincipal,
						csp,
						loadFlags,
						referrerInfo
					});
				}

				if (!Services.prefs.getBoolPref("browser.tabs.loadDivertedInBackground")) {
					this._win.focus();
				}
		}
	}

	/**
	 * @param {nsIURI} uri
	 * @param {Partial<LoadURIOptions>} params
	 * @param {number} where
	 * @param {number} flags
	 * @param {string} name
	 */
	createContentWindowInFrame(uri, params, where, flags, name) {
		console.log("createContentWindowInFrame", uri, params, where, flags, name);

		return this.getContentWindowOrOpenURIInFrame(null, params, where, flags, name, true);
	}

	/**
	 * @param {nsIURI} uri
	 * @param {Partial<LoadURIOptions>} params
	 * @param {number} where
	 * @param {number} flags
	 * @param {string} name
	 */
	openURIInFrame(uri, params, where, flags, name) {
		console.log("OpenURIInFrame", uri, params, where, flags, name);

		return this.getContentWindowOrOpenURIInFrame(uri, params, where, flags, name, false);
	}

	/**
	 * Load a URI into a new or existing browser in frame
	 * @param {nsIURI} uri
	 * @param {Partial<LoadURIOptions>} params
	 * @param {number} where
	 * @param {number} flags
	 * @param {string} name
	 * @param {boolean} skipLoad
	 */
	getContentWindowOrOpenURIInFrame(uri, params, where, flags, name, skipLoad) {
		if (where == OPEN_PRINT_BROWSER) {
			console.log("todo: handle OPEN_PRINT_BROWSER openURI requests");
			return null;
		}

		if (where != OPEN_NEWTAB) {
			dump("openURIInFrame can only open in new tabs or print");
			return null;
		}

		const isExternal = !!(flags & OPEN_EXTERNAL);

		const userContextId =
			params.openerOriginAttributes && "userContextId" in params.openerOriginAttributes
				? params.openerOriginAttributes.userContextId
				: Ci.nsIScriptSecurityManager.DEFAULT_USER_CONTEXT_ID;

		return this._openURIInNewTab(
			uri,
			params.referrerInfo,
			params.isPrivate,
			isExternal,
			false,
			userContextId,
			params.openWindowInfo,
			params.openerBrowser,
			params.triggeringPrincipal,
			name,
			params.csp,
			skipLoad
		);
	}
}

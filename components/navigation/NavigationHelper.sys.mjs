/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";
import { XPCOMUtils } from "resource://gre/modules/XPCOMUtils.sys.mjs";

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

const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
);

const { DotWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/DotWindowTracker.sys.mjs"
);

XPCOMUtils.defineLazyGetter(lazy, "ReferrerInfo", () =>
    Components.Constructor(
        "@mozilla.org/referrer-info;1",
        "nsIReferrerInfo",
        "init"
    )
);

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 * @typedef {import("third_party/dothq/gecko-types/lib/nsIWebNavigation").LoadURIOptions} LoadURIOptions
 */

const {
    LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP,
    LOAD_FLAGS_FIXUP_SCHEME_TYPOS,
    LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL,
    LOAD_FLAGS_ALLOW_POPUPS,
    LOAD_FLAGS_ERROR_LOAD_CHANGES_RV,
    LOAD_FLAGS_FORCE_ALLOW_DATA_URI,
    LOAD_FLAGS_FROM_EXTERNAL,
    LOAD_FLAGS_NONE
} = Ci.nsIWebNavigation;

/**
 * Handles any file: URIs that have special functionality
 * Such as XPI addon files that need to be installed
 *
 * @param {ChromeBrowser} browser
 * @param {nsIURI} uri
 */
function handleFileURI(browser, uri) {
    if (uri.scheme == "file") {
        try {
            const mimeType = Cc["@mozilla.org/mime;1"]
                .getService(Ci.nsIMIMEService)
                .getTypeFromURI(uri);

            if (mimeType == "application/x-xpinstall") {
                var { AddonManager } = ChromeUtils.importESModule(
                    "resource://gre/modules/AddonManager.sys.mjs"
                );

                const systemPrincipal = Services.scriptSecurityManager.getSystemPrincipal();

                AddonManager.getInstallForURL(uri.spec, {}).then((install) => {
                    AddonManager.installAddonFromWebpage(
                        mimeType,
                        browser,
                        systemPrincipal,
                        install
                    );
                });

                return true;
            }
        } catch (e) {
            return false;
        }
    }

    return false;
}

/**
 * Ensures that the principal is using the correct origin attributes
 * @param {Window} win
 * @param {any} principal
 * @param {Partial<LoadURIOptions>} params 
 * @returns {any}
 */
function useOAForPrincipal(win, principal, params) {
    // If we're using a content principal, we'll need to change the origin attributes
    if (principal && principal.isContentPrincipal) {
        return Services.scriptSecurityManager.principalWithOA(principal, {
            userContextId: params.userContextId,
            privateBrowsingId: (
                params.private ||
                (win && PrivateBrowsingUtils.isWindowPrivate(win))
            ),
            firstPartyDomain: principal.originAttributes.firstPartyDomain,
        });
    }

    // Otherwise, just return our original principal
    return principal;
}

/**
 * Opens a URL in a new browser window
 * @param {string} url 
 * @param {Partial<LoadURIOptions>} params 
 * @param {ChromeWindow} opener 
 */
function openInWindow(url, params, opener) {
    params = Object.assign({}, params);

    let features = ["chrome", "dialog=no", "all"];

    if (params.private) {
        features.push("private");

        // Strip the referrer when we're opening in a private window
        // We don't want to leak the referrer when loading into the private window
        // See bug 1409226
        params.referrerInfo = new lazy.ReferrerInfo(
            params.referrerInfo.referrerPolicy,
            false,
            params.referrerInfo.originalReferrer
        );
    } else if (params.forceNonPrivate) {
        features.push("non-private");
    }

    let args = Cc["@mozilla.org/array;1"].createInstance(
        Ci.nsIMutableArray
    );

    let uriArg = Cc["@mozilla.org/supports-string;1"].createInstance(
        Ci.nsISupportsString
    );
    uriArg.data = url;

    let extraOptions = Cc["@mozilla.org/hash-property-bag;1"].createInstance(
        Ci.nsIWritablePropertyBag2
    );

    if (params.triggeringRemoteType) {
        extraOptions.setPropertyAsACString(
            "triggeringRemoteType",
            params.triggeringRemoteType
        );
    }

    if (params.hasValidUserGestureActivation !== undefined) {
        extraOptions.setPropertyAsBool(
            "hasValidUserGestureActivation",
            params.hasValidUserGestureActivation
        );
    }

    if (params.forceAllowDataURI) {
        extraOptions.setPropertyAsBool("forceAllowDataURI", true);
    }

    if (params.fromExternal !== undefined) {
        extraOptions.setPropertyAsBool("fromExternal", params.fromExternal);
    }

    let allowThirdPartyFixupSupports = Cc[
        "@mozilla.org/supports-PRBool;1"
    ].createInstance(Ci.nsISupportsPRBool);

    allowThirdPartyFixupSupports.data = params.allowThirdPartyFixup;

    let userContextIdSupports = Cc[
        "@mozilla.org/supports-PRUint32;1"
    ].createInstance(Ci.nsISupportsPRUint32);

    userContextIdSupports.data = params.userContextId;

    // Append all our arguments into the window args bag
    args.appendElement(uriArg);
    args.appendElement(extraOptions);
    args.appendElement(params.referrerInfo);
    args.appendElement(params.postData);
    args.appendElement(allowThirdPartyFixupSupports);
    args.appendElement(userContextIdSupports);
    args.appendElement(params.originPrincipal);
    args.appendElement(params.originStoragePrincipal);
    args.appendElement(params.triggeringPrincipal);
    args.appendElement(null); // allowInheritPrincipal
    args.appendElement(params.csp);

    Services.ww.openWindow(
        opener,
        AppConstants.BROWSER_CHROME_URL,
        null,
        features.join(","),
        args
    );
}

/**
 * @typedef NavigationHelper
 * @property {function} openLinkIn
 */
export const NavigationHelper = {
    /**
     * Find a browser window that meets the filter
     * 
     * If the `win` passed already meets the requirements 
     * for a browser window, it will be returned, otherwise
     * a new window will be located using the `filter`.
     * @param {Window} win 
     * @param {object} filter
     * @param {boolean} [filter.forceNonPopups] - Force a non-popup window
     * @param {boolean} [filter.forceNonPrivate] - Force a non-private (normal) browser window
     * @returns {ChromeWindow | Window | null}
     */
    getTargetWindow(win, { forceNonPopups, forceNonPrivate } = {}) {
        const { top } = win;
        const topDoc = top.document;

        // Check if the top window meets our requirements and return early
        if (
            topDoc.documentElement.getAttribute("windowtype") == "navigator:browser" && // Check if it is a navigator:browser window
            (!forceNonPopups || !topDoc.documentElement.hasAttribute("chromepopup")) && // Check if it's a non-popup window
            (!forceNonPrivate || !PrivateBrowsingUtils.isWindowPrivate(top)) // Check if it's a non-private window
        ) {
            return top;
        }

        return DotWindowTracker.getTopWindow({
            allowPopups: !forceNonPopups,
            private: !forceNonPrivate && PrivateBrowsingUtils.isWindowPrivate(win)
        });
    },

    /**
     * Helper function for opening a link in a specific context.
     * @param {Window} win
     * @param {string} url
     * @param {"current" | "tab" | "tabshifted" | "window" | "save"} where
     *    `current`: open in current tab
     *
     *    `tab`: open in a new tab
     *
     *    `tabshifted`: same as "tab" but in background if default is to select new tabs, and vice versa
     *
     *    `window`: open in new window
     *
     *    `save`: save to disk (with no filename hint!)
     * @param {Partial<LoadURIOptions>} params
     */
    openLinkIn(win, url, where, params) {
        if (!url || !where) {
            return;
        }

        // Create a shallow copy of params so we don't invoke 
        // anything top-level when moving the params around.
        params = Object.assign({}, params)

        // Initialise a ReferrerInfo if we haven't passed one
        if (!params.referrerInfo) {
            params.referrerInfo = new lazy.ReferrerInfo(
                Ci.nsIReferrerInfo.EMPTY,
                true,
                null
            )
        }

        if (!params.triggeringPrincipal) {
            throw new Error("Required 'triggeringPrincipal' in openLinkIn params.");
        }

        // If we're trying to save the link, pass everything over to saveLink
        if (where == "save") {
            this.saveLink(win, url, params);
            return;
        }

        // Determine where we want to load the link
        let openerWindow;
        if (where == "current" && params.targetBrowser) {
            openerWindow = /** @type {ChromeBrowser} */ (params.targetBrowser).ownerGlobal;
        } else {
            openerWindow = this.getTargetWindow(win, { forceNonPrivate: params.forceNonPrivate });
        }

        // If we're opening the link in a tab setting, ensure that the openerWindow isn't a popup window
        // If the window is a popup window, redo the search for a window with popups skipped
        if (where.startsWith("tab") && openerWindow && openerWindow.document.documentElement.hasAttribute("chromepopup")) {
            openerWindow = this.getTargetWindow(win, {
                forceNonPopups: true,
                forceNonPrivate: params.forceNonPrivate,
            });
        }

        // Ensure that the correct origin attributes are applied to each load principal
        params.originPrincipal = useOAForPrincipal(openerWindow, params.originPrincipal, params);
        params.originStoragePrincipal = useOAForPrincipal(
            openerWindow,
            params.originStoragePrincipal,
            params
        );
        params.triggeringPrincipal = useOAForPrincipal(openerWindow, params.triggeringPrincipal, params);

        // If we couldn't find a openerWindow, or we're explicitly loading the link into a new window
        // Return early and just open a new window.
        if (!openerWindow || where == "window") {
            // openerWindow should have a ChromeWindow type rather than Window
            openInWindow(url, params, /** @type {any} */(openerWindow) || win);
            return;
        }

        // Ensure the openerWindow is focused
        openerWindow.focus();

        /** @type {ChromeBrowser} */ let openerBrowser;
        /** @type {boolean} */ let loadInBackground;
        /** @type {nsIURI} */ let uriObj;

        // Load the URL into the selected tab
        if (where == "current") {
            openerBrowser = params.targetBrowser || openerWindow.gDot.tabs.selectedTab.webContents;
            loadInBackground = false; // Since we're loading into the current tab, it'll be opening in the foreground

            try {
                uriObj = Services.io.newURI(url);
            } catch (e) { }

            const tab = openerWindow.gDot.tabs.getTabForWebContents(openerBrowser);

            // We can't load into a non-browser webContents
            // Instead we can just load into a new tab
            if (!openerWindow.gDot.tabs._isWebContentsBrowserElement(tab)) {
                where = "tab";
                openerBrowser = null;
            } else if (
                // @todo: what does this even do??
                !params.allowPinnedTabHostChange &&
                tab.pinned &&
                url != "about:crashcontent"
            ) {
                try {
                    // nsIURI.host can throw for non-nsStandardURL nsIURIs.
                    if (
                        !uriObj ||
                        (!uriObj.schemeIs("javascript") &&
                            openerBrowser.currentURI.host != uriObj.host)
                    ) {
                        where = "tab";
                        openerBrowser = null;
                    }
                } catch (err) {
                    where = "tab";
                    openerBrowser = null;
                }
            }
        } else {
            // `where` is going to be either `tab` or `tabshifted``
            loadInBackground = params.inBackground;

            // If we didn't pass the inBackground param
            // Check if we passed the forceForeground param
            // Otherwise, check if our browser configuration permits loading in the background
            if (loadInBackground == null) {
                loadInBackground = params.forceForeground
                    ? false
                    : Services.prefs.getBoolPref("browser.tabs.loadInBackground");
            }
        }

        switch (where) {
            case "current":
                let flags = LOAD_FLAGS_NONE;

                if (params.allowThirdPartyFixup) {
                    flags |= LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP;
                    flags |= LOAD_FLAGS_FIXUP_SCHEME_TYPOS;
                }

                // LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL isn't supported for javascript URIs,
                // i.e. it causes them not to load at all. Callers should strip
                // "javascript:" from pasted strings to prevent blank tabs
                if (!params.allowInheritPrincipal) {
                    flags |= LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL;
                }

                if (params.allowPopups) {
                    flags |= LOAD_FLAGS_ALLOW_POPUPS;
                }

                if (params.indicateErrorPageLoad) {
                    flags |= LOAD_FLAGS_ERROR_LOAD_CHANGES_RV;
                }

                if (params.forceAllowDataURI) {
                    flags |= LOAD_FLAGS_FORCE_ALLOW_DATA_URI;
                }

                if (params.fromExternal) {
                    flags |= LOAD_FLAGS_FROM_EXTERNAL;
                }

                const { URI_INHERITS_SECURITY_CONTEXT } = Ci.nsIProtocolHandler;

                // If we forced an about:blank viewer, ensure that the principals won't be inherited
                if (
                    params.forceAboutBlankViewerInCurrent &&
                    (
                        !uriObj ||
                        Services.io.getDynamicProtocolFlags(uriObj) & URI_INHERITS_SECURITY_CONTEXT
                    )
                ) {
                    // If we know we won't be inheriting principals, 
                    // we can apply the principals to an about:blank viewer
                    openerBrowser.createAboutBlankContentViewer(
                        params.originPrincipal,
                        params.originStoragePrincipal
                    );
                }

                // Load the URI into the browser
                openerBrowser.fixupAndLoadURIString(url, {
                    ...params,
                    flags,
                });

                break;
            case "tabshifted":
                // Fall-through to tab
                loadInBackground = !loadInBackground;
            case "tab":
                const tab = openerWindow.gDot.tabs.createTab({
                    ...params,
                    uri: url,
                    triggeringPrincipal: params.triggeringPrincipal,
                    inBackground: loadInBackground,
                });

                openerBrowser = /** @type {ChromeBrowser} */ (tab.webContents);
                break;
        }

        // Focus the browser if it's the current webContents
        if (
            !params.avoidBrowserFocus &&
            openerBrowser == openerWindow.gDot.tabs.selectedTab.webContents
        ) {
            openerBrowser.focus();
        }

        console.log("openLinkIn", url, where, params, loadInBackground);

    },

    /**
     * Opens trusted link in a target
     * 
     * Identical to openLinkIn, but uses a **system** principal
     * @param {Window} win 
     * @param {string} url 
     * @param {"current" | "tab" | "tabshifted" | "window" | "save"} where 
     * @param {Partial<LoadURIOptions>} params 
     */
    openTrustedLinkIn(win, url, where, params = {}) {
        if (!params.triggeringPrincipal) {
            params.triggeringPrincipal = Services.scriptSecurityManager.getSystemPrincipal();
        }

        params.forceForeground ??= true;

        this.openLinkIn(win, url, where, params);
    },

    /**
     * Opens web link in a target
     * 
     * Identical to openLinkIn, but uses a null principal
     * @param {Window} win 
     * @param {string} url 
     * @param {"current" | "tab" | "tabshifted" | "window" | "save"} where 
     * @param {Partial<LoadURIOptions>} params 
     */
    openWebLinkIn(win, url, where, params = {}) {
        if (!params.triggeringPrincipal) {
            params.triggeringPrincipal =
                Services.scriptSecurityManager.createNullPrincipal({});
        }

        if (params.triggeringPrincipal.isSystemPrincipal) {
            throw new Error(
                "System principal should never be passed to openWebLinkIn()!"
            );
        }

        params.forceForeground ??= true;

        this.openLinkIn(win, url, where, params);
    },

    /**
     * Helper function to handle opening multiple URIs at once
     * @param {Window} win
     * @param {*} uriString
     * @param {*} triggeringPrincipal
     * @param {*} csp
     */
    loadOneOrMoreURIs(win, uriString, triggeringPrincipal, csp) {
        // Check if the window is the browser window
        if (win.location.href != AppConstants.BROWSER_CHROME_URL) {
            // If not, just open a new browser window with the URIs passed along as arguments.
            win.openDialog(AppConstants.BROWSER_CHROME_URL, "_blank", "all,dialog=no", uriString);
            return;
        }

        // We could encounter malformed URIs here and we don't want to
        // interrupt start-up, so we just wrap it in a try catch.
        try {
            win.gDot.tabs.createTabs(uriString.split("|"), {
                inBackground: false,
                replace: true,
                triggeringPrincipal,
                csp
            });
        } catch (e) { }
    },

    /**
     * Loads a URI into a browser
     * @param {ChromeBrowser} browser
     * @param {import("third_party/dothq/gecko-types/lib").nsIURI} uri
     * @param {Partial<LoadURIOptions>} loadURIOptions
     */
    loadURI(browser, uri, loadURIOptions = {}) {
        if (!loadURIOptions.triggeringPrincipal) {
            throw new Error("Required 'triggeringPrincipal' in loadURI options.");
        }

        if (
            loadURIOptions.userContextId &&
            loadURIOptions.userContextId != browser.getAttribute("usercontextid")
        ) {
            throw new Error("Mismatched 'userContextId' in loadURI from options to browser.");
        }

        loadURIOptions.loadFlags |= loadURIOptions.flags | LOAD_FLAGS_NONE;
        delete loadURIOptions.flags;

        loadURIOptions.hasValidUserGestureActivation ??=
            browser.ownerDocument.hasValidTransientUserGestureActivation;

        // If a URI hasn't been passed, or it happens to be null,
        // simply load about:blank instead.
        if (!uri) {
            uri = Services.io.newURI("about:blank");
        }

        // If we've handled the file URI for XPI install cases, return early
        // as we don't need to actually load the URI into the browser.
        if (handleFileURI(browser, uri)) {
            return;
        }

        browser.isNavigating = true;

        try {
            browser.webNavigation.loadURI(uri, loadURIOptions);
        } finally {
            browser.isNavigating = false;
        }
    },

    /**
     * Converts load flags to URI fixup flags
     * @param {ChromeBrowser} browser
     * @param {number} loadFlags
     * @returns
     */
    _loadFlagsToFixupFlags(browser, loadFlags) {
        let fixupFlags = Ci.nsIURIFixup.FIXUP_FLAG_NONE;
        if (loadFlags & LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP) {
            fixupFlags |= Ci.nsIURIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP;
        }
        if (loadFlags & LOAD_FLAGS_FIXUP_SCHEME_TYPOS) {
            fixupFlags |= Ci.nsIURIFixup.FIXUP_FLAG_FIX_SCHEME_TYPOS;
        }
        if (PrivateBrowsingUtils.isBrowserPrivate(browser)) {
            fixupFlags |= Ci.nsIURIFixup.FIXUP_FLAG_PRIVATE_CONTEXT;
        }
        return fixupFlags;
    },

    /**
     * Fixes up the URI string and loads it into a browser
     * @param {ChromeBrowser} browser
     * @param {string} uriString
     * @param {Partial<LoadURIOptions>} loadURIOptions
     */
    fixupAndLoadURIString(browser, uriString, loadURIOptions) {
        const fixupFlags = this._loadFlagsToFixupFlags(browser, loadURIOptions.loadFlags);

        let fixupInfo;

        try {
            fixupInfo = Services.uriFixup.getFixupURIInfo(uriString, fixupFlags);
        } catch (e) {
            return null;
        }

        return this.loadURI(browser, fixupInfo.preferredURI, loadURIOptions);
    }
};

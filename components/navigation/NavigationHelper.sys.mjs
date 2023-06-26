/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";

const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
);

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 * @typedef {import("third_party/dothq/gecko-types/lib/nsIWebNavigation").LoadURIOptions} LoadURIOptions
 */

const { LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP, LOAD_FLAGS_FIXUP_SCHEME_TYPOS, LOAD_FLAGS_NONE } =
    Ci.nsIWebNavigation;

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
 * @typedef NavigationHelper
 * @property {function} openLinkIn
 */
export const NavigationHelper = {
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
        /* @todo: add logic for openLinkIn */
        console.log("todo: openLinkIn", win, url, where, params);
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

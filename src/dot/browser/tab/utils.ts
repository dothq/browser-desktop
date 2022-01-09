/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { kHomeFilledIcon } from "icons";
import dot from "index";
import L10n from "l10n";
import { Cc, Ci, PrivateBrowsingUtils, Services } from "mozilla";
import { MozURI } from "types/uri";
import Tab from ".";

export const TabUtils = new class {
    public initialPages = [
        "about:blank",
        "about:newtab",
        "about:home",
        "about:privatebrowsing",
        "about:welcomeback",
        "about:sessionrestore",
        "about:welcome",
    ]

    public faviconDefaults: any = {
        "about:newtab": kHomeFilledIcon,
        "about:home": kHomeFilledIcon,
        "about:welcome": kHomeFilledIcon,
        "about:privatebrowsing": kHomeFilledIcon,
    }

    public get emptyTabTitle() {
        const isPrivate = dot.window.isPrivate();

        // Normal browsing: default-tab-title
        // Private browsing: default-private-tab-title
        return L10n.ts(`default-${isPrivate ? "private-" : ""}tab-title`);
    }

    /*
     * Get the linked tab from a browser element
    */
    public getTabFromBrowser(browser: HTMLBrowserElement) {
        return dot.tabs.get(browser.browserId);
    }

    public handleUriInChrome(browser: HTMLBrowserElement, uri: MozURI) {
        if (uri.scheme == "file") {
            try {
                const mimeType = Cc["@mozilla.org/mime;1"]
                    .getService(Ci.nsIMIMEService)
                    .getTypeFromURI(uri);

                if (mimeType == "application/x-xpinstall") {
                    console.log("todo: add XPI installation handling")

                    return true;
                }
            } catch (e) {
                return false;
            }
        }
      
        return false;
    }

    public droppedLinkHandler(event: any, urls: any) {
        console.log("todo: dropped links", event, urls);
    }

    /**
     * Handles loading URLs on the browser
     * @param browser Browser element
     * @param uri Valid MozURI
     * @param params Params to make the request
     */
    public loadURIHandler(browser: HTMLBrowserElement, uri?: MozURI, params?: any) {
        if (!uri) uri = "about:blank" as any;
        
        const { 
            triggeringPrincipal, 
            referrerInfo, 
            postData, 
            csp 
        } = params || {};

        const loadFlags = (
            params.loadFlags ||
            params.flags || 
            Ci.nsIWebNavigation.LOAD_FLAGS_NONE
        );

        const hasValidUserGestureActivation =
            document.hasValidTransientUserGestureActivation;

        if (!triggeringPrincipal) {
            throw new Error("Must load a URL with a triggeringPrincipal.");
        }
        
        try {
            const {
                FIXUP_FLAG_NONE,
                LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP,
                FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP,
                FIXUP_FLAG_FIX_SCHEME_TYPOS,
                LOAD_FLAGS_FIXUP_SCHEME_TYPOS,
                FIXUP_FLAG_PRIVATE_CONTEXT
            } = Ci.nsIURIFixup

            let fixupFlags = FIXUP_FLAG_NONE;

            if (loadFlags & LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP) {
                fixupFlags |= FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP;
            }

            if (loadFlags & LOAD_FLAGS_FIXUP_SCHEME_TYPOS) {
                fixupFlags |= FIXUP_FLAG_FIX_SCHEME_TYPOS;
            }

            if (PrivateBrowsingUtils.isBrowserPrivate(browser)) {
                fixupFlags |= FIXUP_FLAG_PRIVATE_CONTEXT;
            }
        
            const fixedUri = Services.uriFixup.getFixupURIInfo(uri, fixupFlags)
                .preferredURI;

            if (fixedUri && this.handleUriInChrome(browser, fixedUri)) return;
        } catch (e) {}
        
        browser.isNavigating = true;

        try {
            browser.webNavigation.loadURI(
                uri, 
                {
                    triggeringPrincipal,
                    csp,
                    loadFlags,
                    referrerInfo,
                    postData,
                    hasValidUserGestureActivation,
                }
            );
        } finally {
            browser.isNavigating = false;
        }
    }

    public setTabTitle(tab: Tab, shouldUpdate?: boolean) {
        const browser = tab.linkedBrowser;

        if(!browser) return;

        // @todo: add check to return if tab is pending
        if (
            !tab ||
            /*|| t.pending*/
            (
                !browser.contentTitle &&
                browser.contentPrincipal.isSystemPrincipal
            )
        ) return;

        let title = browser.contentTitle;
        const isContentTitle = !!title;

        // Check if we can use the page URL as the page title
        if (browser.currentURI.displaySpec) {
            try {
                title = Services.io.createExposableURI(browser.currentURI)
                    .displaySpec;
            } catch (e) {
                title = browser.currentURI.displaySpec;
            }
        }

        if (title && !dot.utilities.isBlankPageURL(title)) {
            // Shorten the title is if it is a data: URI
            if (title.length > 500 && title.match(/^data:[^,]+;base64,/)) {
                title = `${title.substring(0, 500)}\u2026`;
            } else {
                try {
                    const { characterSet } = browser;

                    title = Services.textToSubURI.unEscapeNonAsciiURI(
                        characterSet,
                        title
                    );
                } catch (e) {}
            }
        } else {
            // Fallback to the default tab title
            title = this.emptyTabTitle;
        }

        if (!isContentTitle) {
            // Remove protocol and www subdomain
            title = title.replace(/^[^:]+:\/\/(?:www\.)?/, "");
        }

        if(shouldUpdate) tab.title = title;
        return title;
    }

    /*
     * Handler for onpagetitlechange event
    */
    public onPageTitleChange(event: Event) {
        const browser = event.target as HTMLBrowserElement;
        const tab = this.getTabFromBrowser(browser);

        return this.setTabTitle(tab, false);
    }
}

import { MouseEvent } from "react";
import { dot } from "../api";
import {
    AppConstants,
    BrowserWindowTracker,
    Cc,
    Ci,
    PrivateBrowsingUtils,
    ReferrerInfo,
    Services
} from "../modules";
import { exportPublic } from "../shared/globals";
import { NEW_TAB_URL } from "../shared/tab";
import { MozURI } from "../types/uri";

export const BrowserUtils = {
    mimeTypeIsTextBased(mimeType: string) {
        return (
            mimeType.startsWith("text/") ||
            mimeType.endsWith("+xml") ||
            mimeType == "application/x-javascript" ||
            mimeType == "application/javascript" ||
            mimeType == "application/json" ||
            mimeType == "application/xml"
        );
    }
};

export const makeURI = (uri: string): MozURI | null => {
    if (!uri) return null;

    try {
        return Services.io.newURI(uri);
    } catch (e) {
        return null;
    }
};

// browser/base/content/utilityOverlay.js
Object.defineProperty(window, "BROWSER_NEW_TAB_URL", {
    enumerable: true,
    get() {
        if (
            PrivateBrowsingUtils.isWindowPrivate(window)
        ) {
            return "about:privatebrowsing";
        }

        return NEW_TAB_URL;
    }
});

export const BROWSER_NEW_TAB_URL =
    window.BROWSER_NEW_TAB_URL;

Object.defineProperty(window, "gFissionBrowser", {
    enumerable: true,
    get() {
        return window.docShell.QueryInterface(
            Ci.nsILoadContext
        ).useRemoteSubframes;
    }
});

export const gFissionBrowser = window.gFissionBrowser;

Object.defineProperty(window, "RTL_UI", {
    enumerable: true,
    get() {
        return Services.locale.isAppLocaleRTL;
    }
});

export const RTL_UI = window.RTL_UI;

export const getRootEvent = (event: any) => {
    if (!event) return event;

    let ev = event;

    while (ev.sourceEvent) {
        if (ev.sourceEvent.button == 1) {
            event = ev.sourceEvent;
            break;
        }

        ev = ev.sourceEvent;
    }

    return event;
};

export const whereToOpenLink = (
    e: KeyboardEvent & MouseEvent,
    ignoreButton: boolean,
    ignoreAlt: boolean
) => {
    if (!e) {
        return "current";
    }

    e = getRootEvent(e);

    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    const meta = e.metaKey;
    const alt = e.altKey && !ignoreAlt;

    const middleClick = !ignoreButton && e.button == 1;

    const middleOpensTabs = dot.prefs.get(
        "browser.tabs.opentabfor.middleclick",
        true
    );

    const middleOpensWindows = dot.prefs.get(
        "middlemouse.openNewWindow",
        false
    );

    const metaKey =
        AppConstants.platform == "macosx" ? meta : ctrl;

    if (metaKey || (middleClick && middleOpensTabs)) {
        return shift ? "tabshifted" : "tab";
    }

    if (
        alt &&
        dot.prefs.get("browser.altClickSave", false)
    ) {
        return "save";
    }

    if (
        shift ||
        (middleClick &&
            !middleOpensTabs &&
            middleOpensWindows)
    ) {
        return "window";
    }

    return "current";
};

exportPublic("whereToOpenLink", whereToOpenLink);

export const openTrustedLinkIn = (
    url: any,
    where: string,
    params: any = {}
) => {
    if (!params.triggeringPrincipal) {
        params.triggeringPrincipal =
            Services.scriptSecurityManager.getSystemPrincipal();
    }

    openUILinkIn(url, where, params);
};

exportPublic("openTrustedLinkIn", openTrustedLinkIn);

export const openUILinkIn = (
    url: any,
    where: string,
    allowThirdPartyFixup: any,
    postData?: any,
    referrerInfo?: any
) => {
    var params = allowThirdPartyFixup;

    if (!params || !params.triggeringPrincipal) {
        throw new Error(
            "Required argument triggeringPrincipal missing within openUILinkIn"
        );
    }

    params.fromChrome = params.fromChrome ?? true;

    openLinkIn(url, where, params);
};

export const getTopWin = (skipPopups?: boolean) => {
    if (
        top?.document.documentElement.getAttribute(
            "windowtype"
        ) == "navigator:browser" &&
        (!skipPopups || top?.toolbar.visible)
    ) {
        return top;
    }

    return BrowserWindowTracker.getTopWindow({
        private:
            PrivateBrowsingUtils.isWindowPrivate(window),
        allowPopups: !skipPopups
    });
};

const doGetProtocolFlags = (uri: MozURI) => {
    const handler = Services.io.getProtocolHandler(
        uri.scheme
    );

    return handler instanceof
        Ci.nsIProtocolHandlerWithDynamicFlags
        ? handler
              .QueryInterface(
                  Ci.nsIProtocolHandlerWithDynamicFlags
              )
              .getFlagsForURI(uri)
        : handler.protocolFlags;
};

export const openLinkIn = (
    url: any,
    where: string,
    params: any
) => {
    if (!where || !url) return;

    let {
        fromChrome,
        allowThirdPartyFixup,
        postData,
        charset,
        referrerInfo,
        relatedToCurrent,
        allowInheritPrincipal,
        forceAllowDataURI,
        inBackground,
        initiatingDoc,
        private: isPrivate,
        allowPinnedTabHostChange,
        allowPopups,
        userContextId,
        indicateErrorPageLoad,
        originPrincipal,
        originStoragePrincipal,
        triggeringPrincipal,
        csp,
        forceAboutBlankViewerInCurrent,
        resolveOnNewTabCreated,
        frameID,
        openerBrowser,
        avoidBrowserFocus
    } = params;

    if (!referrerInfo) {
        referrerInfo = new ReferrerInfo(
            Ci.nsIReferrerInfo.EMPTY,
            true,
            null
        );
    }

    allowInheritPrincipal = !!allowInheritPrincipal;
    allowPinnedTabHostChange = !!allowPinnedTabHostChange;

    if (!triggeringPrincipal) {
        throw new Error(
            "Must load with a triggering Principal"
        );
    }

    if (where == "save") {
        if ("isContentWindowPrivate" in params) {
            // todo add saveURL api
            // saveURL(
            //     url,
            //     null,
            //     null,
            //     true,
            //     true,
            //     referrerInfo,
            //     null,
            //     null,
            //     params.isContentWindowPrivate,
            //     originPrincipal
            // );
        } else {
            if (!initiatingDoc) {
                throw new Error(
                    "openUILink/openLinkIn was called with " +
                        "where == 'save' but without initiatingDoc.  See bug 814264."
                );
            }

            // saveURL(
            //     url,
            //     null,
            //     null,
            //     true,
            //     true,
            //     referrerInfo,
            //     null,
            //     initiatingDoc
            // );
        }

        return;
    }

    // Establish which window we'll load the link in.
    let win: any;
    if (where == "current" && params.targetBrowser) {
        win = params.targetBrowser.ownerGlobal;
    } else {
        win = getTopWin();
    }

    // We don't want to open tabs in popups, so try to find a non-popup window in
    // that case.
    if (
        (where == "tab" || where == "tabshifted") &&
        win &&
        !win.toolbar.visible
    ) {
        win = getTopWin(true);
        relatedToCurrent = false;
    }

    const useOAForPrincipal = (principal: any) => {
        if (principal && principal.isContentPrincipal) {
            const privateBrowsingId =
                isPrivate ||
                (win &&
                    PrivateBrowsingUtils.isWindowPrivate(
                        win
                    ));

            const { firstPartyDomain } =
                principal.originAttributes;

            return Services.scriptSecurityManager.principalWithOA(
                principal,
                {
                    userContextId,
                    privateBrowsingId,
                    firstPartyDomain
                }
            );
        }

        return principal;
    };

    originPrincipal = useOAForPrincipal(originPrincipal);
    originStoragePrincipal = useOAForPrincipal(
        originStoragePrincipal
    );
    triggeringPrincipal = useOAForPrincipal(
        triggeringPrincipal
    );

    if (!win || where == "window") {
        let features = "chrome,dialog=no,all";

        if (isPrivate) {
            features += ",private";

            /*
                Clear the referrer when switching from normal
                browsing context to private browsing context
            */
            referrerInfo = new ReferrerInfo(
                referrerInfo.referrerPolicy,
                false,
                referrerInfo.originalReferrer
            );
        }

        // This propagates to window.arguments.
        const sa = Cc[
            "@mozilla.org/array;1"
        ].createInstance(Ci.nsIMutableArray);

        const wuri = Cc[
            "@mozilla.org/supports-string;1"
        ].createInstance(Ci.nsISupportsString);
        wuri.data = url;

        const docCharset = charset;

        if (charset) {
            charset = Cc[
                "@mozilla.org/supports-string;1"
            ].createInstance(Ci.nsISupportsString);
            charset.data = `charset=${docCharset}`;
        }

        const allowThirdPartyFixupSupports = Cc[
            "@mozilla.org/supports-PRBool;1"
        ].createInstance(Ci.nsISupportsPRBool);

        allowThirdPartyFixupSupports.data =
            allowThirdPartyFixup;

        const userContextIdSupports = Cc[
            "@mozilla.org/supports-PRUint32;1"
        ].createInstance(Ci.nsISupportsPRUint32);

        userContextIdSupports.data = userContextId;

        sa.appendElement(wuri);
        sa.appendElement(charset);
        sa.appendElement(referrerInfo);
        sa.appendElement(postData);
        sa.appendElement(allowThirdPartyFixupSupports);
        sa.appendElement(userContextIdSupports);
        sa.appendElement(originPrincipal);
        sa.appendElement(originStoragePrincipal);
        sa.appendElement(triggeringPrincipal);
        sa.appendElement(null); // allowInheritPrincipal
        sa.appendElement(csp);

        const sourceWindow = win || window;

        if (
            params.frameID !== undefined &&
            sourceWindow
        ) {
            const sourceTabBrowser =
                sourceWindow.dot.tabs.selectedTab
                    .webContents;

            const delayedStartupObserver = (
                subject: any
            ) => {
                if (subject == win) {
                    const browser =
                        win.dot.tabs.selectedTab
                            .webContents;

                    Services.obs.removeObserver(
                        delayedStartupObserver,
                        "browser-delayed-startup-finished"
                    );

                    Services.obs.notifyObservers(
                        {
                            wrappedJSObject: {
                                url,
                                createdTabBrowser:
                                    browser,
                                sourceTabBrowser,
                                sourceFrameID: frameID
                            }
                        },
                        "webNavigation-createdNavigationTarget"
                    );
                }
            };

            Services.obs.addObserver(
                delayedStartupObserver,
                "browser-delayed-startup-finished"
            );
        }

        win = Services.ww.openWindow(
            sourceWindow,
            AppConstants.BROWSER_CHROME_URL,
            null,
            features,
            sa
        );

        return;
    }

    // We're now committed to loading the link in an existing browser window.

    // Raise the target window before loading the URI, since loading it may
    // result in a new frontmost window (e.g. "javascript:window.open('');").
    win.focus();

    let targetBrowser;
    let loadInBackground;
    let uriObj;

    if (where == "current") {
        const tab = win.dot.tabs.selectedTab;

        targetBrowser = targetBrowser || tab.webContents;
        loadInBackground = false;

        try {
            uriObj = makeURI(url);
        } catch (e) {}

        if (
            !allowPinnedTabHostChange &&
            tab.pinned &&
            url !== "about:crashcontent"
        ) {
            try {
                if (
                    !uriObj ||
                    (!uriObj.schemeIs("javascript") &&
                        targetBrowser.currentURI.host !==
                            uriObj.host)
                ) {
                    where = "tab";
                    loadInBackground = false;
                }
            } catch (err) {
                where = "tab";
                loadInBackground = false;
            }
        }
    } else {
        loadInBackground = inBackground;

        if (loadInBackground == null) {
            loadInBackground = fromChrome
                ? false
                : dot.prefs.get(
                      "browser.tabs.loadInBackground"
                  );
        }
    }

    let focusUrlBar = false;

    const {
        LOAD_FLAGS_NONE,
        LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP,
        LOAD_FLAGS_FIXUP_SCHEME_TYPOS,
        LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL,
        LOAD_FLAGS_ALLOW_POPUPS,
        LOAD_FLAGS_ERROR_LOAD_CHANGES_RV,
        LOAD_FLAGS_FORCE_ALLOW_DATA_URI
    } = Ci.nsIWebNavigation;

    switch (where) {
        case "current":
            let flags = LOAD_FLAGS_NONE;

            if (allowThirdPartyFixup) {
                flags |=
                    LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP;
                flags |= LOAD_FLAGS_FIXUP_SCHEME_TYPOS;
            }

            if (!allowInheritPrincipal) {
                flags |=
                    LOAD_FLAGS_DISALLOW_INHERIT_PRINCIPAL;
            }

            if (allowPopups) {
                flags |= LOAD_FLAGS_ALLOW_POPUPS;
            }

            if (indicateErrorPageLoad) {
                flags |= LOAD_FLAGS_ERROR_LOAD_CHANGES_RV;
            }

            if (forceAllowDataURI) {
                flags |= LOAD_FLAGS_FORCE_ALLOW_DATA_URI;
            }

            const { URI_INHERITS_SECURITY_CONTEXT } =
                Ci.nsIProtocolHandler;

            if (
                forceAboutBlankViewerInCurrent &&
                (!uriObj ||
                    doGetProtocolFlags(uriObj) &
                        URI_INHERITS_SECURITY_CONTEXT)
            ) {
                targetBrowser.createAboutBlankContentViewer(
                    originPrincipal,
                    originStoragePrincipal
                );
            }

            targetBrowser.loadURI(url, {
                triggeringPrincipal,
                csp,
                flags,
                referrerInfo,
                postData,
                userContextId
            });

            // Don't focus the content area if focus is in the address bar and we're
            // loading the New Tab page.
            focusUrlBar = win.isBlankPageURL(url);

            break;
        case "tabshifted":
            loadInBackground = !loadInBackground;
        // fall through
        case "tab":
            focusUrlBar =
                !loadInBackground &&
                win.isBlankPageURL(url);

            win.dot.tabs.create({
                url,
                referrerInfo,
                charset,
                postData,
                inBackground: loadInBackground,
                allowThirdPartyFixup,
                relatedToCurrent,
                userContextId,
                originPrincipal,
                originStoragePrincipal,
                triggeringPrincipal,
                allowInheritPrincipal,
                csp,
                focusUrlBar,
                openerBrowser: openerBrowser
            });

            if (resolveOnNewTabCreated) {
                resolveOnNewTabCreated(true);
            }

            if (frameID !== undefined && win) {
                Services.obs.notifyObservers(
                    {
                        wrappedJSObject: {
                            url,
                            createdTabBrowser:
                                targetBrowser,
                            sourceTabBrowser:
                                win.dot.tabs.selectedTab
                                    .webContents,
                            sourceFrameID: frameID
                        }
                    },
                    "webNavigation-createdNavigationTarget"
                );
            }
            break;
    }

    if (
        !avoidBrowserFocus &&
        !focusUrlBar &&
        targetBrowser &&
        targetBrowser.browserId == win.dot.tabs.selectedId
    ) {
        targetBrowser.focus();
    }
};

exportPublic("openLinkIn", openLinkIn);

export const BrowserOpenTab = (event?: any) => {
    let where = "tab";
    let relatedToCurrent = false;

    if (event) {
        where = whereToOpenLink(event, false, true);

        switch (where) {
            case "tab":
            case "tabshifted":
                // When accel-click or middle-click are used, open the new tab as
                // related to the current tab.
                relatedToCurrent = true;
                break;
            case "current":
                where = "tab";
                break;
        }
    }

    Services.obs.notifyObservers(
        {
            wrappedJSObject: new Promise((resolve) => {
                openTrustedLinkIn(
                    window.BROWSER_NEW_TAB_URL,
                    where,
                    {
                        relatedToCurrent,
                        resolveOnNewTabCreated: resolve
                    }
                );
            })
        },
        "browser-open-newtab-start"
    );
};

exportPublic("BrowserOpenTab", BrowserOpenTab);

export const openPreferences = () => {
    let win = Services.wm.getMostRecentWindow(
        "navigator:browser"
    );

    if (!win) {
        const windowArguments = Cc[
            "@mozilla.org/array;1"
        ].createInstance(Ci.nsIMutableArray);

        const supportsStringPrefURL = Cc[
            "@mozilla.org/supports-string;1"
        ].createInstance(Ci.nsISupportsString);

        supportsStringPrefURL.data = "about:settings";
        windowArguments.appendElement(
            supportsStringPrefURL
        );

        win = Services.ww.openWindow(
            null,
            AppConstants.BROWSER_CHROME_URL,
            "_blank",
            "chrome,dialog=no,all",
            windowArguments
        );
    } else {
        win.dot.tabs.create({
            url: "about:settings"
        });
    }
};

exportPublic("openPreferences", openPreferences);

export const openTroubleshootingPage = () => {
    openTrustedLinkIn("about:support", "tab");
};

exportPublic(
    "openTroubleshootingPage",
    openTroubleshootingPage
);

export const openFeedbackPage = () => {
    openTrustedLinkIn(
        Services.urlFormatter.formatURLPref(
            "app.feedback.baseURL"
        ),
        "tab"
    );
};

exportPublic("openFeedbackPage", openFeedbackPage);

export const openHelpLink = (
    topic?: string,
    fromModal?: boolean,
    where?: any
) => {
    const url = getHelpLinkURL(topic);

    where = where ? where : fromModal ? "window" : "tab";

    openTrustedLinkIn(url, where);
};

exportPublic("openHelpLink", openHelpLink);

export const getHelpLinkURL = (topic?: string) => {
    const supportUrl =
        Services.urlFormatter.formatURLPref(
            "app.support.baseURL"
        );

    return `${supportUrl}${topic}`;
};

exportPublic("getHelpLinkURL", getHelpLinkURL);

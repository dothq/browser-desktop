/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const EXPORTED_SYMBOLS = ["LinkHandlerParent"];

const { Services } = ChromeUtils.import(
    "resource://gre/modules/Services.jsm"
);

ChromeUtils.defineModuleGetter(
    this,
    "PlacesUIUtils",
    "resource:///modules/PlacesUIUtils.jsm"
);

class LinkHandlerParent extends JSWindowActorParent {
    get store() {
        return this.browsingContext.top.embedderElement
            .ownerGlobal.store;
    }

    receiveMessage(aMsg) {
        let browser =
            this.browsingContext.top.embedderElement;
        if (!browser) {
            return;
        }

        let win = browser.ownerGlobal;

        let gBrowser = win.gBrowser;

        switch (aMsg.name) {
            case "Link:LoadingIcon":
                if (aMsg.data.canUseForTab) {
                    this.store.dispatch({
                        type: "TAB_UPDATE_STATE",
                        payload: {
                            id: browser.browserId,
                            state: "loading"
                        }
                    });
                }

                break;

            case "Link:SetIcon":
                // Cache the most recent icon and rich icon locally.
                if (aMsg.data.canUseForTab) {
                    this.icon = aMsg.data;
                } else {
                    this.richIcon = aMsg.data;
                }

                this.setIconFromLink(
                    gBrowser,
                    browser,
                    aMsg.data
                );

                break;

            case "Link:SetFailedIcon":
                break;

            case "Link:AddSearch":
                break;
        }
    }

    setIconFromLink(
        gBrowser,
        browser,
        {
            pageURL,
            originalURL,
            canUseForTab,
            expiration,
            iconURL,
            canStoreIcon
        }
    ) {
        let faviconUrl;
        try {
            faviconUrl = Services.io.newURI(iconURL);
        } catch (ex) {
            Cu.reportError(ex);
            return;
        }
        if (faviconUrl.scheme != "data") {
            try {
                Services.scriptSecurityManager.checkLoadURIWithPrincipal(
                    browser.contentPrincipal,
                    faviconUrl,
                    Services.scriptSecurityManager
                        .ALLOW_CHROME
                );
            } catch (ex) {
                return;
            }
        }
        if (canStoreIcon) {
            try {
                PlacesUIUtils.loadFavicon(
                    browser,
                    Services.scriptSecurityManager.getSystemPrincipal(),
                    Services.io.newURI(pageURL),
                    Services.io.newURI(originalURL),
                    expiration,
                    faviconUrl
                );
            } catch (ex) {
                Cu.reportError(ex);
            }
        }

        if (canUseForTab) {
            this.store.dispatch({
                type: "TAB_UPDATE_FAVICON",
                payload: {
                    id: browser.browserId,
                    faviconUrl: faviconUrl.spec
                }
            });
        }
    }
}

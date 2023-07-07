/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/AppConstants.sys.mjs"
);

const NEW_WINDOWS_ALWAYS_NATIVE_PREF = "browser.link.open_newwindow.native";

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 */

export class DotPopupHandlerParent extends JSWindowActorParent {
    /**
     * Receive a message
     * @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument} message 
     */
    async receiveMessage(message) {
        const args = message.data;

        switch (message.name) {
            case "Popup:Open":
                return await this.openPopup(args);
        }
    }

    /**
     * Checks if we can load a URI from
     * @param {object} data 
     * @returns 
     */
    _canLoadURIFromScript({ uri, principal }) {
        try {
            Services.scriptSecurityManager.checkLoadURIWithPrincipal(
                principal,
                uri,
                Services.scriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL
            );

            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Opens a popup
     * @param {object} args 
     * @param {any} args.openWindowInfo 
     * @param {number} args.flags 
     * @param {boolean} args.calledFromJS 
     * @param {nsIURI} args.uri
     * @param {string} args.name
     * @param {string} args.features
     * @param {boolean} args.forceNoOpener
     * @param {boolean} args.forceNoReferrer
     * @param {boolean} args.isPopupRequested
     * @param {any} args.loadState
     */
    async openPopup({
        openWindowInfo,
        flags,
        calledFromJS,
        uri,
        name,
        features,
        forceNoOpener,
        forceNoReferrer,
        isPopupRequested,
        loadState
    }) {
        console.log("Popups::openPopup", openWindowInfo, flags, calledFromJS, uri, name, features, forceNoOpener, forceNoReferrer, isPopupRequested, loadState)

        const browsingContext = this.browsingContext.top;
        const browser = /** @type {ChromeBrowser} */ (browsingContext.embedderElement);

        const IS_CONTENT = browsingContext.isContent;

        // If we're a chrome actor, use the owner window
        // Otherwise, just get the ownerGlobal from the browser element
        const win = !IS_CONTENT && browsingContext.window
            ? browsingContext.window
            : browser.ownerGlobal;

        const tab = win.gDot.tabs.getTabForWebContents(browser);

        const isNativePopup = (
            !(
                tab &&
                tab.modalBox
            ) ||
            Services.prefs.getBoolPref(NEW_WINDOWS_ALWAYS_NATIVE_PREF, false) || // If user only wants native windows
            win.gDot.isPopupWindow // We shouldn't allow popups to open popups from inside a popup
        );

        /** @type {BrowserContentPopup} */
        let popup = null;
        let openName = "";

        if (!isNativePopup) {
            popup = /** @type {BrowserContentPopup} */ (win.document.createElement("browser-content-popup"));
            popup.initialise(
                // @todo: we probably shouldn't use a private API here, change it soon
                win.gDot.tabs._generateUniqueTabID()
            );

            tab.modalBox.insertModal(popup);

            openName = popup
                .querySelector(".browser-content-popup-frame")
                .getAttribute("name");
        }

        let urlToLoad = "about:blank";

        if (uri) {
            try {
                urlToLoad = Services.io.newURI(
                    uri.spec,
                    "",
                    this.browsingContext.currentURI
                ).spec;
            } catch (e) {
                throw e;
            }
        }

        const popupWin = win.openDialog(
            AppConstants.BROWSER_CHROME_URL,
            openName,
            features || "", // @todo: handle features
            urlToLoad // url: arguments[0]
        )

        return await new Promise((res) => {
            if (popup) {
                popup.setWindowFeatures(features);

                popup.browser.contentWindow.addEventListener("DOMContentLoaded", () => {
                    popup.patchPopupWindow();

                    popup.show();
                    popup.browser.contentDocument.documentElement.setAttribute("chromepopup", "");
                    popup.browser.contentDocument.documentElement.setAttribute("chromehidden", "");

                    console.log("popup init", /** @type {ChromeBrowser} */(popup.browser.contentWindow.gDot.tabs.selectedTab.webContents).browsingContext.id)

                    res(/** @type {ChromeBrowser} */(popup.browser.contentWindow.gDot.tabs.selectedTab.webContents).browsingContext.id)
                });

                popup.addEventListener("popupclosed", () => {
                    tab.modalBox.removeChild(popup);
                })
            } else {
                popupWin.addEventListener("DOMContentLoaded", () => {
                    popupWin.document.documentElement.setAttribute("chromepopup", "");
                    popupWin.document.documentElement.setAttribute("chromehidden", "");

                    console.log("popup init", /** @type {ChromeBrowser} */(popupWin.gDot.tabs.selectedTab.webContents).browsingContext.id)

                    res(/** @type {ChromeBrowser} */(popupWin.gDot.tabs.selectedTab.webContents).browsingContext.id)
                })
            }
        });
    }
}
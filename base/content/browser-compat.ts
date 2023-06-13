/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChromeBrowser } from "third_party/dothq/gecko-types/lib";

/**
 * browser-compat is used as a compatibility layer to translate Dot APIs to the original FF/Gecko APIs
 * 
 * When building Dot Browser, we eventually need to use existing code built by Mozilla, and we don't really
 * want to move code into the Dot tree that could easily be changed upstream.
 * 
 * For this reason, it's easier for us to create a compatibility layer between our APIs and the Mozilla APIs,
 * to avoid breaking these important scripts.
 * 
 * @deprecated You shouldn't use this in Dot code directly! This is purely intended for use by existing Mozilla modules and scripts to maintain compatibility.
 */
var gBrowser = {
    get currentURI() {
        return Services.io.newURI("about:blank")
    },

    get selectedBrowser() { 
        return gDot.tabs.selectedBrowser;
    },

    get ownerGlobal() {
        return window
    },

    get ownerDocument() {
        return document
    },

    getTabForBrowser(browser: ChromeBrowser) {
        return gDot.tabs.getTabForBrowser(browser);
    }
}

export {
    gBrowser
};
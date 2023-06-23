/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LoadURIOptions } from "third_party/dothq/gecko-types/lib/nsIWebNavigation";

/**
 * browser-compat is used as a compatibility layer to translate Dot APIs to the original FF/Gecko APIs
 * 
 * When building Dot Browser, we eventually need to use existing code built by Mozilla, and we don't really
 * want to move code into the Dot tree that could easily be changed upstream.
 * 
 * For this reason, it's easier for us to create a compatibility layer between our APIs and the Mozilla APIs,
 * to avoid breaking these important scripts.
 * 
 * **You shouldn't use this in Dot code directly! This is purely intended to preserve the functionality 
 * of existing Mozilla modules and scripts, to maintain compatibility.**
 */

function defineGetter(object: object, name: string, getter: () => any, options?: PropertyDescriptor) {
    return Object.defineProperty(object, name, {
        ...(options || {}),
        get: getter
    });
} 

function defineSetter(object: object, name: string, setter: (v: any) => void, options?: PropertyDescriptor) {
    return Object.defineProperty(object, name, {
        ...(options || {}),
        set: setter
    });
} 

function proxyBrowserTab(tab: BrowserTab) {
    defineGetter(tab, "linkedBrowser", () => {
        if ((tab.webContents as ChromeBrowser).browserId) {
            return tab.webContents;
        }

        // When our webContents isn't a browser, just create a new blank browser
        return document.createXULElement("browser");
    });

    return tab;
}

function proxyBrowserTabsList(list: any[]) {
    return Array.from(list).map(proxyBrowserTab);
}

var gBrowser = {
    get tabs() {
        return proxyBrowserTabsList(gDot.tabs.list);
    },

    get currentURI() {
        return this.selectedBrowser.currentURI;
    },

    get selectedTab() {
        return gDot.tabs.selectedTab;
    },

    get selectedBrowser() { 
        return gDot.tabs.selectedTab.webContents;
    },

    get ownerGlobal() {
        return window
    },

    get ownerDocument() {
        return document
    },

    getTabForBrowser(browser: ChromeBrowser) {
        return gDot.tabs.getTabForWebContents(browser);
    },

    addTab(uri: string, options: LoadURIOptions) {
        return gDot.tabs.createTab({
            ...options,
            uri
        });
    }
}

export {
    gBrowser
};
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

const { nsIAboutModule } = Ci;

class AboutNewTab {
    QueryInterface = ChromeUtils.generateQI([nsIAboutModule]);

    newChannel(uri, loadInfo) {
        const chan = Services.io.newChannelFromURIWithLoadInfo(this.uri, loadInfo);
        chan.owner = Services.scriptSecurityManager.getSystemPrincipal();
        return chan;
    }

    get contractID() {
        const uri = Services.io.newURI(this.classDescription);
        const path = uri.pathQueryRef;

        return `@mozilla.org/network/protocol/about;1?what=${path}`
    }

    getURIFlags() {
        return this.flags;
    }

    getChromeURI(_uri) {
        return this.uri;
    }

    constructor() {
        this.uri = Services.io.newURI(
            "chrome://dot/content/resources/newtab/start-page.html"
        );
        this.classDescription = "about:newtab";
        this.classID = Components.ID("526d0db5-2f51-4a89-bcef-b6f9d7101abe");

        this.flags = nsIAboutModule.ALLOW_SCRIPT |
            nsIAboutModule.ENABLE_INDEXED_DB;
    }
}

var EXPORTED_SYMBOLS = ["AboutNewTab"];

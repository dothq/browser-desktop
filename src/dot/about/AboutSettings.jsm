/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

const { nsIAboutModule } = Ci;

class AboutSettings {
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
            "chrome://dot/content/resources/settings/settings.html"
        );
        this.classDescription = "about:settings";
        this.classID = Components.ID("f0d1277e-8934-4438-acf3-030fd0ecc139");

        this.flags = nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT |
            nsIAboutModule.ALLOW_SCRIPT;
    }
}

var EXPORTED_SYMBOLS = ["AboutSettings"];

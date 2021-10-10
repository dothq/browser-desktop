/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

var EXPORTED_SYMBOLS = ["BrowserTabParent"];

const { BrowserWindowTracker } = ChromeUtils.import(
    "resource:///modules/BrowserWindowTracker.jsm"
);

class BrowserTabParent extends JSWindowActorParent {
    receiveMessage(message) {
        let browser =
            this.browsingContext.top.embedderElement;
        if (!browser) {
            return;
        }

        switch (message.name) {
            case "Browser:WindowCreated": {
                break;
            }

            case "Browser:FirstPaint": {
                break;
            }
        }
    }
}

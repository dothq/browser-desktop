/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

var EXPORTED_SYMBOLS = ["LightweightThemeChild"];

const { Services } = ChromeUtils.import(
    "resource://gre/modules/Services.jsm"
);

class LightweightThemeChild extends JSWindowActorChild {
    initted = false;

    constructor() {
        super();

        Services.cpmm.sharedData.addEventListener(
            "change",
            this
        );
    }

    handleEvent(event) {
        if (event.type == "change") {
            if (
                event.changedKeys.includes(
                    `dot-theme-${this.outerWindowId}`
                )
            ) {
                this.push();
            }
        }
    }

    didDestroy() {
        Services.cpmm.sharedData.removeEventListener(
            "change",
            this
        );
    }

    get outerWindowId() {
        try {
            // Getting the browserChild throws an exception when it is null.
            let browserChild = this.docShell.browserChild;
            if (browserChild) {
                return browserChild.chromeOuterWindowID;
            }
        } catch (ex) {}

        // We don't have a message manager, so presumable we're running in a sidebar
        // in the parent process.
        return this.contentWindow.top?.docShell
            ?.outerWindowID;
    }

    push() {
        const event = Cu.cloneInto(
            {
                detail: {
                    data: Services.cpmm.sharedData.get(
                        `dot-theme-${this.outerWindowId}`
                    )
                }
            },
            this.contentWindow
        );

        this.contentWindow.dispatchEvent(
            new this.contentWindow.CustomEvent(
                "theme-update",
                event
            )
        );
    }
}

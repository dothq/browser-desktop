/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

var EXPORTED_SYMBOLS = ["ContextMenuParent"];

class ContextMenuParent extends JSWindowActorParent {
    receiveMessage(message) {
        let win = this.browsingContext.topChromeWindow;
        if (!win) {
            return;
        }

        const dot = win.dot;

        if (dot.menus.visibleMenu) {
            return dot.menus.clear();
        }

        const { clientX: x, clientY: y } =
            message.data.context;

        const chromeHeight =
            win.document.body.getBoundingClientRect()
                .height -
            dot.browsersPrivate.tabStack.getBoundingClientRect()
                .height;

        message.data.context.tabId =
            message.target.browsingContext.browserId;

        dot.menus.create(
            "PageMenu",
            { x, y: y + chromeHeight },
            message.data.context
        );
    }

    hiding() {
        let win = this.browsingContext.topWindow;
        if (!win) {
            return;
        }

        win.dot.menus.clear();
    }
}

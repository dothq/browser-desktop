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

        const { clientX, clientY } = message.data.context;

        const chromeHeight = win.document.body.getBoundingClientRect().height -
            dot.browsersPrivate.tabStack.getBoundingClientRect().height

        const tabs = win.store.getState().tabs;

        const {
            canGoBack,
            canGoForward,
            bookmarked
        } = tabs.getTabById(tabs.selectedId);

        dot.menus.update("context-navigation", "context-back", {
            disabled: !canGoBack
        });

        dot.menus.update("context-navigation", "context-forward", {
            disabled: !canGoForward
        });

        dot.menus.update("context-navigation", "context-bookmarkpage", {
            label: bookmarked
                ? "Edit Bookmark…"
                : "Bookmark",
            icon: `chrome://dot/content/skin/icons/` + (bookmarked
                ? "bookmark-filled.svg"
                : "actions/new-bookmark.svg"),
            iconColour: bookmarked ? `var(--dot-ui-accent-colour)` : ``
        });

        dot.menus.open(
            "context-navigation",
            {
                x: clientX,
                y: clientY + chromeHeight
            }
        );

        console.log(message);
    }

    hiding() {
        let win = this.browsingContext.topWindow;
        if (!win) {
            return;
        }

        win.dot.menus.clear();
    }
}

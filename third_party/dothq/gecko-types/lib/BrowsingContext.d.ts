/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIURI } from "./nsIURI";

export interface BrowsingContextGlobal {
    getFromWindow(win: Window): BrowsingContext;
}

export interface BrowsingContext {
    /**
     * A unique identifier for the browser element that is hosting this
     * BrowsingContext tree. Every BrowsingContext in the element's tree will
     * return the same ID in all processes and it will remain stable regardless of
     * process changes. When a browser element's frameloader is switched to
     * another browser element this ID will remain the same but hosted under the
     * under the new browser element.
     * We are using this identifier for getting the active tab ID and passing to
     * the profiler back-end. See `getActiveBrowserID` for the usage.
     */
    browserId: number;

    hasSiblings: boolean;

    isAppTab: boolean;

    window: Window;

    top: BrowsingContext;

    embedderElement: Element | null;

    isContent: boolean;

    currentURI: nsIURI;

    id: number;
}
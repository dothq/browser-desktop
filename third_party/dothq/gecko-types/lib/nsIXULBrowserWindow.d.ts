/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIURI } from "./nsIURI";

export interface nsIXULBrowserWindow {
    /**
     * Tells the object implementing this function what link we are currently
     * over.
     */
    setOverLink(link: string): void;

    /**
     * Determines the appropriate target for a link.
     */
    onBeforeLinkTraversal(originalTarget: string,
                            linkURI: nsIURI,
                            linkNode: Node,
                            isAppTab: boolean): string;
  
    /**
     * Show/hide a tooltip (when the user mouses over a link, say).
     *
     * x and y coordinates are in device pixels.
     */
    showTooltip(x: number, y: number, tooltip: string, direction: string,
                    browser: Element): void;
    hideTooltip(): void;
  
    /**
     * Return the number of tabs in this window.
     */
    getTabCount(): number;
}
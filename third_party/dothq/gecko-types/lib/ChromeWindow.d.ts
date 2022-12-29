/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Browser } from "./Browser";
import { ChromeBrowser } from "./ChromeBrowser";

export interface ChromeWindow {
    gBrowser: Browser;
    focus(): void;
    openWebLinkIn(
        url: string,
        where: "current" | "tab" | "window",
        options: Partial<{
            // Not all possible options are present, please add more if/when needed.
            userContextId: number;
            forceNonPrivate: boolean;
            resolveOnContentBrowserCreated: (
                contentBrowser: ChromeBrowser
            ) => unknown;
        }>
    ): void;
}
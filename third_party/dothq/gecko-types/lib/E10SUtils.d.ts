/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChromeBrowser } from "./ChromeBrowser";

export interface E10SUtils {
    NOT_REMOTE: null;
    DEFAULT_REMOTE_TYPE: string;
    PRIVILEGEDABOUT_REMOTE_TYPE: string;

    getRemoteTypeForURI(url: string, multiProcess: boolean, remoteSubframes: boolean, preferredRemoteType: string, currentURI: string, originAttributes: object): string;
    predictOriginAttributes({
        window,
        browser,
        userContextId,
        geckoViewSessionContextId,
        privateBrowsingId,
    }: {
        window?: Window,
        browser?: ChromeBrowser,
        userContextId?: number,
        geckoViewSessionContextId?: number,
        privateBrowsingId?: number
    }): { 
        privateBrowsingId: number,
        userContextId: number,
        geckoViewSessionContextId: number 
    };
}
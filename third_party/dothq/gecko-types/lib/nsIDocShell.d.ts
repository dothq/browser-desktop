/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIDocShell {
    /**
     * Loads a given URI.  This will give priority to loading the requested URI
     * in the object implementing this interface.  If it can't be loaded here
     * however, the URL dispatcher will go through its normal process of content
     * loading.
     *
     * @param aLoadState This is the extended load info for this load.
     * @param aSetNavigating If we should set isNavigating to true while initiating
     *                       the load.
     */
    loadURI(aLoadState: any, aSetNavigating: boolean): void;

    treeOwner: any; /* @todo */

    outerWindowID: number;

    /**
        * Cherry picked parts of nsIController.
        * They are here, because we want to call these functions
        * from JS.
        */
    isCommandEnabled(command: string): boolean;

    doCommand(command: string): void;

    doCommandWithParams(command: string, params: /* @todo nsICommandParams */ any): void;

    QueryInterface: (obj: any) => any;

    isLoadingDocument: boolean;
}
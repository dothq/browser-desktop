/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FrameLoader } from "./FrameLoader";
import { JSWindowActorParent } from "./JSWindowActorParent";
import { WindowGlobalChild } from "./WindowGlobalChild";

export interface WindowGlobalParent {
    new(): {
        readonly isClosed: boolean;
        readonly isCurrentGlobal: boolean;
        readonly outerWindowId: number;
        readonly contentParentId: number;
        readonly osPid: number;
        readonly isProcessRoot: boolean;
        readonly isInitialDocument: boolean;
        readonly rootFrameLoader?: FrameLoader;
        readonly childActor?: WindowGlobalChild;

        /** 
         * Checks for any WindowContexts with "beforeunload" listeners in this
         * WindowGlobal's subtree. If any exist, a "beforeunload" event is
         * dispatched to them. If any of those request to block the navigation,
         * displays a prompt to the user. Returns a boolean which resolves to true
         * if the navigation should be allowed.
         *
         * If `timeout` is greater than 0, it is the maximum time (in milliseconds)
         * we will wait for a child process to respond with a request to block
         * navigation before proceeding. If the user needs to be prompted, however,
         * the promise will not resolve until the user has responded, regardless of
         * the timeout.
         */
        permitUnload(action?: "prompt" | "dontUnload" | "unload", timeout?: number): Promise<boolean>;

        readonly documentPrincipal: any;
        readonly documentStoragePrincipal: any;
        readonly contentBlockingAllowListPrincipal?: any;
        readonly documentURI?: URL;
        readonly documentTitle: string;
        readonly cookieJarSettings?: any; /* @todo */

        // Bit mask containing content blocking events that are recorded in
        // the document's content blocking log.
        readonly contentBlockingEvents: number;

        // String containing serialized content blocking log.
        readonly contentBlockingLog: string;

        // DOM Process which this window was loaded in. Will be either InProcessParent
        // for windows loaded in the parent process, or ContentParent for windows
        // loaded in the content process.
        readonly domProcess?: any;

        /**
         * Get or create the JSWindowActor with the given name.
         *
         * See WindowActorOptions from JSWindowActor.webidl for details on how to
         * customize actor creation.
         */
        getActor(name: string): JSWindowActorParent;
        getExistingActor(name: string): JSWindowActorParent | null;

        /**
         * Renders a region of the frame into an image bitmap.
         *
         * @param rect Specify the area of the document to render, in CSS pixels,
         * relative to the page. If null, the currently visible viewport is rendered.
         * @param scale The scale to render the window at. Use devicePixelRatio
         * to have comparable rendering to the OS.
         * @param backgroundColor The background color to use.
         * @param resetScrollPosition If true, temporarily resets the scroll position
         * of the root scroll frame to 0, such that position:fixed elements are drawn
         * at their initial position. This parameter only takes effect when passing a
         * non-null rect.
         *
         * This API can only be used in the parent process, as content processes
         * cannot access the rendering of out of process iframes. This API works
         * with remote and local frames.
         */
        drawSnapshot(
            rect?: DOMRect,
            scale?: number,
            backgroundColor?: string,
            resetScrollPosition?: boolean
        ): Promise<ImageBitmap>

        /**
         * Fetches the securityInfo object for this window. This function will
         * look for failed and successful channels to find the security info,
         * thus it will work on regular HTTPS pages as well as certificate
         * error pages.
         *
         * This returns a Promise which resolves to an nsITransportSecurity
         * object with certificate data or undefined if no security info is available.
         */
        getSecurityInfo(): Promise<any> /* @todo */;

        // True if any of the windows in the subtree rooted at this window
        // has active peer connections.  If this is called for a non-top-level
        // context, it always returns false.
        hasActivePeerConnections(): boolean;
    }

    getByInnerWindowId(innerWindowId: number): WindowGlobalParent | null;
}
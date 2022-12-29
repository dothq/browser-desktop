/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "./BrowsingContext";
import { nsIDocShell } from "./nsIDocShell";
import { nsILoadContext } from "./nsILoadContext";

export interface FrameLoader {
    /**
     * Get the docshell from the frame loader.
     */
    readonly docShell?: nsIDocShell;

    /**
     * Get this frame loader's RemoteTab, if it has a remote frame.  Otherwise,
     * returns null.
     */
    readonly remoteTab?: any;

    /**
     * Get an nsILoadContext for the top-level docshell. For remote
     * frames, a shim is returned that contains private browsing and app
     * information.
     */
    readonly loadContext: nsILoadContext;

    /**
     * Get the root BrowsingContext within the frame.
     * This may be null immediately after creating a remote frame.
     */
    readonly browsingContext?: BrowsingContext;

    /**
     * Find out whether the loader's frame is at too great a depth in
     * the frame tree.  This can be used to decide what operations may
     * or may not be allowed on the loader's docshell.
     */
    readonly depthTooGreat: boolean;

    /**
     * Find out whether the loader's frame is a remote frame.
     */
    readonly isRemoteFrame: boolean;

    /**
     * Activate event forwarding from client (remote frame) to parent.
     */
    activateFrameEvent(aType: string, capture: boolean): void;

    // Note, when frameloaders are swapped, also messageManagers are swapped.
    readonly messageManager: any;

    /**
     * Force a remote browser to recompute its dimension and screen position.
     */
    requestUpdatePosition(): void;

    /**
     * Force a TabStateFlush from native sessionStoreListeners.
     * Returns a promise that resolves when all session store data has been
     * flushed.
     */
    requestTabStateFlush(): Promise<void>;

    /**
     * Force Epoch update in native sessionStoreListeners.
     */
    requestEpochUpdate(aEpoch: number): void;

    /**
     * Request a session history update in native sessionStoreListeners.
     */
    requestSHistoryUpdate(): void;

    /**
     * Creates a print preview document in this frame, or updates the existing
     * print preview document with new print settings.
     *
     * @param aPrintSettings The print settings to use to layout the print
     *   preview document.
     * @param aSourceBrowsingContext Optionally, the browsing context that
     *   contains the document from which the print preview is to be generated,
     *   which must be in the same process as the browsing context of the frame
     *   loader itself.
     *
     *   This should only be passed on the first call.  It should not be passed
     *   for any subsequent calls that are made to update the existing print
     *   preview document with a new print settings object.
     * @return A Promise that resolves with a PrintPreviewSuccessInfo on success.
     */
    printPreview(aPrintSettings: any, aSourceBrowsingContext?: BrowsingContext): Promise<number>;

    /**
     * Inform the print preview document that we're done with it.
     */
    exitPrintPreview(): void;

    /**
     * The element which owns this frame loader.
     *
     * For example, if this is a frame loader for an <iframe>, this attribute
     * returns the iframe element.
     */
    readonly ownerElement?: Element;


    /**
     * Cached childID of the ContentParent owning the RemoteTab in this frame
     * loader. This can be used to obtain the childID after the RemoteTab died.
     */
    readonly childID: number;

    /**
     * Find out whether the owner content really is a mozbrowser. <xul:browser>
     * is not considered to be a mozbrowser frame.
     */
    readonly ownerIsMozBrowserFrame: boolean;

    /**
     * The last known width of the frame. Reading this property will not trigger
     * a reflow, and therefore may not reflect the current state of things. It
     * should only be used in asynchronous APIs where values are not guaranteed
     * to be up-to-date when received.
     */
    readonly lazyWidth: number;

    /**
     * The last known height of the frame. Reading this property will not trigger
     * a reflow, and therefore may not reflect the current state of things. It
     * should only be used in asynchronous APIs where values are not guaranteed
     * to be up-to-date when received.
     */
    readonly lazyHeight: number;

    /**
     * Is `true` if the frameloader is dead (destroy has been called on it)
     */
    readonly isDead: boolean;
}
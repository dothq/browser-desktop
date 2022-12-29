/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChromeWindow } from "./ChromeWindow";

export interface nsILoadContext {
    /**
     * associatedWindow is the window with which the load is associated, if any.
     * Note that the load may be triggered by a document which is different from
     * the document in associatedWindow, and in fact the source of the load need
     * not be same-origin with the document in associatedWindow.  This attribute
     * may be null if there is no associated window.
     */
    readonly associatedWindow?: ChromeWindow;

    /**
     * topWindow is the top window which is of same type as associatedWindow.
     * This is equivalent to associatedWindow.top, but is provided here as a
     * convenience.  All the same caveats as associatedWindow of apply, of
     * course.  This attribute may be null if there is no associated window.
     */
    readonly topWindow: ChromeWindow;

    /**
     * topFrameElement is the <iframe>, <frame>, or <browser> element which
     * contains the topWindow with which the load is associated.
     *
     * Note that we may have a topFrameElement even when we don't have an
     * associatedWindow, if the topFrameElement's content lives out of process.
     * topFrameElement is available in single-process and multiprocess contexts.
     * Note that topFrameElement may be in chrome even when the nsILoadContext is
     * associated with content.
     */
    readonly topFrameElement: Element;

    /**
     * True if the load context is content (as opposed to chrome).  This is
     * determined based on the type of window the load is performed in, NOT based
     * on any URIs that might be around.
     */
    readonly isContent: boolean;

    /*
    * Attribute that determines if private browsing should be used. May not be
    * changed after a document has been loaded in this context.
    */
    usePrivateBrowsing: boolean;

    /**
    * Attribute that determines if remote (out-of-process) tabs should be used.
    */
    readonly useRemoteTabs: boolean;

    /**
    * Determines if out-of-process iframes should be used.
    */
    readonly useRemoteSubframes: boolean;

    /*
    * Attribute that determines if tracking protection should be used. May not be
    * changed after a document has been loaded in this context.
    */
    useTrackingProtection: boolean;
}
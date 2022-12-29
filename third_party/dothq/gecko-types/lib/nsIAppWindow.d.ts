/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "./BrowsingContext";
import { nsIDocShell } from "./nsIDocShell";
import { nsIXULBrowserWindow } from "./nsIXULBrowserWindow";

export interface nsIAppWindow {
    readonly docShell: nsIDocShell;

    /**
     * Indicates if this window is instrinsically sized.
     */
    intrinsicallySized: boolean;
  
    /**
     * The primary content shell.
     *
     * Note that this is a docshell tree item and therefore can not be assured of
     * what object it is. It could be an editor, a docshell, or a browser object.
     * Or down the road any other object that supports being a DocShellTreeItem
     * Query accordingly to determine the capabilities.
     */
    readonly primaryContentShell: any;
  
    /**
     * In multiprocess case we may not have primaryContentShell but
     * primaryRemoteTab.
     */
    readonly primaryRemoteTab: any;
  
    /**
     * Helper for getting the BrowsingContext from either `primaryContentShell` or
     * `primaryRemoteTab` depending on which is available.
     */
    readonly primaryContentBrowsingContext: BrowsingContext;
  
    remoteTabAdded(tab: any, aPrimary: boolean): void;
    remoteTabRemoved(aTab: any): void;
  
    getLiveResizeListeners(): [];
  
    /**
     * Tell this window that it has picked up a child XUL window
     * @param aChild the child window being added
     */
    addChildWindow(child: nsIAppWindow): void;
  
    /**
     * Returns the difference between the inner window size (client size) and the
     * outer window size, in CSS pixels.
     */
    readonly outerToInnerHeightDifferenceInCSSPixels: number;
    readonlyouterToInnerWidthDifferenceInCSSPixels: number;
  
    /**
     * Tell this window that it has lost a child XUL window
     * @param aChild the child window being removed
     */
    removeChildWindow(child: nsIAppWindow): void;
  
    /**
     * Move the window to a centered position.
     * @param aRelative If not null, the window relative to which the window is
     *                  moved. See aScreen parameter for details.
     * @param aScreen   PR_TRUE to center the window relative to the screen
     *                  containing aRelative if aRelative is not null. If
     *                  aRelative is null then relative to the screen of the
     *                  opener window if it was initialized by passing it to
     *                  nsWebShellWindow::Initialize. Failing that relative to
     *                  the main screen.
     *                  PR_FALSE to center it relative to aRelative itself.
     * @param aAlert    PR_TRUE to move the window to an alert position,
     *                  generally centered horizontally and 1/3 down from the top.
     */
    center(relative: nsIAppWindow, screen: boolean, alert: boolean): void;
  
    /**
     * Shows the window as a modal window. That is, ensures that it is visible
     * and runs a local event loop, exiting only once the window has been closed.
     */
    showModal(): void;
  
    /**
     * Locks the aspect ratio for a window.
     * @param aShouldLock boolean
     */
    lockAspectRatio(shouldLock: boolean): void;
  
    readonly lowestZ: number;
    readonly loweredZ: number;  /* "alwaysLowered" attribute */
    readonly normalZ: number;
    readonly raisedZ: number;   /* "alwaysRaised" attribute */
    readonly highestZ: number;
  
    zLevel: boolean;
  
    chromeFlags: number;
  
    /**
     * Begin assuming |chromeFlags| don't change hereafter, and assert
     * if they do change.  The state change is one-way and idempotent.
     */
    assumeChromeFlagsAreFrozen(): void;
  
    /**
     * Create a new window.
     * @param aChromeFlags see nsIWebBrowserChrome
     * @param aOpenWindowInfo information about the request for a content window
     *                        to be opened. Will be null for non-content loads.
     * @return the newly minted window
     */
    createNewWindow(chromeFlags: number,
                                 aOpenWindowInfo: any);
  
    XULBrowserWindow: nsIXULBrowserWindow;
  
    /**
     * Back-door method to make sure some stuff is done when the document is
     * ready for layout, that would cause expensive computation otherwise later.
     *
     * Do NOT call this unless you know what you're doing!  In particular,
     * calling this when this XUL window doesn't yet have a document in its
     * docshell could cause problems.
     */
    beforeStartLayout(): void;
  
    /**
     * Given the dimensions of some content area held within this
     * XUL window, and assuming that that content area will change
     * its dimensions in linear proportion to the dimensions of this
     * XUL window, changes the size of the XUL window so that the
     * content area reaches a particular size.
     *
     * We need to supply the content area dimensions because sometimes
     * the child's nsDocShellTreeOwner needs to propagate a SizeShellTo
     * call to the parent. But the shellItem argument of the call will
     * not be available on the parent side.
     *
     * Note: this is an internal method, other consumers should never call this.
     *
     * @param aDesiredWidth
     *        The desired width of the content area in device pixels.
     * @param aDesiredHeight
     *        The desired height of the content area in device pixels.
     * @param shellItemWidth
     *        The current width of the content area.
     * @param shellItemHeight
     *        The current height of the content area.
     */
    sizeShellToWithLimit(aDesiredWidth: number,
                            aDesiredHeight: number,
                            shellItemWidth: number,
                            shellItemHeight: number): void;
  
    /**
     * If the window was opened as a content window, this will return the initial
     * nsIOpenWindowInfo to use.
     */
    readonly initialOpenWindowInfo: any;
  
    /**
     * Request fast snapshot at RenderCompositor of WebRender.
     * Since readback of Windows DirectComposition is very slow.
     */
    needFastSnaphot(): void;
}
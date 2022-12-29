/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "./BrowsingContext";
import { JSActor } from "./JSActor";
import { nsIDocShell } from "./nsIDocShell";
import { WindowGlobalChild } from "./WindowGlobalChild";

/**
 * An actor architecture designed to allow compositional parent/content
 * communications. The lifetime of a JSWindowActor{Child, Parent} is the `WindowGlobalParent`
 * (for the parent-side) / `WindowGlobalChild` (for the child-side).
 *
 * See https://firefox-source-docs.mozilla.org/dom/ipc/jsactors.html for
 * more details on how to use this architecture.
 */
export class JSWindowActorChild extends JSActor {
    /**
     * Actor initialization occurs after the constructor is called but before the
     * first message is delivered. Until the actor is initialized, accesses to
     * manager will fail.
     */
    readonly manager?: WindowGlobalChild;

    /**
     * The WindowContext associated with this JSWindowActorChild. Until the actor
     * is initialized, accesses to windowContext will fail.
     */
    readonly windowContext?: any;

    readonly document?: Document;

    readonly browsingContext?: BrowsingContext;

    readonly docShell?: nsIDocShell;

    /**
     * NOTE: As this returns a window proxy, it may not be currently referencing
     * the document associated with this JSWindowActor. Generally prefer using
     * `document`.
     */
    readonly contentWindow?: Window;
}
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "./BrowsingContext";
import { JSActor } from "./JSActor";
import { WindowGlobalParent } from "./WindowGlobalParent";

/**
 * An actor architecture designed to allow compositional parent/content
 * communications. The lifetime of a JSWindowActor{Child, Parent} is the `WindowGlobalParent`
 * (for the parent-side) / `WindowGlobalChild` (for the child-side).
 *
 * See https://firefox-source-docs.mozilla.org/dom/ipc/jsactors.html for
 * more details on how to use this architecture.
 */
export class JSWindowActorParent extends JSActor {
    /**
     * Actor initialization occurs after the constructor is called but before the
     * first message is delivered. Until the actor is initialized, accesses to
     * manager will fail.
     */
    readonly manager?: WindowGlobalParent;

    /**
     * The WindowContext associated with this JSWindowActorParent. For
     * JSWindowActorParent this is identical to `manager`, but is also exposed as
     * `windowContext` for consistency with `JSWindowActorChild`. Until the actor
     * is initialized, accesses to windowContext will fail.
     */
    readonly windowContext?: any;

    readonly browsingContext?: BrowsingContext;
}
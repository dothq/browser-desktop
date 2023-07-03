/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "./BrowsingContext";
import { JSWindowActorChild } from "./JSWindowActorChild";
import { WindowGlobalParent } from "./WindowGlobalParent";

export interface WindowGlobalChildInstance {
	readonly isClosed: boolean;
	readonly isInProcess: boolean;
	readonly browsingContext: BrowsingContext;
	readonly windowContext: any;

	readonly isCurrentGlobal: boolean;

	readonly innerWindowId: number;
	readonly outerWindowId: number;
	readonly contentParentId: number;

	// A WindowGlobalChild is the root in its process if it has no parent, or its
	// embedder is in a different process.
	readonly isProcessRoot: boolean;

	// Is this WindowGlobalChild same-origin with `window.top`?
	readonly sameOriginWithTop: boolean;

	readonly parentActor?: WindowGlobalParent; // in-process only

	/**
	 * Get or create the JSWindowActor with the given name.
	 *
	 * See WindowActorOptions from JSWindowActor.webidl for details on how to
	 * customize actor creation.
	 */
	getActor(name: string): JSWindowActorChild;
	getExistingActor(name: string): JSWindowActorChild | null;
}

export interface WindowGlobalChild {
	new (): WindowGlobalChildInstance;

	getByInnerWindowId(
		innerWindowId: number
	): WindowGlobalChild | null;
}

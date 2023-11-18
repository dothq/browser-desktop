/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {CustomEvent<{}> & { detail: { id: string; args?: T }, target: BrowserCustomizableArea }} ActionDispatchEvent
 * @template T
 */

export class Action {
	static id = "";

	/**
	 * The ID of this action
	 */
	get id() {
		return /** @type {typeof Action} */ (this.constructor).id;
	}

	/**
	 * The name of this action
	 */
	get name() {
		return this.id;
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{}>} event
	 */
	run(event) {}

	constructor() {}
}

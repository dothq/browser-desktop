/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionsIPC } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsIPC.sys.mjs"
);

/**
 * @typedef {import("components/actions/Action.sys.mjs").ActionDispatchEvent<T>} ActionDispatchEvent
 * @template T
 */

export class ActionsReceiver extends ActionsIPC {
	/**
	 * Handles incoming action dispatch events
	 * @param {ActionDispatchEvent<{}>} event
	 */
	handleActionDispatch(event) {
		const { id, args } = event.detail;

		const win = event.target.ownerGlobal;
		const gDot = win.gDot;

		const action = gDot.actions.getActionByID(id);

		try {
			const actionInstance = new action();

			actionInstance.run.call(actionInstance, event);
		} catch (e) {
			throw new Error(
				`${this.constructor.name} (${this.area.tagName}): Error occurred during execution of action '${id}':\n` +
					e
			);
		}
	}

	/**
	 * Handles incoming actions events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case this.ACTIONS_DISPATCH_EVENT:
				this.handleActionDispatch(
					/** @type {ActionDispatchEvent<{}>} */ (event)
				);
				break;
		}
	}

	/**
	 *
	 * @param {BrowserCustomizableArea} area
	 */
	constructor(area) {
		super(area);

		area.addEventListener(this.ACTIONS_DISPATCH_EVENT, this);
	}
}

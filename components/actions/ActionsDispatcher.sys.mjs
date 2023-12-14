/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionsIPC } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsIPC.sys.mjs"
);

export class ActionsDispatcher extends ActionsIPC {
	/**
	 * Performs an action
	 * @param {string} actionId
	 * @param {Record<string, any>} [actionArgs]
	 */
	run(actionId, actionArgs) {
		const event = new CustomEvent(this.ACTIONS_DISPATCH_EVENT, {
			detail: {
				id: actionId,
				args: actionArgs || {}
			}
		});

		this.area.dispatchEvent(event);
	}

	/**
	 * @param {BrowserCustomizableArea} area
	 */
	constructor(area) {
		super(area);
	}
}

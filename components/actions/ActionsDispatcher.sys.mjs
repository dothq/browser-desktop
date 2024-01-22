/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionsIPC } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsIPC.sys.mjs"
);

const { ActionsMessenger } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsMessenger.sys.mjs"
);

export class ActionsDispatcher extends ActionsIPC {
	/**
	 * Performs an action
	 * @template [T=any]
	 * @param {string} actionId
	 * @param {Record<string, any>} [actionArgs]
	 * @returns {Promise<T>}
	 */
	async run(actionId, actionArgs) {
		if (!this.area.actionsReceiver) {
			throw new Error(
				`Aborting action '${actionId}' dispatch as receiver not registered on ${this.area.constructor.name} (${this.area.tagName}).`
			);
		}

		const { event, messageId } = this.messenger.createEventMessage(
			this.ACTIONS_DISPATCH_EVENT,
			{
				id: actionId,
				args: actionArgs || {}
			}
		);

		this.area.dispatchEvent(event);

		return await this.messenger.awaitCorrespondence(messageId);
	}

	/**
	 * @param {typeof ActionsMessenger["prototype"]} messenger
	 * @param {ReturnType<typeof BrowserCustomizableContextMixin<typeof Element>>["prototype"]} area
	 */
	constructor(messenger, area) {
		super(area);

		this.messenger = messenger;
	}
}

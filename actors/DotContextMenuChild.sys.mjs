/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ContentDOMReference } = ChromeUtils.importESModule(
	"resource://gre/modules/ContentDOMReference.sys.mjs"
);

export class DotContextMenuChild extends JSWindowActorChild {
	/**
	 * @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument} message
	 */
	receiveMessage(message) {
		const { targetIdentifier } = message.data;

		switch (message.name) {
			case "ContextMenu:ReloadFrame": {
				const { forceReload } = message.data;

				const target = ContentDOMReference.resolve(targetIdentifier);

				/** @type {any} */ (target.ownerDocument.location).reload(
					forceReload
				);
				break;
			}
		}
	}

	/**
	 * Creates a new context menu context object from an event
	 * @param {MouseEvent} event
	 */
	_createContext(event) {
		return {};
	}

	/**
	 * Receives incoming contextmenu events
	 * @param {MouseEvent} event
	 */
	async handleEvent(event) {
		const context = this._createContext(event);

		this.sendAsyncMessage("contextmenu", {
			x: event.screenX,
			y: event.screenY,

			context
		});
	}
}

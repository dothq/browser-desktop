/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at http://mozilla.org/MPL/2.0/. */

export class DotContextMenuParent extends JSWindowActorParent {
	/** @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument<>} message  */
	receiveMessage(message) {
		if (message.name !== "contextmenu") return;

		const browser = this.manager.rootFrameLoader.ownerElement;
		const win = browser.ownerGlobal.top;

		const { x, y, context } = message.data;

		const panel = win.gDot.panels.getPanelById("browser-context-menu");

		panel.openPanel({
			coordMode: "screen",

			x: x,
			y: y,

			args: context
		});
	}

	hiding() {
		try {
			this.sendAsyncMessage("ContextMenu:Hiding", {});
		} catch (e) {
			// This will throw if the content goes away while the
			// context menu is still open.
		}
	}
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at http://mozilla.org/MPL/2.0/. */

export class DotContextMenuParent extends JSWindowActorParent {
	/** @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument<>} message  */
	receiveMessage(message) {
		if (message.name !== "contextmenu") return;

		const browser = this.manager.rootFrameLoader.ownerElement;
		const win = browser.ownerGlobal;

		// Make sure this browser belongs to us before we open the panel
		if (win.gDot && win.gDot.tabs.getTabForWebContents(browser)) {
			const { x, y, context } = message.data;

			console.log(x, y, context);
		}
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at http://mozilla.org/MPL/2.0/. */

export class ContextMenuParent extends JSWindowActorParent {
	receiveMessage(message) {
		if (message.name !== "contextmenu") return;

		let browser = this.manager.rootFrameLoader.ownerElement;
		let win = browser.ownerGlobal.top;

		console.log(message, browser, win);
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

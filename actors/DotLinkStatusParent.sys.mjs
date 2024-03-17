/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class LinkStatusParent extends JSWindowActorParent {
	/**
	 *
	 * @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument} msg
	 */
	receiveMessage(msg) {
		if (msg.name !== "LinkStatus:OverLink") return;

		const { href } = msg.data;

		const browser = this.manager.browsingContext.top.embedderElement;
		const win = browser.ownerGlobal;

		if (!win.gDot) return;

		const tab = win.gDot.tabs?.getTabForWebContents(browser);

		if (tab) {
			win.gDot.status.setTabStatus(tab, "overLink", href);
		} else {
			win.gDot.status.setStatus("overLink", href);
		}
	}
}

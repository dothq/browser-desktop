/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { setTimeout, clearTimeout } = ChromeUtils.importESModule(
	"resource://gre/modules/Timer.sys.mjs"
);

const { BrowserUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserUtils.sys.mjs"
);

export class LinkStatusChild extends JSWindowActorChild {
	/**
	 * The current mouseover href
	 */
	_currentHref = null;

	/**
	 * The timer before a mouseout event should clear the status
	 */
	_clearStatusInt = null;

	/**
	 * Handles the over link status
	 * @param {string} href
	 */
	handleOverLink(href) {
		// Prevent duplicate mouseover events from the
		// same href firing multiple overLink events.
		if (href && this._currentHref == href) return;

		this.sendAsyncMessage("LinkStatus:OverLink", {
			href
		});

		this._currentHref = href;
	}

	/**
	 * Handles incoming events to the LinkStatus actor
	 * @param {Event} event
	 */
	handleEvent(event) {
		clearTimeout(this._clearStatusInt);

		const [href, linkNode] =
			BrowserUtils.hrefAndLinkNodeForClickEvent(event);

		switch (event.type) {
			case "mousemove":
				this.handleOverLink(href);
				break;
			case "mouseout":
				if (linkNode) {
					// Clearing the overLink right after receiving `mouseout` is a bad idea.
					//
					// We rely on `mouseout` for determining if the mouse left the region
					// of a link (for example tabbing out of the window, but leaving the cursor in the same position).
					//
					// Therefore, adding a timer allows us to bypass clearing overLink
					// straight away, if the user happened to move their mouse between
					// two links, giving `mousemove` enough time to re-update the href
					// before `mouseout` can clear it.
					this._clearStatusInt = setTimeout(() => {
						this.handleOverLink(null);
					}, 10);
				}
				break;
		}
	}
}

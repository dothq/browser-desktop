/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class DotUAStylesChild extends JSWindowActorChild {
	/**
	 * Loads a stylesheet into the browser frame
	 * @param {string} uri
	 */
	loadSheet(uri) {
		const { windowUtils } = this.contentWindow;

		try {
			windowUtils.loadSheetUsingURIString(uri, windowUtils.AGENT_SHEET);
		} catch (e) {}
	}

	init() {
		this.loadSheet("chrome://dot/skin/tooltip.css");
	}

	handleEvent(event) {
		switch (event.type) {
			case "DOMDocElementInserted":
			case "DOMContentLoaded":
				this.init();
				break;
		}
	}
}

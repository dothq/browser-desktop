/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserPanel } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserPanel.sys.mjs"
);

export class BrowserPanels {
	/** @type {Window} */
	#win = null;

	/** @type {Map<string, BrowserPanel>} */
	#panels = new Map();

	/**
	 * An array of visible browser panels
	 */
	get visiblePanels() {
		return Array.from(this.#panels.values()).filter((p) => p.isVisible);
	}

	constructor(win) {
		this.#win = win;
	}
}

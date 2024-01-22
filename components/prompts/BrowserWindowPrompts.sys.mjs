/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserPromptManager } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserPromptManager.sys.mjs"
);

export class BrowserWindowPrompts extends BrowserPromptManager {
	/**
	 * Opens the window prompt
	 * @param {Object} args
	 */
	open(args) {
		// const { win, uri, features, bag } = this.getPromptData(args);
		// Services.ww.openWindow(
		// 	win || Services.ww.activeWindow,
		// 	uri,
		// 	"_blank",
		// 	features,
		// 	bag
		// );
		// return this.getReturnValue(args, bag);
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		super(win);
	}
}

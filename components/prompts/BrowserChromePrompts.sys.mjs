/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserPromptManager } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserPromptManager.sys.mjs"
);

export class BrowserChromePrompts extends BrowserPromptManager {
	/**
	 * Opens the chrome prompt
	 * @param {Object} args
	 */
	async open(args) {
		// const { uri, features, bag } = this.getPromptData(args);
		// const prompt = await this.createSubprompt();
		// const target = prompt.getAttribute("name");
		// this.win.openDialog(this.win, uri, target, features, bag);
		// return this.getReturnValue(args, bag);
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		super(win);
	}
}

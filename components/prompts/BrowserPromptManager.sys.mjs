/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { PromptUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/PromptUtils.sys.mjs"
);

export class BrowserPromptManager {
	COMMON_DIALOG = "chrome://global/content/commonDialog.xhtml";
	SELECT_DIALOG = "chrome://global/content/selectDialog.xhtml";

	/** @type {Window} */
	win = null;

	/**
	 * Obtains prompt data for given prompt arguments
	 * @param {Object} args
	 * @param {number} args.modalType
	 * @param {"alert" | "confirm" | "select"} args.promptType
	 */
	getPromptData(args) {
		const uri =
			args.promptType == "select"
				? this.SELECT_DIALOG
				: this.COMMON_DIALOG;

		const bag = PromptUtils.objectToPropBag(args);

		const features = "centerscreen,chrome,modal,titlebar";

		return {
			uri,
			features,
			bag
		};
	}

	/**
	 * Creates a new subprompt component
	 */
	async createSubprompt() {
		const browser = this.win.document.createXULElement("browser");

		const promptName = `subprompt-frame-${Services.uuid
			.generateUUID()
			.toString()}`;

		browser.setAttribute("name", promptName);
		browser.setAttribute("disablehistory", "true");
		browser.setAttribute("autoscroll", "false");

		Object.assign(browser.style, {
			width: "100%",
			height: "600px",
			backgroundColor: "white"
		});

		this.win.document.body.appendChild(browser);

		return browser;
	}

	/**
	 * Obtains the return value from a prompt's prop bag
	 * @param {object} args
	 * @param {any} bag
	 */
	getReturnValue(args, bag) {
		const outArgs = args;

		PromptUtils.propBagToObject(bag, outArgs);

		return outArgs;
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.win = win;
	}
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserWindowPrompts } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserWindowPrompts.sys.mjs"
);

const { BrowserContentPrompts } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserContentPrompts.sys.mjs"
);

const { BrowserChromePrompts } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserChromePrompts.sys.mjs"
);

const { PromptUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/PromptUtils.sys.mjs"
);

const {
	MODAL_TYPE_CONTENT,
	MODAL_TYPE_TAB,
	MODAL_TYPE_WINDOW,
	MODAL_TYPE_INTERNAL_WINDOW
} = Ci.nsIPrompt;

export class PromptParent extends JSWindowActorParent {
	/**
	 * Fetches the nearest chrome window
	 * @returns {ChromeWindow}
	 */
	#getChromeWindow() {
		const browsingContext = this.browsingContext.top;
		const browser = browsingContext.embedderElement;

		if (!browsingContext.isContent && browsingContext.window) {
			return /** @type {ChromeWindow} */ (browsingContext.window);
		} else {
			return browser?.ownerGlobal;
		}
	}

	/**
	 * Launches a prompt in the content prompt frame
	 * @param {Object} args
	 * @param {number} args.modalType
	 */
	async #openContentPrompt(args) {
		const win = this.#getChromeWindow();
		const prompter = new BrowserContentPrompts(win);

		return await prompter.open(args);
	}

	/**
	 * Launches a prompt in a native window
	 * @param {Object} args
	 * @param {number} args.modalType
	 */
	async #openWindowPrompt(args) {
		const win = this.#getChromeWindow();
		const prompter = new BrowserWindowPrompts(win);

		return await prompter.open(args);
	}

	/**
	 * Launches a prompt in the browser chrome
	 * @param {Object} args
	 * @param {number} args.modalType
	 */
	async #openChromePrompt(args) {
		const win = this.#getChromeWindow();
		const prompter = new BrowserChromePrompts(win);

		return await prompter.open(args);
	}

	/**
	 * Launches a prompt
	 * @param {Object} args
	 * @param {number} args.modalType
	 */
	async #openPrompt(args) {
		switch (args.modalType) {
			case MODAL_TYPE_CONTENT:
			case MODAL_TYPE_TAB:
				return await this.#openContentPrompt(args);
			case MODAL_TYPE_WINDOW:
				return await this.#openWindowPrompt(args);
			case MODAL_TYPE_INTERNAL_WINDOW:
				return await this.#openChromePrompt(args);
			default:
				throw new Error(
					`Prompt: #openPrompt(): Unhandled modal type '${args.modalType}'!`
				);
		}
	}

	/**
	 * Receive a message
	 * @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument} message
	 */
	async receiveMessage(message) {
		const args = message.data;
		const id = args._remoteId;

		console.log(args);

		switch (message.name) {
			case "Prompt:Open":
				if (!this.windowContext.isCurrentGlobal) {
					return undefined;
				}

				return await this.#openPrompt(args);
		}

		return undefined;
	}
}

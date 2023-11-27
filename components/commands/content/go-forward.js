/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class GoForwardCommand extends TabCommand {
	constructor(subscription, area) {
		super(subscription, area);

		this.label = "Forward";
		this.labelAuxiliary = "Go forwards one page";
		this.icon = "arrow-right";
		this.disabled = !this.context.browser.canGoForward;
	}

	/**
	 * Performs this command
	 *
	 * @param {{}} args
	 */
	run(args) {
		this.actions.run("browser.tabs.go_forward", { tab: this.context.tab });
	}

	/**
	 * Fired when the state changes the browser in context
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 */
	onContextualBrowserStateChanged({ browser }) {
		this.disabled = !browser.canGoForward;
	}
}

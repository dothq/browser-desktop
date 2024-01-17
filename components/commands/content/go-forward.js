/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class GoForwardCommand extends TabCommand {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = "Forward";
		this.labelAuxiliary = "Go forwards one page";
		this.icon = "arrow-right";

		this.update();
	}

	/**
	 * Update the disabled state of the go forward command
	 */
	update() {
		this.disabled = !this.context.browser.canGoForward;
	}

	/**
	 * Fired when the state changes the browser in context
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 */
	onContextualBrowserStateChanged({ browser }) {
		this.update();
	}

	/**
	 * Fired when the location changes the browser in context
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 */
	onContextualBrowserLocationChanged({ browser }) {
		this.update();
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent<{}>} event
	 */
	on_command(event) {
		this.actions.run("browser.tabs.go_forward", { tab: this.context.tab });
	}
}

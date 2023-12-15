/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

const { StartPage } = ChromeUtils.importESModule(
	"resource:///modules/StartPage.sys.mjs"
);

export class AddTabCommand extends Command {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = "New Tab";
		this.labelAuxiliary = "Open a new tab";
		this.icon = "add";
	}

	/**
	 * Fired when the command is performed
	 *
	 * @param {import("../Command.sys.mjs").CommandEvent<{}>} event
	 */
	on_command(event) {
		const urls = StartPage.getHomePage();

		for (const url of urls) {
			this.actions.run("browser.tabs.open", { where: "tab", url });
		}
	}
}

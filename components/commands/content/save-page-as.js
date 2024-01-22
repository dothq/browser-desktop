/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

export class SavePageAsCommand extends Command {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = "Save page as…";
		this.icon = {
			[this.audiences.DEFAULT]: "save",
			[this.audiences.PANEL]: ""
		};
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent} event
	 */
	on_command(event) {
		this.actions.run("browser.tabs.save_page", {
			tab: this.context.tab
		});
	}
}

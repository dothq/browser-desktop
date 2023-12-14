/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class CloseTabCommand extends TabCommand {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = {
			[this.audiences.DEFAULT]: "Close",
			[this.audiences.TAB]: "Close tab"
		};
		this.labelAuxiliary = {
			[this.audiences.DEFAULT]: "Close current tab",
			[this.audiences.TAB]: "Close tab"
		};
		this.icon = "close";
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent<{}>} event
	 */
	on_command(event) {
		this.actions.run("browser.tabs.close_tab", {
			tab: this.context.tab
		});
	}
}

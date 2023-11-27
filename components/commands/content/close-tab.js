/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class CloseTabCommand extends TabCommand {
	constructor(subscription, area) {
		super(subscription, area);

		this.label = {
			root: "Close",
			tab: "Close tab"
		};
		this.labelAuxiliary = {
			root: "Close current tab",
			tab: "Close tab"
		};
		this.icon = "close";
	}

	/**
	 * Performs this command
	 *
	 * @param {{}} args
	 */
	run(args) {
		this.actions.run("browser.tabs.close_tab", {
			tab: this.context.tab
		});
	}
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class InspectCommand extends TabCommand {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = "Inspect";
		this.labelAuxiliary = {
			[this.audiences.DEFAULT]: "Inspect this page",
			[this.audiences.PANEL]: "Inspect"
		};
		this.icon = "inspect";
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent} event
	 */
	on_command(event) {
		this.actions.run("browser.developer.inspect", {
			tab: this.context.tab
		});
	}
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

export class GeckoCommand extends Command {
	geckoCommandId = "";

	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);
	}

	/**
	 * The Gecko command controller for the specified geckoCommandId
	 */
	get commandController() {
		return this.context?.window?.document?.commandDispatcher.getControllerForCommand(
			this.geckoCommandId
		);
	}

	/**
	 * Fired when the command is performed
	 * @param {import("./Command.sys.mjs").CommandEvent<{}>} event
	 */
	on_command(event) {
		this.actions.run("browser.content.command", {
			command: this.geckoCommandId
		});
	}
}

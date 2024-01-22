/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

export class CustomizableUIAreaShowOverflowingCommand extends Command {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = "Show more…";
		this.icon = "chevron-right";
	}

	/**
	 * Fired when the command is performed
	 *
	 * @param {import("../../../Command.sys.mjs").CommandEvent} event
	 */
	on_command(event) {
		// By default, the type of host is going to be a generic customizable area,
		// however, we need access to the overflowable-only properties for this command
		const area = /** @type {BrowserCustomizableOverflowableArea} */ (
			event.target.host
		);

		const menuitems = [];

		for (const [child] of area.overflowingItems) {
			menuitems.push(child.cloneNode(true));
		}

		console.log("Overflowing items", menuitems);
	}
}

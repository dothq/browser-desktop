/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { GeckoCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/GeckoCommand.sys.mjs"
);

export class PasteCommand extends GeckoCommand {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.geckoCommandId = "cmd_paste";

		this.label = "Paste";
		this.icon = "paste";
	}
}

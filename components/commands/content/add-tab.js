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
	constructor(subscription, area) {
		super(subscription, area);

		this.label = "New Tab";
		this.label_auxiliary = "Open a new tab";
		this.icon = "add";
	}

	/**
	 * Performs this command
	 *
	 * @param {{ urls?: string[], url?: string }} args
	 */
	run(args) {
		let urls = [];

		if (args.url || args.urls) {
			if (args.url) urls.push(args.url);

			urls = urls.concat(args.urls || []);
		} else {
			urls = StartPage.getHomePage();
		}

		for (const url of urls) {
			this.actions.run("browser.tabs.add_tab", { url });
		}
	}
}

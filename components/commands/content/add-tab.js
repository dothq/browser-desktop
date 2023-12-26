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

		this._update();
	}

	/**
	 * Updates the look of the add tab command
	 */
	_update() {
		const { commandArgs: args } = this.subscriber;

		let label = "New Tab";
		let labelAuxiliary = "Open a new tab";
		let icon = "add";

		if (args && args.url) {
			label = Array.isArray(args.url)
				? `${args.url.length} tabs`
				: args.url;

			labelAuxiliary = Array.isArray(args.url)
				? `Open ${args.url.length} tabs`
				: `Open ${args.url} in a new tab`;

			if (Array.isArray(args.url)) {
				label = `${args.url.length} tabs`;
				labelAuxiliary = `Open ${args.url.length} tabs`;
				icon = "globe";
			} else {
				label = args.url;
				labelAuxiliary = `Open ${args.url} in a new tab`;
				icon = `page-icon:${args.url}`;
			}
		}

		this.label = label;
		this.labelAuxiliary = labelAuxiliary;
		this.icon = icon;
	}

	/**
	 * Formats the URIs into a pretty string
	 * @param {string | string[]} url
	 */
	_formatURIs(url) {
		const formatter = new Intl.ListFormat(undefined, {
			style: "short",
			type: "unit"
		});

		const uris = (Array.isArray(url) ? url : [url]).map(
			(uri) =>
				Services.io.createExposableURI(Services.io.newURI(uri)).spec
		);

		return formatter.format(uris);
	}

	/**
	 * Fired when an attribute on the subscriber is updated
	 * @param {CustomEvent} event
	 */
	on_attributeupdate(event) {
		switch (event.detail.name) {
			case "commandargs":
				this._update();
				break;
		}
	}

	/**
	 * Fired when the mouse is over the command subscriber
	 * @param {MouseEvent} event
	 */
	on_mouseover(event) {
		const { commandArgs: args } = this.subscriber;

		if (args && args.url) {
			this.window.XULBrowserWindow.setOverLink(
				this._formatURIs(args.url)
			);
		}
	}

	/**
	 * Fired when the mouse leaves the command subscriber
	 * @param {MouseEvent} event
	 */
	on_mouseleave(event) {
		this.window.XULBrowserWindow.setOverLink("");
	}

	/**
	 * Fired when the command is performed
	 *
	 * @param {import("../Command.sys.mjs").CommandEvent<{ where?: string; url?: string | string[] }>} event
	 */
	on_command(event) {
		const { commandArgs: args } = event.target;

		let urls = [];
		let where = "tab";

		if (args && args.url) {
			if (Array.isArray(args.url)) {
				urls = args.url;
				where = "tab";
			} else {
				urls = [args.url];
				where = args.where || "tab";
			}
		} else {
			urls = StartPage.getHomePage();
			where = "tab";
		}

		for (const url of urls) {
			this.actions.run("browser.tabs.open", { where, url });
		}
	}
}

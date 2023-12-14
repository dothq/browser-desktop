/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class TabIdentityCommand extends TabCommand {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this._update(this.context.tab);

		this.context.window.addEventListener(
			"BrowserTabs::TabIdentityChanged",
			this.onTabIdentityChanged.bind(this),
			{
				signal: this.abortController.signal
			}
		);
	}

	/**
	 * Handle identity updates for a tab
	 * @param {BrowserTab} tab
	 */
	_update(tab) {
		const { type, label, icon, tooltip, mode } = tab.siteIdentity;

		this.label = {
			[this.audiences.DEFAULT]: "Site Info",
			[this.audiences.TAB]: label,
			[this.audiences.ADDRESSBAR]: label
		};

		this.labelAuxiliary = {
			[this.audiences.DEFAULT]: "Information about this site",
			[this.audiences.TAB]: tooltip,
			[this.audiences.ADDRESSBAR]: tooltip
		};

		this.icon = {
			[this.audiences.DEFAULT]: "info",
			[this.audiences.TAB]: icon,
			[this.audiences.ADDRESSBAR]: icon
		};

		this.mode = {
			[this.audiences.DEFAULT]: null,
			[this.audiences.TAB]: mode,
			[this.audiences.ADDRESSBAR]: mode
		};

		this.inert = {
			[this.audiences.DEFAULT]: false,
			[this.audiences.TAB]: type == "search",
			[this.audiences.ADDRESSBAR]: type == "search"
		};
	}

	/**
	 * Handles incoming tab identity changes
	 *
	 * @param {object} data
	 * @param {BrowserTab} data.tab
	 */
	onTabIdentityChanged({ tab }) {
		if (this.context.tab !== tab) return;

		this._update(tab);
	}

	/**
	 * Fired when the contextual tab is selected
	 * @param {BrowserTab} tab
	 */
	onContextualTabSelected(tab) {
		this._update(tab);
	}

	/**
	 * Fired when the state changes the browser in context
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 */
	onContextualBrowserStateChanged({ browser }) {
		// todo: how we get the tab from the browser could be improved
		this._update(this.window.gDot.tabs.getTabForWebContents(browser));
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent<{}>} event
	 */
	on_command(event) {
		this.actions.run("browser.panels.open", {
			id: "identity-panel",

			opener: event.target,
			anchor: "before after"
		});
	}
}

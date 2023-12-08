/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class TabIdentityCommand extends TabCommand {
	constructor(subscription, area) {
		super(subscription, area);

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
	 * Performs this command
	 *
	 * @param {{ opener: Element }} args
	 */
	run(args) {
		this.actions.run("browser.panels.open", {
			id: "identity-panel",

			opener: args.opener,
			anchor: "before after"
		});
	}

	/**
	 * Handle identity updates for a tab
	 * @param {BrowserTab} tab
	 */
	_update(tab) {
		const { type, label, icon, tooltip, mode } = tab.siteIdentity;

		this.label = {
			root: "Site Info",
			tab: label,
			addressbar: label
		};

		this.labelAuxiliary = {
			root: "Information about this site",
			tab: tooltip,
			addressbar: tooltip
		};

		this.icon = {
			root: "info",
			tab: icon,
			addressbar: icon
		};

		this.mode = {
			root: null,
			tab: mode,
			addressbar: mode
		};

		this.inert = {
			root: false,
			tab: type == "search",
			addressbar: type == "search"
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
}

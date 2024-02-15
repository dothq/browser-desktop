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
		const { siteIdentity } = tab;

		const type = siteIdentity.type || "";
		const label = siteIdentity.label || "";
		const icon = siteIdentity.icon || "";
		const tooltip = siteIdentity.tooltip || "";
		const mode = siteIdentity.mode || "";

		this.label = {
			[this.audiences.DEFAULT]: "Site Info",
			[this.audiences.TAB]: label,
			[this.audiences.URLBAR]: label
		};

		this.labelAuxiliary = {
			[this.audiences.DEFAULT]: "Information about this site",
			[this.audiences.TAB]: tooltip,
			[this.audiences.URLBAR]: tooltip
		};

		this.icon = {
			[this.audiences.DEFAULT]: "info",
			[this.audiences.TAB]: icon,
			[this.audiences.URLBAR]: icon
		};

		this.mode = {
			[this.audiences.DEFAULT]: null,
			[this.audiences.TAB]: null,
			[this.audiences.URLBAR]: mode
		};

		this.inert = {
			[this.audiences.DEFAULT]: false,
			[this.audiences.TAB]: type == "search",
			[this.audiences.URLBAR]: type == "search"
		};
	}

	/**
	 * Handles incoming tab identity changes
	 *
	 * @param {CustomEvent<{ tab: BrowserTab; }>} event
	 */
	onTabIdentityChanged(event) {
		const { tab } = event.detail;

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
	 * Opens the identity panel popup
	 * @param {Event} event
	 */
	_openPanel(event) {
		console.log("_openPanel");
	}

	/**
	 * Opens the site info popup
	 */
	_openSiteInfoPopup() {
		this.window.openDialog(
			"chrome://browser/content/pageinfo/pageInfo.xhtml",
			"",
			"chrome,toolbar,dialog=no,resizable",
			{ browser: this.context.browser }
		);
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent} event
	 */
	on_command(event) {
		// If the user held shift while activating the command
		// take them straight to the site info popup
		if (event.shiftKey) {
			this._openSiteInfoPopup();

			return;
		}

		switch (this.context.audience) {
			case this.audiences.PANEL:
				this._openSiteInfoPopup();
				break;
			default:
				this._openPanel(event);
				break;
		}
	}
}

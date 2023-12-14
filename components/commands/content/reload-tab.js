/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

var { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

export class ReloadTabCommand extends TabCommand {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = "Reload";
		this.icon = "reload";
	}

	_reloadTimer = null;

	_update() {
		this.label = this.isLoading ? "Stop" : "Reload";
		this.labelAuxiliary = {
			[this.audiences.DEFAULT]: this.isLoading
				? "Stop loading page"
				: "Reload current page",
			[this.audiences.TAB]: this.isLoading
				? "Stop loading this page"
				: "Reload this page"
		};
		this.icon = this.isLoading ? "close" : "reload";
	}

	/**
	 * Fired when the state changes a browser
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 * @param {nsIWebProgress} data.webProgress
	 * @param {nsIRequest} data.request
	 * @param {number} data.stateFlags
	 * @param {string} data.status
	 */
	onContextualBrowserStateChanged({
		browser,
		webProgress,
		request,
		stateFlags,
		status
	}) {
		if (browser != this.context.browser) return;

		const { STATE_START, STATE_IS_NETWORK, STATE_STOP } =
			Ci.nsIWebProgressListener;

		const shouldShowProgress = BrowserTabsUtils.shouldShowProgress(
			/** @type {nsIChannel} */ (request)
		);

		this.isLoading =
			webProgress.isTopLevel &&
			stateFlags & STATE_START &&
			stateFlags & STATE_IS_NETWORK &&
			shouldShowProgress;

		this._update();

		if (this.isLoading) {
			this.window.clearTimeout(this._reloadTimer);
			this._reloadTimer = null;

			this.disabled = false;
		} else if (webProgress.isTopLevel && !webProgress.isLoadingDocument) {
			if (this._reloadTimer) return;

			this.disabled = true;
			this._reloadTimer = this.window.setTimeout(
				() => {
					this.disabled = false;
				},
				650,
				this
			);
		}
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent<{}, MouseEvent>} event
	 */
	on_command(event) {
		const actionId = this.isLoading
			? "browser.tabs.stop_page"
			: "browser.tabs.reload_page";

		this.reloadClicked = actionId == "browser.tabs.reload_page";

		this.actions.run(actionId, {
			tab: this.context.tab,
			bypassCache: !!event.detail?.originalEvent?.shiftKey
		});
	}
}

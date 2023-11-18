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
	constructor(subscription, area) {
		super(subscription, area);

		this.label = "Reload";
		this.icon = "reload";
	}

	_reloadTimer = null;

	/**
	 * Performs this command
	 *
	 * @param {{ bypassCache?: boolean }} args
	 */
	run(args) {
		const actionId = this.isLoading
			? "browser.tabs.stop_page"
			: "browser.tabs.reload_page";

		this.reloadClicked = actionId == "browser.tabs.reload_page";

		this.actions.run(actionId, {
			tab: this.context.tab,
			bypassCache: args?.bypassCache
		});
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

		const { isTopLevel, isLoadingDocument } = webProgress;
		const shouldShowProgress = BrowserTabsUtils.shouldShowProgress(
			/** @type {nsIChannel} */ (request)
		);

		this.isLoading =
			isTopLevel &&
			stateFlags & STATE_START &&
			stateFlags & STATE_IS_NETWORK &&
			shouldShowProgress;

		// Clear the reload timer and make sure we aren't disabled
		if (this.isLoading) {
			this.window.clearTimeout(this._reloadTimer);
		}

		this.disabled = false;

		this.label = this.isLoading ? "Stop" : "Reload";
		this.label_auxiliary = this.isLoading
			? "Stop loading page"
			: "Reload current page";
		this.icon = this.isLoading ? "close" : "reload";

		// Only runs when the browser has successfully finished loaded the document
		if (
			this.reloadClicked &&
			isTopLevel &&
			stateFlags & STATE_STOP &&
			stateFlags & STATE_IS_NETWORK &&
			!isLoadingDocument &&
			Components.isSuccessCode(status) &&
			shouldShowProgress
		) {
			// Prevent accidental clicks to reload the page
			// after we have swapped from the stop state
			this.reloadClicked = false;
			this.disabled = true;

			this._reloadTimer = this.window.setTimeout(() => {
				this.disabled = false;
			}, 650);
		}
	}
}

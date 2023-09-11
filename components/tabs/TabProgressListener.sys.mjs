/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIWebProgress} nsIWebProgress
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIRequest} nsIRequest
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIChannel} nsIChannel
 */

function fireBrowserEvent(event, browser, data) {
	const evt = new CustomEvent(`BrowserTabs::${event}`, {
		detail: data
	});

	browser.dispatchEvent(evt);
}

/**
 * Increments the progress bar by a random amount
 * @param {BrowserTab} tab
 */
function incrementProgress(tab) {
	const newPercent = Math.floor(Math.random() * (10 - 2 + 1) + 2);

	if (tab.progressPercent + newPercent <= 70) {
		tab.progressPercent += newPercent;
	}
}

export class TabProgressListener {
	QueryInterface = ChromeUtils.generateQI(["nsIWebProgressListener"]);

	/**
	 * The tab attached to this progress listener
	 * @type {BrowserTab}
	 */
	tab = null;

	/**
	 * The browser element attached to this progress listener
	 * @type {ChromeBrowser}
	 */
	browser = null;

	/**
	 * The window attached to this progress listener
	 */
	get win() {
		return this.browser.ownerGlobal;
	}

	/**
	 * @param {BrowserTab} tab
	 * @param {ChromeBrowser} browser
	 */
	constructor(tab, browser) {
		this.tab = tab;
		this.browser = browser;
	}

	_burstInt = null;

	/**
	 * Fired when the status of the browser is updated
	 * @param {nsIWebProgress} webProgress
	 * @param {nsIRequest} request
	 * @param {number} status
	 * @param {string} message
	 */
	onStatusChange(webProgress, request, status, message) {
		console.log(
			"TabProgressListener::onStatusChange",
			webProgress,
			request,
			status,
			message
		);

		if (this.tab.progress == this.tab.TAB_PROGRESS_TRANSIT && message) {
			incrementProgress(this.tab);
		}

		fireBrowserEvent("BrowserStatusChange", this.browser, {
			webProgress,
			request,
			status,
			message,
			type: "busy"
		});
	}

	/**
	 * Fired when the location of the browser is changed
	 * @param {nsIWebProgress} webProgress
	 * @param {nsIRequest} request
	 * @param {nsIURI} locationURI
	 * @param {number} flags
	 * @param {boolean} isSimulated
	 */
	onLocationChange(webProgress, request, locationURI, flags, isSimulated) {
		const { LOCATION_CHANGE_SAME_DOCUMENT } = Ci.nsIWebProgressListener;

		const evt = new CustomEvent("BrowserTabs::LocationChange", {
			detail: {
				browser: this.browser,
				webProgress,
				request,
				locationURI,
				flags,
				isSimulated
			}
		});
		this.win.dispatchEvent(evt);

		// We only care about the top level location changes
		// Any changes to subframes should be ignored
		if (!webProgress.isTopLevel) return;

		const isSameDocument = !!(flags & LOCATION_CHANGE_SAME_DOCUMENT);

		if (!isSameDocument && webProgress.isLoadingDocument) {
			// Clears the cached iconURL
			this.browser.mIconURL = null;
		}

		console.log(
			"TabProgressListener::onLocationChange",
			webProgress,
			request,
			locationURI,
			flags,
			isSimulated
		);

		fireBrowserEvent("BrowserLocationChange", this.win, {
			browser: this.browser,
			webProgress,
			request,
			locationURI,
			flags,
			isSimulated
		});
	}

	/**
	 * Fired when the state of the browser changes
	 * @param {nsIWebProgress} webProgress
	 * @param {nsIRequest} request
	 * @param {number} stateFlags
	 * @param {number} status
	 */
	onStateChange(webProgress, request, stateFlags, status) {
		const { STATE_START, STATE_STOP, STATE_IS_NETWORK, STATE_RESTORING } =
			Ci.nsIWebProgressListener;
		const { TAB_PROGRESS_NONE, TAB_PROGRESS_BUSY } = this.tab;

		console.log(
			"TabProgressListener::onStateChange",
			webProgress,
			request,
			stateFlags,
			status
		);
		console.log("REMOTE_TYPE", this.browser.remoteType);

		const { clearTimeout, setTimeout } = this.win;

		if (stateFlags & STATE_START && stateFlags & STATE_IS_NETWORK) {
			if (
				BrowserTabsUtils.shouldShowProgress(
					/** @type {nsIChannel} */ (request)
				)
			) {
				if (
					webProgress &&
					webProgress.isTopLevel &&
					!(stateFlags & STATE_RESTORING)
				) {
					clearTimeout(this._burstInt);
					this.tab.progressPercent = 0;
					this.tab.progress = TAB_PROGRESS_BUSY;
					this.tab.progressPercent = 20;
					incrementProgress(this.tab);

					this.tab.updateLabel(this.tab._initialURI?.spec || "");
				}

				if (this.tab.selected) {
					this.win.gDot.tabs.isBusy = true;
				}
			}

			if (webProgress && webProgress.isTopLevel) {
				// Clear the tab icon
				if (
					this.win.gDot.tabs._isWebContentsBrowserElement(
						this.tab.webContents
					)
				) {
					/** @type {ChromeBrowser} */ (
						this.tab.webContents
					).mIconURL = null;
				}

				this.win.gDot.tabs.setIcon(this.tab, "");
				this.tab._initialURI = null;
			}
		} else if (stateFlags & STATE_STOP) {
			if (
				this.tab.progress &&
				BrowserTabsUtils.shouldShowProgress(
					/** @type {nsIChannel} */ (request)
				)
			) {
				this.tab.progressPercent = 100;

				clearTimeout(this._burstInt);
				this._burstInt = setTimeout(() => {
					this.tab.progress = TAB_PROGRESS_NONE;

					clearTimeout(this._burstInt);
					this._burstInt = setTimeout(() => {
						clearTimeout(this._burstInt);

						this.tab.progressPercent = 0;
					}, 300);
				}, 300);
			}

			this.tab.updateLabel("");
			this.tab.updateIcon(this.browser.mIconURL);

			// Clear the status as we're done loading
			fireBrowserEvent("BrowserStatusChange", this.browser, {
				message: "",
				type: "busy"
			});

			if (this.tab.selected) {
				this.win.gDot.tabs.isBusy = false;
			}
		}

		fireBrowserEvent("BrowserStateChange", this.win, {
			browser: this.browser,
			webProgress,
			request,
			stateFlags,
			status
		});
	}

	/**
	 * Fired when the progress of the browser changes
	 * @param {nsIWebProgress} webProgress
	 * @param {nsIRequest} request
	 * @param {number} curSelfProgress
	 * @param {number} maxSelfProgress
	 * @param {number} curTotalProgress
	 * @param {number} maxTotalProgress
	 */
	onProgressChange(
		webProgress,
		request,
		curSelfProgress,
		maxSelfProgress,
		curTotalProgress,
		maxTotalProgress
	) {
		const { TAB_PROGRESS_TRANSIT } = this.tab;

		const totalProgress = maxTotalProgress
			? curTotalProgress / maxTotalProgress
			: 0;

		if (
			!BrowserTabsUtils.shouldShowProgress(
				/** @type {nsIChannel} */ (request)
			)
		) {
			return;
		}

		if (totalProgress && this.tab.progress) {
			this.tab.progress = TAB_PROGRESS_TRANSIT;

			incrementProgress(this.tab);
		}

		console.log(
			curSelfProgress,
			maxSelfProgress,
			curTotalProgress,
			maxTotalProgress
		);

		if (curTotalProgress && maxTotalProgress) {
			this.tab.progressPercent =
				(curTotalProgress / maxTotalProgress) * 100;
		}
	}

	/**
	 * Fired when the security of a browser changes
	 * @param {nsIWebProgress} webProgress
	 * @param {nsIRequest} request
	 * @param {number} state
	 */
	onSecurityChange(webProgress, request, state) {
		console.log(
			"TabProgressListener::onSecurityChange",
			webProgress,
			request,
			state
		);

		fireBrowserEvent("BrowserSecurityChange", this.win, {
			browser: this.browser,
			webProgress,
			request,
			state
		});
	}
}

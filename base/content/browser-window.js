/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Trims a URL of its protocol
 * @param {string} url
 * @returns {string}
 */
function trimURL(url) {
	return url.replace(/^https?\:\/\//i, "");
}

/**
 * Handles communication between the engine to
 * receive events and pass them to their respective
 * locations.
 */
class nsIXULBrowserWindow {
	status = "";
	defaultStatus = "";
	overLink = "";
	startTime = 0;
	isBusy = false;
	busyUI = false;
	hideOverLinkImmediately = false;

	_state = null;
	_lastLocation = null;
	_event = null;
	_lastLocationForEvent = null;
	// _isSecureContext can change without the state/location changing, due to security
	// error pages that intercept certain loads. For example this happens sometimes
	// with the the HTTPS-Only Mode error page (more details in bug 1656027)
	_isSecureContext = null;

	_overlinkInt;

	QueryInterface = ChromeUtils.generateQI([
		"nsIWebProgressListener",
		"nsIWebProgressListener2",
		"nsISupportsWeakReference",
		"nsIXULBrowserWindow"
	]);

	// Stubbing stopCommand and reloadCommand so we can overlay our own
	// reload/stop implementation
	get stopCommand() {
		return document.createElement("div");
	}

	get reloadCommand() {
		return document.createElement("div");
	}

	/**
	 * @param {string} status
	 */
	setDefaultStatus(status) {
		this.defaultStatus = status;
	}

	/**
	 * Updates the over link statuspanel value
	 * @param {string} url
	 */
	setOverLink(url) {
		clearTimeout(this._overlinkInt);

		let overURL = url;

		if (url) {
			overURL = Services.textToSubURI.unEscapeURIForUI(url);

			// Encode bidirectional formatting characters.
			// (RFC 3987 sections 3.2 and 4.1 paragraph 6)
			overURL = overURL.replace(
				/[\u200e\u200f\u202a\u202b\u202c\u202d\u202e]/g,
				encodeURIComponent
			);

			if (Services.prefs.getBoolPref("browser.urlbar.trimURLs", true)) {
				overURL = trimURL(overURL);
			}
		}

		this._overlinkInt = setTimeout(() => {
			this.overLink = overURL;

			const evt = new CustomEvent("BrowserTabs::BrowserStatusChange", {
				detail: {
					message: overURL,
					type: "overLink"
				}
			});

			gDot.tabs.hoveredBrowser?.dispatchEvent(evt);
		}, 100);
	}

	/**
	 * Opens a tooltip at a location for a browser
	 * @param {number} x
	 * @param {number} y
	 * @param {HTMLElement} tooltip
	 * @param {CSSStyleDeclaration["direction"]} direction
	 * @param {ChromeBrowser} browser
	 * @returns
	 */
	showTooltip(x, y, tooltip, direction, browser) {
		if (
			Cc["@mozilla.org/widget/dragservice;1"]
				.getService(Ci.nsIDragService)
				.getCurrentSession()
		) {
			return;
		}

		console.log(x, y, tooltip, direction, browser);
	}

	hideTooltip() {
		console.log("XULBrowserWindow.hideTooltip: stub");
	}

	getTabCount() {
		return gDot.tabs.length;
	}

	onProgressChange(...args) {
		return;
	}

	onProgressChange64(...args) {
		return;
	}

	/**
	 * Fired when the state of the browser changes
	 * @param {nsIWebProgress} webProgress
	 * @param {nsIRequest} request
	 * @param {number} stateFlags
	 * @param {number} status
	 */
	onStateChange(webProgress, request, stateFlags, status) {
		const { nsIWebProgressListener } = Ci;

		if (
			stateFlags & nsIWebProgressListener.STATE_START &&
			stateFlags & nsIWebProgressListener.STATE_IS_NETWORK
		) {
			this.isBusy = true;

			if (!(stateFlags & nsIWebProgressListener.STATE_RESTORING)) {
				this.busyUI = true;
			}
		} else if (stateFlags & nsIWebProgressListener.STATE_STOP) {
			if (request) {
				this.status = "";
				this.setDefaultStatus("");
			}

			this.isBusy = false;

			if (this.busyUI) {
				this.busyUI = false;
			}
		}
	}

	onLocationChange(...args) {
		return;
	}

	asyncUpdateUI() {
		return;
	}

	/**
	 * Fired when the status of the browser changes
	 * @param {nsIWebProgress} webProgress
	 * @param {nsIRequest} request
	 * @param {number} status
	 * @param {string} message
	 */
	onStatusChange(webProgress, request, status, message) {
		this.status = message;
	}

	onContentBlockingEvent(...args) {
		return;
	}

	onSecurityChange(...args) {
		return;
	}
}

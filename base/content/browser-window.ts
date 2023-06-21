/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
	Browser,
	nsIRequest,
	nsIURI,
	nsIWebProgress
} from "../../third_party/dothq/gecko-types/lib";

const TRIM_URL_PROTOCOL = "http://";

function trimURL(url: string) {
    url = url.replace(/^((?:http|https|ftp):\/\/[^/]+)\/$/, "$1");

    // Remove "http://" prefix.
    return url.startsWith(TRIM_URL_PROTOCOL)
        ? url.substring(TRIM_URL_PROTOCOL.length)
        : url;
}

/**
 * Handles communication between the engine to
 * receive events and pass them to their respective
 * locations.
 */
export class nsIXULBrowserWindow {
	public status = "";
	public defaultStatus = "";
	public overLink = "";
	public startTime = 0;
	public isBusy = false;
	public busyUI = false;
	public hideOverLinkImmediately = false;

	private _state: null;
	private _lastLocation: null;
	private _event: null;
	private _lastLocationForEvent: null;
	// _isSecureContext can change without the state/location changing, due to security
	// error pages that intercept certain loads. For example this happens sometimes
	// with the the HTTPS-Only Mode error page (more details in bug 1656027)
	private _isSecureContext: null;

	public QueryInterface = ChromeUtils.generateQI([
		"nsIWebProgressListener",
		"nsIWebProgressListener2",
		"nsISupportsWeakReference",
		"nsIXULBrowserWindow"
	]);

	// Stubbing stopCommand and reloadCommand so we can overlay our own
	// reload/stop implementation
	public get stopCommand() {
		return document.createElement("div");
	}

	public get reloadCommand() {
		return document.createElement("div");
	}

	public setDefaultStatus(status: string) {
		this.defaultStatus = status;
		StatusPanel.update();
	}

	public setOverLink(url: string) {
		if (url) {
			url = Services.textToSubURI.unEscapeURIForUI(url);

			// Encode bidirectional formatting characters.
			// (RFC 3987 sections 3.2 and 4.1 paragraph 6)
			url = url.replace(/[\u200e\u200f\u202a\u202b\u202c\u202d\u202e]/g, encodeURIComponent);

			if (Services.prefs.getBoolPref("browser.urlbar.trimURLs", true)) {
				url = trimURL(url);
			}
		}

		this.overLink = url;

        const evt = new CustomEvent(gDot.tabs.EVENT_BROWSER_STATUS_CHANGE, {
            detail: {
                message: url,
                type: "overLink"
            }
        });

		gDot.tabs.selectedTab.webContents.dispatchEvent(evt);
	}

	public showTooltip(
		x: number,
		y: number,
		tooltip: HTMLElement,
		direction: CSSStyleDeclaration["direction"],
		browser: Browser
	) {
		if (
			Cc["@mozilla.org/widget/dragservice;1"]
				.getService(Ci.nsIDragService)
				.getCurrentSession()
		) {
			return;
		}

		console.log(x, y, tooltip, direction, browser);
	}

	public hideTooltip() {
		console.log("XULBrowserWindow.hideTooltip: stub");
	}

	public getTabCount() {
		return gDot.tabs.length;
	}

	public onProgressChange(
		webProgress: nsIWebProgress,
		request: nsIRequest,
		curSelfProgress: number,
		maxSelfProgress: number,
		curTotalProgress: number,
		maxTotalProgress: number
	) {
		console.log(
			"XULBrowserWindow.onProgressChange",
			webProgress,
			request,
			curSelfProgress,
			maxSelfProgress,
			curTotalProgress,
			maxTotalProgress
		);
	}

	public onProgressChange64(
		webProgress: nsIWebProgress,
		request: nsIRequest,
		curSelfProgress: number,
		maxSelfProgress: number,
		curTotalProgress: number,
		maxTotalProgress: number
	) {
		return this.onProgressChange(
			webProgress,
			request,
			curSelfProgress,
			maxSelfProgress,
			curTotalProgress,
			maxTotalProgress
		);
	}

	public onStateChange(
		webProgress: nsIWebProgress,
		request: nsIRequest,
		stateFlags: number,
		status: number
	) {
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

	/**
	 *
	 * @param webProgress
	 * @param request
	 * @param locationURI
	 * @param flags
	 * @param isSimulated A false locationChange event. Can be sent via tab changes or similar.
	 * @returns
	 */
	public onLocationChange(
		webProgress: nsIWebProgress,
		request: nsIRequest,
		locationURI: nsIURI,
		flags: number,
		isSimulated: boolean
	) {
		const location = locationURI ? locationURI.spec : "";

		// For most changes we only need to update the browser UI if the primary
		// content area was navigated or the selected tab was changed. We don't need
		// to do anything else if there was a subframe navigation.

		if (!webProgress.isTopLevel) {
			return;
		}

		this.hideOverLinkImmediately = true;
		this.setOverLink("");
		this.hideOverLinkImmediately = false;

		const isSameDocument = flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT;

		// if (
		// 	(location == "about:blank" &&
		// 		BrowserUIUtils.checkEmptyPageOrigin(gBrowser.selectedBrowser)) ||
		// 	location == ""
		// ) {
		// 	// Disable reload button
		// } else {
		// 	// Enable reload button
		// }

		const isSessionRestore = !!(
			flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SESSION_STORE
		);

		console.log(
			"gURLBar.setURI",
			location,
			`isSimulated=${isSimulated}`,
			`isSessionRestore=${isSessionRestore}`
		);

		// If we've actually changed document, update the toolbar visibility.
		if (!isSameDocument) {
			// A document change has occured, we could check if the bookmarks bar needs to be hidden
			// i.e. the personal bar is only shown on the NTP
		}

		// If the location is changed due to switching tabs,
		// ensure we close any open tabspecific panels.
		if (isSimulated) {
			// We should close any open popups / panels here
		}

		// Ensure we close any remaining open locationspecific panels
		if (!isSameDocument) {
			// We should close any open popups / panels here
		}

		// It is now safe to call our other onLocationChange handlers here

		// -- End --

		// See bug 358202, when tabs are switched during a drag operation,
		// timers don't fire on windows (bug 203573)
		if (request) {
			setTimeout(function () {
				XULBrowserWindow.asyncUpdateUI();
			}, 0);
		} else {
			this.asyncUpdateUI();
		}
	}

	public asyncUpdateUI() {
		// Update the Open Search badge
	}

	public onStatusChange(
		webProgress: nsIWebProgress,
		request: nsIRequest,
		status: number,
		message: string
	) {
		this.status = message;

		StatusPanel.update();
	}

	/**
	 *
	 * @param webProgress
	 * @param request
	 * @param event
	 * @param isSimulated A false contentBlocking event. Can be sent via tab changes or similar.
	 * @returns
	 */
	public onContentBlockingEvent(
		webProgress: nsIWebProgress,
		request: nsIRequest,
		event: number,
		isSimulated: boolean
	) {
		console.log(
			"XULBrowserWindow.onContentBlockingEvent",
			webProgress,
			request,
			event,
			isSimulated
		);
	}

	/**
	 *
	 * @param webProgress
	 * @param request
	 * @param event
	 * @param isSimulated A false securityChange event. Can be sent via tab changes or similar.
	 * @returns
	 */
	public onSecurityChange(
		webProgress: nsIWebProgress,
		request: nsIRequest,
		state: number,
		isSimulated: boolean
	) {
		console.log("XULBrowserWindow.onSecurityChange", webProgress, request, state, isSimulated);
	}

	public onUpdateCurrentBrowser(
		stateFlags: number,
		status: number,
		message: string,
		totalProgress: number
	) {
		console.log(
			"XULBrowserWindow.onUpdateCurrentBrowser",
			stateFlags,
			status,
			message,
			totalProgress
		);

		// Hide any tooltips that are visible
		this.hideTooltip();

		const { nsIWebProgressListener } = Ci;
		const loadingDone = stateFlags & nsIWebProgressListener.STATE_STOP;

		// use a pseudo-object instead of a (potentially nonexistent) channel for getting
		// a correct error message - and make sure that the UI is always either in
		// loading (STATE_START) or done (STATE_STOP) mode
        console.log("this.onStateChange", "gBrowser.webProgress",
        { URI: "gBrowser.currentURI" } as any /* @todo make this partial? */,
        loadingDone ? nsIWebProgressListener.STATE_STOP : nsIWebProgressListener.STATE_START,
        status)

		// Status message and progress value are undefined if we're done with loading
		if (loadingDone) {
			return;
		}
        console.log("this.onStatusChange", "gBrowser.webProgress", null, 0, message);
	}
}

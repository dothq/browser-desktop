/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { setTimeout, clearTimeout } = ChromeUtils.importESModule(
	"resource://gre/modules/Timer.sys.mjs"
);

/**
 * Handles communication between the engine to
 * receive events and pass them to their respective
 * locations.
 */
export class XULBrowserWindow {
	/** @type {Window} */
	#win = null;

	get #doc() {
		return this.#win.document;
	}

	status = "";
	defaultStatus = "";
	startTime = 0;
	isBusy = false;
	busyUI = false;

	_state = null;
	_lastLocation = null;
	_event = null;
	_lastLocationForEvent = null;
	// _isSecureContext can change without the state/location changing, due to security
	// error pages that intercept certain loads. For example this happens sometimes
	// with the the HTTPS-Only Mode error page (more details in bug 1656027)
	_isSecureContext = null;

	QueryInterface = ChromeUtils.generateQI([
		"nsIWebProgressListener",
		"nsIWebProgressListener2",
		"nsISupportsWeakReference",
		"nsIXULBrowserWindow"
	]);

	// Stubbing stopCommand and reloadCommand so we can overlay our own
	// reload/stop implementation
	get stopCommand() {
		return this.#doc.createElement("div");
	}

	get reloadCommand() {
		return this.#doc.createElement("div");
	}

	/**
	 * The remote browser tooltip element
	 */
	get tooltipElement() {
		return /** @type {BrowserRemoteTooltip} */ (
			this.#doc.documentElement.querySelector(
				"#browser-remote-tooltip"
			) ||
				this.#doc.createXULElement("tooltip", {
					is: "browser-remote-tooltip"
				})
		);
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
		// noop: Handled by LinkStatus actor
	}

	/**
	 * Opens a tooltip at a location for a browser
	 * @param {number} x
	 * @param {number} y
	 * @param {string} label
	 * @param {CSSStyleDeclaration["direction"]} direction
	 * @param {ChromeBrowser} browser
	 * @returns
	 */
	showTooltip(x, y, label, direction, browser) {
		if (
			Cc["@mozilla.org/widget/dragservice;1"]
				.getService(Ci.nsIDragService)
				.getCurrentSession()
		) {
			return;
		}

		if (!this.#doc.hasFocus()) return;

		this.#doc.documentElement.appendChild(this.tooltipElement);

		this.tooltipElement.label = label;
		this.tooltipElement.style.direction = direction;
		this.tooltipElement.openPopupAtScreen(
			x / this.#win.devicePixelRatio,
			y / this.#win.devicePixelRatio,
			false,
			null
		);
	}

	hideTooltip() {
		this.tooltipElement.hidePopup();
	}

	getTabCount() {
		return this.#win.gDot?.tabs.length || 0;
	}

	onProgressChange(...args) {
		return;
	}

	onProgressChange64(...args) {
		return;
	}

	/**
	 * Fired when the state of the browser changes
	 * @param {import("third_party/dothq/gecko-types/lib").nsIWebProgress} webProgress
	 * @param {import("third_party/dothq/gecko-types/lib").nsIRequest} request
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
	 * @param {import("third_party/dothq/gecko-types/lib").nsIWebProgress} webProgress
	 * @param {import("third_party/dothq/gecko-types/lib").nsIRequest} request
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

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.#win = win;
	}
}

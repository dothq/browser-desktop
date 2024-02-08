/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { PageThumbs } = ChromeUtils.importESModule(
	"resource://gre/modules/PageThumbs.sys.mjs"
);

var { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

class BrowserTabsTooltip extends BrowserTooltip {
	/**
	 * The tabs tooltip container
	 */
	get container() {
		return (
			this.querySelector(".tabs-tooltip-container") ||
			html("div", { class: "tabs-tooltip-container" })
		);
	}

	/**
	 * The anatomy of the tabs tooltip
	 */
	get elements() {
		return {
			title: /** @type {HTMLSpanElement} */ (
				this.querySelector(".tabs-tooltip-title") ||
					html("span", { class: "tabs-tooltip-title" })
			),
			uri: /** @type {HTMLSpanElement} */ (
				this.querySelector(".tabs-tooltip-uri") ||
					html("span", { class: "tabs-tooltip-uri" })
			),
			canvas: /** @type {HTMLCanvasElement} */ (
				this.querySelector(".tabs-tooltip-canvas") ||
					html("canvas", { class: "tabs-tooltip-canvas" })
			)
		};
	}

	browserThumbnailInt = null;

	/**
	 * Determines how often the canvas preview should refresh
	 */
	get canvasRefreshInterval() {
		return Services.prefs.getIntPref(
			"dot.tabs.tooltip.canvas_refresh_interval_ms",
			150
		);
	}

	/**
	 * The tabs tooltip canvas' 2D context
	 */
	get canvasCtx() {
		return this.elements.canvas.getContext("2d");
	}

	/**
	 * Takes a capture of the browser contents to a canvas
	 * @param {ChromeBrowser} browser
	 */
	_captureToCanvas(browser) {
		PageThumbs.captureToCanvas(browser, this.elements.canvas, {
			fullViewport: true
		});
	}

	/**
	 * Updates the tooltip with information about a tab
	 * @param {BrowserTab} tab
	 */
	setTooltipTab(tab) {
		this.elements.title.textContent = "";
		this.elements.uri.textContent = "";
		this.canvasCtx.clearRect(
			0,
			0,
			this.elements.canvas.width,
			this.elements.canvas.height
		);
		clearTimeout(this.browserThumbnailTimeout);

		if (!tab) {
			return;
		}

		const browser = tab.linkedBrowser;

		this.setAttribute("label", browser.contentTitle);

		this.elements.title.textContent = browser.contentTitle;
		this.elements.uri.textContent = BrowserTabsUtils.formatURI(
			browser.currentURI.spec,
			{
				trimProtocol: true,
				trimTrailingSlash: true,
				trimWWWSubdomain: true
			}
		);

		this._captureToCanvas(browser);

		if (this.canvasRefreshInterval > 0) {
			this.browserThumbnailTimeout = setInterval(
				() => this._captureToCanvas(browser),
				this.canvasRefreshInterval
			);
		}
	}

	/**
	 * Fired when the popup starts showing
	 * @param {Event} event
	 */
	onPopupShowing(event) {
		if (
			this.triggerNode &&
			this.triggerNode instanceof BrowserRenderedTab
		) {
			const tab = this.triggerNode.linkedTab;

			this.setTooltipTab(tab);
		}
	}

	/**
	 * Fired when the popup is hidden
	 * @param {Event} event
	 */
	onPopupHidden(event) {
		this.setTooltipTab(null);
	}

	/**
	 * Handles incoming events to the tabs tooltip
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "popupshowing":
				this.onPopupShowing(event);
				break;
			case "popuphidden":
				this.onPopupHidden(event);
				break;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this.id = "browser-tabs-tooltip";
		this.setAttribute("noautohide", "");
		this.setAttribute("location", "floating");

		this.addEventListener("popupshowing", this);
		this.addEventListener("popuphidden", this);

		this.appendChild(this.container);

		this.container.append(
			this.elements.title,
			this.elements.uri,
			this.elements.canvas
		);
	}

	disconnectedCallback() {
		this.removeEventListener("popupshowing", this);
		this.removeEventListener("popuphidden", this);
	}
}

customElements.define("browser-tabs-tooltip", BrowserTabsTooltip, {
	extends: "tooltip"
});

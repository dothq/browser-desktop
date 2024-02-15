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
	 * The tabs tooltip tab container
	 */
	get tabContainer() {
		return /** @type {HTMLDivElement} */ (
			this.querySelector(".tabs-tooltip-tab-container") ||
				html("div", { class: "tabs-tooltip-tab-container" })
		);
	}

	/**
	 * The tabs tooltip preview container
	 */
	get previewContainer() {
		return /** @type {HTMLDivElement} */ (
			this.querySelector(".tabs-tooltip-preview-container") ||
				html("div", { class: "tabs-tooltip-preview-container" })
		);
	}

	/**
	 * The anatomy of the tabs tooltip
	 */
	get elements() {
		return {
			previewCanvas: /** @type {HTMLCanvasElement} */ (
				this.querySelector(".tabs-tooltip-preview-canvas") ||
					html("canvas", {
						class: "tabs-tooltip-preview-canvas",
						width: 300,
						height: 150
					})
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
	 * The tabs tooltip preview canvas' 2D context
	 */
	get previewCanvasCtx() {
		return this.elements.previewCanvas.getContext("2d");
	}

	/**
	 * Takes a capture of the tab to a canvas
	 * @param {BrowserRenderedTab} tab
	 */
	async _captureToCanvas(tab) {
		PageThumbs.captureToCanvas(
			tab.linkedTab.linkedBrowser,
			this.elements.previewCanvas,
			{
				targetWidth: 1000
			}
		);
	}

	/**
	 * Updates the tooltip with information about a tab
	 * @param {BrowserRenderedTab} tab
	 */
	setTooltipTab(tab) {
		this.previewCanvasCtx.clearRect(
			0,
			0,
			this.elements.previewCanvas.width,
			this.elements.previewCanvas.height
		);

		clearTimeout(this.browserThumbnailTimeout);

		if (!tab) {
			return;
		}

		const browser = tab.linkedTab.linkedBrowser;

		this.setAttribute("label", browser.contentTitle);

		const bounds = tab.getBoundingClientRect();

		this.style.setProperty("--tabs-tooltip-width", bounds.width + "px");
		this.style.setProperty("--tabs-tooltip-height", bounds.height + "px");

		this._captureToCanvas(tab);

		if (this.canvasRefreshInterval > 0) {
			this.browserThumbnailTimeout = setInterval(
				() => this._captureToCanvas(tab),
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
			this.setTooltipTab(this.triggerNode);
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

		this.appendChild(
			html(
				"div",
				{ class: "tabs-tooltip-container" },
				this.previewContainer
			)
		);

		this.previewContainer.appendChild(this.elements.previewCanvas);
	}

	disconnectedCallback() {
		this.removeEventListener("popupshowing", this);
		this.removeEventListener("popuphidden", this);
	}
}

customElements.define("browser-tabs-tooltip", BrowserTabsTooltip, {
	extends: "tooltip"
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserStatus extends BrowserContextualMixin(MozHTMLElement) {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return ["side"];
	}

	/**
	 * Get the closest browser webContents
	 * We only want browser elements as other webContents won't be firing status changes
	 *
	 * @returns {ChromeBrowser}
	 */
	get webContents() {
		const nearestPanel = this.closest("browser-web-panel");

		if (!nearestPanel) {
			return this.hostContext.browser;
		}

		return nearestPanel.querySelector("browser.browser-web-contents");
	}

	/**
	 * The label element for the browser status
	 */
	get label() {
		return this.querySelector(".browser-status-label");
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.toggleAttribute("inactive", true);
		this.setAttribute("statustype", "");
		this.setAttribute("side", "left");

		this.appendChild(html("span", { class: "browser-status-label" }));

		window.addEventListener("BrowserTabs::BrowserStatusChange", this);
		window.addEventListener("BrowserTabs::TabSelect", this);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		window.removeEventListener("BrowserTabs::BrowserStatusChange", this);
		window.removeEventListener("BrowserTabs::TabSelect", this);
	}

	/**
	 * Fired when the status changes for this browser
	 * @param {object} status
	 * @param {ChromeBrowser} status.browser
	 * @param {string} status.message
	 * @param {"busy" | "overLink"} status.type
	 */
	onStatusChanged(status) {
		if (status.browser != this.webContents) return;

		if (status.message.length) this.label.textContent = status.message;

		let inactive = true;

		if (status.type === "busy") {
			inactive = !gDot.tabs.isBusy;
		} else if (status.type === "overLink") {
			inactive = false;
		}

		this.setAttribute("statustype", status.type);
		this.toggleAttribute(
			"inactive",
			status.message.length ? inactive : true
		);
	}

	/**
	 * Fired when the active tab is changed
	 * @param {BrowserTab} tab
	 */
	onActiveTabChanged(tab) {
		// The tab change wasn't for our linked browser, so we can safely ignore this
		if (tab.linkedBrowser !== this.webContents) return;

		this.toggleAttribute("inactive", true);
	}

	/**
	 * Handles incoming events to the BrowserStatus element
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::BrowserStatusChange":
				this.onStatusChanged(event.detail);
				break;
			case "BrowserTabs::TabSelect":
				this.onActiveTabChanged(event.detail);
				break;
		}
	}
}

customElements.define("browser-status", BrowserStatus);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserStatusPanel extends BrowserContextualMixin(MozHTMLElement) {
	constructor() {
		super();
	}

	STATUS_HIERARCHY = ["busy", "overLink", "tooltip"];

	static get observedAttributes() {
		return ["side"];
	}

	/**
	 * The global status manager singleton
	 */
	get status() {
		return gDot.status;
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

		window.addEventListener("BrowserStatus::StatusChange", this);
		window.addEventListener("BrowserStatus::BrowserStatusChange", this);
		window.addEventListener("BrowserTabs::TabSelect", this);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		window.removeEventListener("BrowserStatus::StatusChange", this);
		window.removeEventListener("BrowserStatus::BrowserStatusChange", this);
		window.removeEventListener("BrowserTabs::TabSelect", this);
	}

	/**
	 * Obtains the current status value
	 */
	getStatus() {
		for (const statusType of this.STATUS_HIERARCHY) {
			// Special case for busy statuses:
			// Ensure the document is actually loading,
			// otherwise we just skip it.
			if (
				statusType == "busy" &&
				!this.hostContext.browser.webProgress.isLoadingDocument
			) {
				continue;
			}

			const statusValue =
				this.status.getStatus(statusType) ||
				this.status.getTabStatus(this.hostContext.tab, statusType);

			if (statusValue) {
				return {
					type: statusType,
					status: statusValue
				};
			}
		}

		return {
			type: null,
			status: null
		};
	}

	/**
	 * Updates the status panel
	 */
	_update() {
		const statusData = this.getStatus();

		let type = statusData?.type || null;
		let status = statusData?.status || null;

		if (status && type) {
			this.label.textContent = status;
			this.setAttribute("statustype", type);
		}

		this.removeAttribute("inactive-instant");
		this.toggleAttribute("inactive", !type);
	}

	/**
	 * Fired when the status changes globally
	 * @param {CustomEvent<{ status: string; type: string; }>} event
	 */
	onStatusChanged(event) {
		this._update();
	}

	/**
	 * Fired when the status changes for a particular browser
	 * @param {CustomEvent<{ browser: ChromeBrowser; status: string; type: string; }>} event
	 */
	onBrowserStatusChanged(event) {
		this._update();
	}

	/**
	 * Fired when the active tab is changed
	 * @param {CustomEvent<BrowserTab>} event
	 */
	onTabChanged(event) {
		const tab = event.detail;
		if (tab !== this.hostContext.tab) return;

		this._update();
	}

	/**
	 * Handles incoming events to the statuspanel element
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserStatus::StatusChange":
				this.onStatusChanged(event);
				break;
			case "BrowserStatus::BrowserStatusChange":
				this.onBrowserStatusChanged(event);
				break;
			case "BrowserTabs::TabSelect":
				this.onTabChanged(event);
				break;
		}
	}
}

customElements.define("browser-status", BrowserStatusPanel);

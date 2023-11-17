/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabLabel extends BrowserContextualMixin(HTMLElement) {
	constructor() {
		super();
	}

	/**
	 * The text element used for storing the label
	 */
	get textEl() {
		return this.querySelector("span") || html("span");
	}

	/**
	 * Handles incoming events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::TabSelect":
			case "BrowserTabs::LocationChange":
				this.updateLabel();
				break;
			case "BrowserTabs::BrowserTitleChanged":
			// if (event.detail.tab === this.context.tab) {
			// 	this.updateLabel();
			// }
		}
	}

	/**
	 * Updates the tab's label
	 */
	updateLabel() {
		// const newLabel = this.context.tab?.getAttribute("label");
		// if (this.textEl.textContent !== newLabel) {
		// 	this.textEl.textContent = newLabel;
		// }
	}

	connectedCallback() {
		this.appendChild(this.textEl);

		window.addEventListener("BrowserTabs::TabSelect", this);
		window.addEventListener("BrowserTabs::LocationChange", this);
		window.addEventListener("BrowserTabs::BrowserTitleChanged", this);

		// if (this.context.tab) {
		// 	this.updateLabel();
		// }
	}

	disconnectedCallback() {
		window.removeEventListener("BrowserTabs::TabSelect", this);
		window.removeEventListener("BrowserTabs::LocationChange", this);
		window.removeEventListener("BrowserTabs::BrowserTitleChanged", this);
	}
}

customElements.define("browser-tab-label", BrowserTabLabel);

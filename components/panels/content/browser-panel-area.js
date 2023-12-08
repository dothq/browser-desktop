/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserPanelArea extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	/**
	 * The closest panel element to this area
	 * @returns {BrowserPanel}
	 */
	get panel() {
		return this.closest("panel");
	}

	/**
	 * The context for the panel
	 */
	get context() {
		const self = this;

		return {
			self,
			audience: "panel",

			/** @type {Window} */
			get window() {
				return self.ownerGlobal;
			},

			/** @type {BrowserTab} */
			get tab() {
				return (
					self.panel?.openArgs?.tab ||
					self.ownerGlobal.gDot.tabs.selectedTab
				);
			},

			/** @type {ChromeBrowser} */
			get browser() {
				return self.panel?.openArgs?.tab || this.tab.linkedBrowser;
			}
		};
	}

	handleEvent(event) {}

	connectedCallback() {
		super.connect("panel", { orientation: "vertical" });

		this.classList.add("browser-panel-container");
	}

	disconnectedCallback() {}
}

customElements.define("browser-panel-area", BrowserPanelArea);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserIdentityButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.routineId = "toggle-identity-popout";
		this.buttonId = "identity-button";
	}

	/**
	 * Handles incoming tab identity changes
	 *
	 * @param {object} data
	 * @param {string} data.type
	 * @param {string} data.icon
	 * @param {string} data.label
	 * @param {string} data.tooltip
	 * @param {string} data.mode
	 */
	_onTabIdentityChanged({ type, icon, label, tooltip, mode }) {
		this.setAttribute("identitytype", type);

		this.icon = icon;
		this.label = label;
		this.title = tooltip;
		this.mode = mode;

		console.log(
			"_onTabIdentityChanged",
			this.icon,
			this.label,
			this.title,
			this.mode
		);
	}

	/**
	 * Handles incoming events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::TabIdentityChanged":
				{
					// if (
					// 	this.associatedArea == "addressbar" &&
					// 	event.detail.tab === this.context.tab
					// ) {
					// 	this._onTabIdentityChanged(event.detail);
					// }
				}
				break;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		window.addEventListener("BrowserTabs::TabIdentityChanged", this);

		// if (this.context.tab) {
		// 	this.context.tab.siteIdentity.update(true);
		// }
	}

	disconnectedCallback() {
		window.removeEventListener("BrowserTabs::TabIdentityChanged", this);
	}
}

customElements.define("identity-button", BrowserIdentityButton, {
	extends: "button"
});

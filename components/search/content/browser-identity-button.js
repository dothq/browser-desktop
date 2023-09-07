/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserIdentityButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.routineId = "toggle-identity-popout";
	}

	get tab() {
		return gDot.tabs.selectedTab;
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

		// We only want to apply a mode if we're in the addressbar's identity box
		// If we aren't, it'll just inherit the mode from the toolbar it's in
		if (this.closest(".addressbar-identity-box")) {
			this.mode = mode;
		}

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
					if (event.detail.tab === this.tab) {
						this._onTabIdentityChanged(event.detail);
					}
				}
				break;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		window.addEventListener("BrowserTabs::TabIdentityChanged", this);
	}

	disconnectedCallback() {
		window.removeEventListener("BrowserTabs::TabIdentityChanged", this);
	}
}

customElements.define("identity-button", BrowserIdentityButton, {
	extends: "button"
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserSettingsButton extends BrowserToolbarButton {
	constructor() {
		super();

		this.buttonId = "settings-button";

		this.label = "Settings";
		this.tooltip = "Open settings";
		this.icon = "settings";
	}

	/**
	 * Handles incoming events to the settings button
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "click":
				gDot.actions.run("browser.tabs.open", {
					where: "tab",
					url: "about:settings"
				});
				break;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this.addEventListener("click", this);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener("click", this);
	}
}

customElements.define("settings-button", BrowserSettingsButton, {
	extends: "button"
});

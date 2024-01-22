/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserPanelButton extends BrowserCommandButton {
	constructor() {
		super();
	}

	/**
	 * Triggered when a command event is fired on the panel button
	 * @param {import("components/commands/Command.sys.mjs").CommandEvent} event
	 */
	_onPanelButtonCommand(event) {
		const panelArea = /** @type {BrowserPanelArea} */ (this.host);

		panelArea.panel.hidePopup(true, true);
	}

	connectedCallback() {
		super.connectedCallback();

		this.addEventListener("command", this._onPanelButtonCommand.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener(
			"command",
			this._onPanelButtonCommand.bind(this)
		);
	}
}

customElements.define("browser-panel-button", BrowserPanelButton, {
	extends: "button"
});

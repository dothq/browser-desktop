/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserPanelMenu extends BrowserPanelArea {
	constructor() {
		super();
	}

	/**
	 * Handles incoming events to the menu popup
	 * @param {Event} event
	 */
	_handlePanelEvent(event) {
		switch (event.type) {
			case "popuphidden":
				this.remove();
				break;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this.panel.setAttribute("animate", "true");
		this.classList.add("browser-menu-container");

		this.addEventListener("popuphidden", this._handlePanelEvent.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener(
			"popuphidden",
			this._handlePanelEvent.bind(this)
		);
	}
}

customElements.define("browser-panel-menu", BrowserPanelMenu);

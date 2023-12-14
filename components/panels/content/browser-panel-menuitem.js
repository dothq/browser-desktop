/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserPanelMenuItem extends MozHTMLElement {
	/**
	 * The allowed customizable attributes for the menu item
	 */
	static get customizableAttributes() {
		return {
			type: (value) => {
				if (!["normal", "group", "separator"].includes(value)) {
					throw new Error(
						`Attribute 'type' must be either "normal", "separator" or "group", got '${value}'.`
					);
				}

				return value;
			},

			orientation: "orientation"
		};
	}

	/**
	 * Determines what type of menu item this is
	 */
	get type() {
		return this.getAttribute("type");
	}

	/**
	 * Determines the orientation of the menu item
	 */
	get orientation() {
		return this.getAttribute("orientation");
	}

	set orientation(newValue) {
		this.setAttribute("orientation", newValue);
	}

	/**
	 * Determines the icons mode of the menu item
	 */
	get mode() {
		return this.getAttribute("mode");
	}

	set mode(newValue) {
		this.setAttribute("mode", newValue);
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		if (this.type == "group") {
			if (!this.getAttribute("orientation")) {
				this.orientation = "horizontal";
			}
		}

		if (this.orientation == "horizontal") {
			this.mode = "icons";
		}
	}
}

customElements.define("browser-panel-menuitem", BrowserPanelMenuItem);

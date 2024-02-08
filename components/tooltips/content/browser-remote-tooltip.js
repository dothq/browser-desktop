/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserRemoteTooltip extends BrowserTooltip {
	connectedCallback() {
		super.connectedCallback();

		this.id = "browser-remote-tooltip";

		this.setAttribute("animate", "true");
		this.setAttribute("location", "floating");
	}
}

customElements.define("browser-remote-tooltip", BrowserRemoteTooltip, {
	extends: "tooltip"
});

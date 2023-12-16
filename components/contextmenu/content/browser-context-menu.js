/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserContextMenu extends BrowserPanelMenu {
	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();

		super.connect("context-menu-panel", {
			templateId: "browser-context-menu",
			orientation: "vertical",
			styles: ["chrome://dot/content/widgets/browser-panel-button.css"]
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("browser-context-menu", BrowserContextMenu);

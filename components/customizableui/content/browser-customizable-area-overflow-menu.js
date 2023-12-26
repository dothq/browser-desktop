/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableAreaOverflowMenu extends BrowserPanelMenu {
	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();

		super.connect("customizable-area-overflow-menu", {
			orientation: "vertical",
			styles: ["chrome://dot/content/widgets/browser-panel-button.css"]
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define(
	"browser-customizable-area-overflow-menu",
	BrowserCustomizableAreaOverflowMenu
);

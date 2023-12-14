/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserContextMenu extends BrowserPanelMenu {
	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();

		this.customizableContainer.append(
			html(
				"browser-panel-menuitem",
				{ type: "group" },
				html("button", { is: "back-button" }),
				html("button", { is: "forward-button" }),
				html("button", { is: "reload-button" }),
				html("button", { is: "identity-button" })
			),
			html("browser-panel-menuitem", { type: "separator" }),
			html(
				"browser-panel-menuitem",
				{ type: "normal" },
				html("button", { is: "select-all-button" }),
				html("button", { is: "cut-button" }),
				html("button", { is: "copy-button" }),
				html("button", { is: "paste-button" })
			)
		);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("browser-context-menu", BrowserContextMenu);

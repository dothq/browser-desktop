/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserIdentityPanel extends BrowserPanelArea {
	constructor() {
		super();
	}

	/**
	 * The elements used in the identity panel
	 */
	get elements() {
		return {
			header: /** @type {HTMLDivElement} */ (
				this.shadowRoot.querySelector(".browser-panel-header") ||
					html(
						"div",
						{ class: "browser-panel-header" },
						html(
							"span",
							{ class: "browser-panel-header-title" },
							`Site information for ${this.context.browser.currentURI.spec}`
						)
					)
			),
			content: /** @type {HTMLDivElement} */ (
				this.shadowRoot.querySelector(".browser-panel-content") ||
					html("div", { class: "browser-panel-content" })
			)
		};
	}

	connectedCallback() {
		super.connectedCallback();

		this.customizableContainer.appendChild(this.elements.header);
		this.customizableContainer.appendChild(this.elements.content);

		this.elements.content.appendChild(
			html("button", { is: "reload-button" })
		);
	}
}

customElements.define("identity-panel", BrowserIdentityPanel);

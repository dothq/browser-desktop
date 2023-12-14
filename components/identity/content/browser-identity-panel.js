/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class IdentityPanelOverviewPage extends BrowserMultipanelPage {
	connectedCallback() {
		super.connectedCallback();

		this.appendChild(
			html(
				"div",
				{ class: "browser-panel-header" },
				html(
					"span",
					{ class: "browser-panel-header-title" },
					`Site information for ${this.multipanel.context.browser.currentURI.spec}`
				)
			)
		);

		this.appendChild(html("p", {}, "overview"));

		const btn = html("button", {}, "Go to connection security");
		btn.addEventListener("click", () => {
			this.multipanel.navigate("connection-security");
		});

		this.appendChild(btn);
	}
}

class IdentityPanelConnectionSecurityPage extends BrowserMultipanelPage {
	connectedCallback() {
		super.connectedCallback();

		this.appendChild(
			html(
				"div",
				{ class: "browser-panel-header" },
				html(
					"span",
					{ class: "browser-panel-header-title" },
					`Connection security for ${this.multipanel.context.browser.currentURI.spec}`
				)
			)
		);

		this.appendChild(html("p", {}, "connection security"));

		const btn = html("button", {}, "Go home");
		btn.addEventListener("click", () => {
			this.multipanel.navigate("default");
		});

		this.appendChild(btn);
	}
}

class BrowserIdentityPanel extends BrowserMultipanelArea {
	static get pages() {
		return {
			default: IdentityPanelOverviewPage,
			"connection-security": IdentityPanelConnectionSecurityPage
		};
	}

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
	}
}

customElements.define("identity-panel", BrowserIdentityPanel);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class InterstitialPage extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	/**
	 * Renders the interstitial page element
	 */
	render() {
		return html(
			"div",
			{ class: "interstitial-page-container" },
			html("slot", { name: "icon", part: "icon" }),
			html("slot", {
				class: "interstitial-page-titles",
				name: "title",
				part: "titles"
			}),
			html(
				"div",
				{ class: "interstitial-page-content" },
				html("slot", { part: "content" }),
				html(
					"div",
					{
						class: "interstitial-page-actions"
					},
					html("slot", {
						name: "action_start",
						part: "actions_start"
					}),
					html("slot", {
						name: "action_center",
						part: "actions_center"
					}),
					html("slot", {
						name: "action_end",
						part: "actions_end"
					})
				)
			)
		);
	}

	connectedCallback() {
		this.classList.add("interstitial");

		this.shadowRoot.appendChild(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/content/interstitials/interstitials.css"
			})
		);

		this.shadowRoot.appendChild(this.render());
	}
}

customElements.define("interstitial-page", InterstitialPage);

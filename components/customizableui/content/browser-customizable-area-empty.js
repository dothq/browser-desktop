/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableAreaEmpty extends InterstitialPage {
	constructor() {
		super();
	}

	/**
	 * The elements for the area empty state
	 */
	get elements() {
		return {
			icon: /** @type {BrowserIcon} */ (
				this.querySelector(".customizable-empty-icon") ||
					html("browser-icon", {
						class: "customizable-empty-icon",
						name: "info",
						slot: "icon"
					})
			),
			title: /** @type {HTMLHeadingElement} */ (
				this.querySelector(".customizable-empty-title") ||
					html(
						"h1",
						{
							class: "customizable-empty-title",
							slot: "title"
						},
						"Nothing here yet."
					)
			)
		};
	}

	connectedCallback() {
		super.connectedCallback();

		this.appendChild(this.elements.icon);
		this.appendChild(this.elements.title);

		this.appendChild(html("p", {}, "Nothing here yet."));
	}
}

customElements.define(
	"browser-customizable-area-empty",
	BrowserCustomizableAreaEmpty
);

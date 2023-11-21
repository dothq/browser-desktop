/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserWebContents extends MozHTMLElement {
	get elements() {
		return {
			topLine: html("div", {
				class: "wc-border-line top"
			}),
			leftLine: html("div", {
				class: "wc-border-line left"
			}),
			rightLine: html("div", {
				class: "wc-border-line right"
			}),
			bottomLine: html("div", {
				class: "wc-border-line bottom"
			})
		};
	}

	getComputedAABBCollisions() {}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.setAttribute("borders", "top bottom");

		this.appendChild(
			html(
				"div",
				{ class: "wc-container" },
				html(
					"div",
					{ class: "wc-borders" },
					this.elements.topLine,
					this.elements.leftLine,
					this.elements.rightLine,
					this.elements.bottomLine
				),
				html(
					"div",
					{ class: "wc-slot" },
					html("slot", { name: "web-contents" })
				)
			)
		);
	}
}

customElements.define("browser-web-contents", BrowserWebContents);

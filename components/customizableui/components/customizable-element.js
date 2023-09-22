/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableElement extends MozHTMLElement {
	/**
	 * The schema used to validate attributes
	 */
	attributesSchema = {};

	constructor() {
		super();
	}

	get customizable() {
		return gDot.customizable;
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.classList.add("customizable-element");

		if (this.shadowRoot) {
			this.shadowRoot.prepend(
				html("link", {
					rel: "stylesheet",
					href: "chrome://dot/skin/browser.css"
				})
			);
		}
	}

	/**
	 * Appends a component to the customizable element
	 * @param {Node} node
	 */
	appendComponent(node) {
		this.appendChild(node);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;
	}
}

customElements.define("customizable-element", BrowserCustomizableElement);

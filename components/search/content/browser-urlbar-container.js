/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserUrlbarContainer extends BrowserUrlbarRoot {
	/**
	 * Inherit attributes from the urlbar parent
	 */
	#inheritAttributes() {
		const parent = this.parentElement;

		if (!(parent instanceof BrowserUrlbar)) {
			throw new Error(`Parent is not a urlbar element!`);
		}

		const customizableAttributes =
			parent.getAttribute("customizable-attrs") || "";

		for (const attribute of customizableAttributes.split(" ")) {
			const attributeValue = parent.getAttribute(attribute);

			this.setAttribute(attribute, attributeValue);
		}
	}

	connectedCallback() {
		super.connect("urlbar-container", {
			orientation: "horizontal",
			styles: [
				"chrome://dot/content/widgets/browser-urlbar-container.css"
			]
		});

		this.#inheritAttributes();
	}
}

customElements.define("browser-urlbar-container", BrowserUrlbarContainer);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserIcon extends HTMLElement {
	static get observedAttributes() {
		return ["name", "size"];
	}

	constructor() {
		super();
	}

	get name() {
		return this.getAttribute("name");
	}

	set name(newName) {
		this.setAttribute("name", newName);
	}

	get size() {
		return this.getAttribute("size");
	}

	set size(newSize) {
		this.setAttribute("size", newSize);
		this.style.setProperty("--size", newSize);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "src":
				if (newValue !== oldValue) {
					this.src = newValue;
				}
				break;
			case "size":
				if (newValue !== oldValue) {
					this.size = newValue;
				}
		}
	}
}

customElements.define("browser-icon", BrowserIcon);

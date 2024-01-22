/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ThemeIcons } = ChromeUtils.importESModule(
	"resource://gre/modules/ThemeIcons.sys.mjs"
);

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

		let src = ThemeIcons.getURI(newName);

		try {
			let uri = new URL(newName);

			if (uri.href) {
				src = newName;
			}
		} catch (e) {}

		this.style.setProperty("--src", `url(${CSS.escape(src)})`);
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
			case "name":
				if (newValue !== oldValue) {
					this.name = newValue;
				}
				break;
			case "size":
				if (newValue !== oldValue) {
					this.size = newValue;
				}
				break;
		}
	}
}

customElements.define("browser-icon", BrowserIcon);

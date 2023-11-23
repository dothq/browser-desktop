/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableTemplate extends MozHTMLElement {
	/**
	 * The contents of this customizable template
	 * @type {DocumentFragment}
	 */
	content = null;

	constructor() {
		super();

		this.content = document.createDocumentFragment();
	}
}

customElements.define(
	"browser-customizable-template",
	BrowserCustomizableTemplate
);

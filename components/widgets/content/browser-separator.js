/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserSeparator extends BrowserContextualMixin(MozHTMLElement) {
	/**
	 * The allowed customizable attributes for the group
	 */
	static get customizableAttributes() {
		return {
			orientation: "orientation"
		};
	}
}

customElements.define("browser-separator", BrowserSeparator);

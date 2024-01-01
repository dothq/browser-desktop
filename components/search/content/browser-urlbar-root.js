/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserUrlbarRoot extends BrowserCustomizableArea {
	/**
	 * The allowed customizable attributes for the urlbar
	 */
	static get customizableAttributes() {
		return {
			width: "flexibleDimension",
			height: "flexibleDimension",

			background: "namedColor",

			mode: "mode"
		};
	}

	/**
	 * The customizable components to inherit from when used in this area
	 */
	static get customizableComponents() {
		return {
			button: html("button", { is: "browser-urlbar-button" }),
			input: html("input", { is: "browser-urlbar-input" })
		};
	}

	/**
	 * The context for this urlbar
	 */
	get context() {
		const self = this;

		return {
			self,
			audience: CommandAudiences.URLBAR,

			get window() {
				return self.ownerGlobal;
			},

			get tab() {
				return this.window.gDot.tabs.selectedTab;
			},

			get browser() {
				return this.tab.linkedBrowser;
			}
		};
	}
}

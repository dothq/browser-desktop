/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIChannel} nsIChannel
 */

export const BrowserTabsUtils = {
	// Ensure that these icons match up with the actual page favicon
	// Reflect any changes here with base/content/browser-init.ts
	INTERNAL_PAGES: {
		"about:home": { title: "New Tab", icon: "chrome://dot/skin/home.svg" },
		"about:newtab": {
			title: "New Tab",
			icon: "chrome://dot/skin/home.svg"
		},
		"about:welcome": {
			title: "Welcome to Dot Browser",
			icon: "chrome://branding/content/icon32.png"
		},
		"about:privatebrowsing": {
			title: "Private Browsing",
			icon: "chrome://browser/skin/privatebrowsing/favicon.svg"
		}
	},

	/**
	 * Determines whether we should show the
	 * progress spinner for a particular page
	 *
	 * @param {nsIChannel} request
	 * @returns {boolean}
	 */
	shouldShowProgress(request) {
		return !(
			// @ts-ignore
			// prettier-ignore
			(request instanceof Ci.nsIChannel &&
				request.originalURI.schemeIs("about"))
		);
	}
};

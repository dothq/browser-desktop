/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { StartPage } = ChromeUtils.importESModule(
	"resource:///modules/StartPage.sys.mjs"
);

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIChannel} nsIChannel
 */

const DEFAULT_TAB_ICON = "chrome://dot/skin/icons/globe.svg";
const DEFAULT_TAB_LABEL = "Untitled";

export const BrowserTabsUtils = {
	DEFAULT_TAB_ICON,
	DEFAULT_TAB_LABEL,

	// Ensure that these icons match up with the actual page favicon
	// Reflect any changes here with base/content/browser-init.ts
	INTERNAL_PAGES: {
		"about:blank": {
			title: "New Tab",
			icon: DEFAULT_TAB_ICON
		},
		"about:home": {
			title: "New Tab",
			icon: "chrome://dot/skin/icons/home.svg"
		},
		"about:newtab": {
			title: "New Tab",
			icon: "chrome://dot/skin/icons/home.svg"
		},
		"about:welcome": {
			title: "Welcome to Dot Browser",
			icon: "chrome://branding/content/icon32.png"
		},
		"about:privatebrowsing": {
			title: "Private Browsing",
			icon: "chrome://browser/skin/privatebrowsing/favicon.svg"
		},
		"chrome://dot/content/startpage/blank.html": {
			title: "New Tab",
			icon: ""
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
				(
                    request.originalURI.schemeIs("about") ||
                !!this.INTERNAL_PAGES[request.originalURI.spec]))
		);
	},

	/**
	 * Determines whether the URL is considered to
	 * be a blank page.
	 *
	 * @param {string} url
	 * @returns {boolean}
	 */
	isBlankPageURL(url) {
		return (
			url == "about:blank" ||
			url == "about:home" ||
			StartPage.getHomePage().includes(url) ||
			url == "chrome://dot/content/startpage/blank.html"
		);
	}
};

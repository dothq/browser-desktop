/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
	PrivateBrowsingUtils: "resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
});

function getHomePagePref() {
	let homePage = Services.prefs.getStringPref("browser.startup.homepage");

	// If we end up with undefined or empty home pages
	// we just reset the value and try again..
	if (!homePage) {
		Services.prefs.clearUserPref("browser.startup.homepage");
		homePage = getHomePagePref().join("|");
	}

	// Split up the homepage string into an array
	// Filter out any empty strings
	return homePage.split("|").filter(Boolean);
}

/**
 * Keeps track of the user's start page settings and preferences
 */
export const StartPage = {
	/**
	 * Get the default start page(s)
	 */
	getHomePage() {
		let homePages = getHomePagePref();

		// Replace any instances of about:blank with chrome://dot/content/startpage/blank.html
		// This is to ensure we have "New Tab" branding
		if (homePages.includes("about:blank")) {
			homePages = homePages.map((page) =>
				page.startsWith("about:blank") ? "chrome://dot/content/startpage/blank.html" : page
			);
		}

		return homePages;
	}
};

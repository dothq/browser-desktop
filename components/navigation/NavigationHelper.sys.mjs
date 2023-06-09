/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";

/**
 * @typedef NavigationHelper
 * @property {function} openLinkIn
 */
export const NavigationHelper = {
	/**
	 * Helper function for opening a link in a specific context.
	 * @param {Window} win
	 * @param {string} url
	 * @param {"current" | "tab" | "tabshifted" | "window" | "save"} where
	 *    `current`: open in current tab
	 *
	 *    `tab`: open in a new tab
	 *
	 *    `tabshifted`: same as "tab" but in background if default is to select new tabs, and vice versa
	 *
	 *    `window`: open in new window
	 *
	 *    `save`: save to disk (with no filename hint!)
	 * @param {object} params
	 */
	openLinkIn(win, url, where, params) {
		/* @todo: add logic for openLinkIn */
	},

	/**
	 * Helper function to handle opening multiple URIs at once
	 * @param {Window} win
	 * @param {*} uriString
	 * @param {*} triggeringPrincipal
	 * @param {*} csp
	 */
	loadOneOrMoreURIs(win, uriString, triggeringPrincipal, csp) {
		// Check if the window is the browser window
		if (win.location.href != AppConstants.BROWSER_CHROME_URL) {
			// If not, just open a new browser window with the URIs passed along as arguments.
			win.openDialog(AppConstants.BROWSER_CHROME_URL, "_blank", "all,dialog=no", uriString);
			return;
		}

		// We could encounter malformed URIs here and we don't want to
		// interrupt start-up, so we just wrap it in a try catch.
		try {
			gBrowser.loadTabs(uriString.split("|"), {
				inBackground: false,
				replace: true,
				triggeringPrincipal,
				csp
			});
		} catch (e) {}
	}
};

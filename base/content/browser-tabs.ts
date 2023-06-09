/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
	ChromeBrowser,
	nsITabProgressListener,
	nsIWebProgressListener
} from "../../third_party/dothq/gecko-types/lib";

export const TabsProgressListener = {
	onLocationChange(browser, webProgress, request, location, flags) {
		// Check if this is a same-document navigation.
		// i.e. using web history APIs such as history.pushState.
		if (flags && flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) {
			// Reader mode cares about history.pushState and friends.
			// FIXME: The content process should manage this directly (bug 1445351).
			browser.sendMessageToActor(
				"Reader:PushState",
				{
					isArticle: browser.isArticle
				},
				"AboutReader"
			);
			return;
		}

		// We only care about top-level loads.
		if (!webProgress.isTopLevel) {
			return;
		}

		// Resets the current sharing state of the browser once we navigate away from the page.
		let tab = gBrowser.getTabForBrowser(browser);
		if (tab && tab._sharingState) {
			gBrowser.resetBrowserSharing(browser);
		}
	}
} as nsITabProgressListener;

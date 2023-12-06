/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class LinkHandlerParent extends JSWindowActorParent {
	receiveMessage(msg) {
		const browser = this.browsingContext.top.embedderElement;
		if (!browser) return;

		switch (msg.name) {
			case "Link:LoadingIcon": {
				if (!msg.data.canUseForTab) return;

				const { gDot } = browser.ownerGlobal;
				if (!gDot) return;

				const tab = gDot.tabs.getTabForWebContents(browser);
				if (!tab) return;

				if (tab.progress) {
					tab.toggleAttribute("pendingicon", true);
				}

				break;
			}
			case "Link:SetIcon": {
				this.setIcon(browser, msg.data.iconURL, msg.data.canUseForTab);
				break;
			}
			case "Link:SetFailedIcon": {
				if (!msg.data.canUseForTab) return;

				const { gDot } = browser.ownerGlobal;
				if (!gDot) return;

				const tab = gDot.tabs.getTabForWebContents(browser);
				if (!tab) return;

				this.clearPendingIcon(tab);
				break;
			}
			default:
				console.debug(`LinkHandlerParent: Unhandled event ${msg.name}`);
		}
	}

	/**
	 * Clears the pendingicon attribute from the tab
	 * @param {BrowserTab} tab
	 */
	clearPendingIcon(tab) {
		tab.removeAttribute("pendingicon");
	}

	/**
	 * Updates the icon of a browser
	 * @param {ChromeBrowser} browser
	 * @param {string} iconURL
	 * @param {boolean} canUseForTab
	 */
	setIcon(browser, iconURL, canUseForTab) {
		const { gDot } = browser.ownerGlobal;
		if (!gDot) return;

		const tab = gDot.tabs.getTabForWebContents(browser);
		if (!tab) return;

		if (canUseForTab) {
			this.clearPendingIcon(tab);
		}

		// Make sure a valid URL has been passed
		let uri;
		try {
			uri = Services.io.newURI(iconURL);
		} catch (e) {
			console.error("Failed to parse iconURL from LinkHandlerParent", e);
			return;
		}

		// If we're potentially loading a remote icon,
		// make sure our browser is able to load it
		if (uri.scheme !== "data") {
			try {
				Services.scriptSecurityManager.checkLoadURIWithPrincipal(
					browser.contentPrincipal,
					uri,
					Services.scriptSecurityManager.ALLOW_CHROME
				);
			} catch (e) {
				return;
			}
		}

		if (!canUseForTab) return;

		gDot.tabs.setIcon(tab, iconURL);
	}
}

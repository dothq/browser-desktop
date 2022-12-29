/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ["nsBrowserAccess", "XULBrowserWindow"];

class nsBrowserAccess {
	QueryInterface = ChromeUtils.generateQI(["nsIBrowserDOMWindow"]);

	_openURIInNewTab(
		uri,
		referrerInfo,
		isPrivate,
		isExternal,
		forceNotRemote = false,
		userContextId = Ci.nsIScriptSecurityManager.DEFAULT_USER_CONTEXT_ID,
		openWindowInfo = null,
		openerBrowser = null,
		triggeringPrincipal = null,
		name = "",
		csp = null,
		skipLoad = false
	) {
		console.log("_openURIInNewTab", {
			uri: uri ? uri.spec : "about:blank",
			triggeringPrincipal: triggeringPrincipal,
			referrerInfo: referrerInfo,
			userContextId: userContextId,
			fromExternal: isExternal,
			forceNotRemote: forceNotRemote,
			openWindowInfo: openWindowInfo,
			openerBrowser: openerBrowser,
			name: name,
			csp: csp,
			skipLoad: skipLoad
		});

		return null;
	}
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants, nsIURI } from "../../third_party/dothq/gecko-types/lib";
import { _gBrowser } from "./browser";
import { nsIXULBrowserWindow } from "./browser-window";

ChromeUtils.defineESModuleGetters(globalThis, {
	DevToolsShim: "chrome://devtools-startup/content/DevToolsShim.sys.mjs"
});

var { AppConstants } = ChromeUtils.importESModule<AppConstants>(
	"resource://gre/modules/AppConstants.sys.mjs"
);

const gPageIcons = {
	"about:home": "chrome://dot/skin/home.svg",
	"about:newtab": "chrome://dot/skin/home.svg",
	"about:welcome": "chrome://dot/skin/home.svg",
	"about:privatebrowsing": "chrome://browser/skin/privatebrowsing/favicon.svg"
};

var dBrowserInit = {
	_startTime: Date.now(),

	onBeforeInitialXULLayout() {
		// No point logging anything here as console logs won't
		// show up in stdout or DevTools
		// Shim setToolbarVisibility as we aren't using trad FF toolbars
		globalThis.setToolbarVisibility = shimFunction("setToolbarVisibility");

		gBrowserInit.onBeforeInitialXULLayout.bind(gBrowserInit)();
	},

	onDOMContentLoaded() {
		console.time("onDOMContentLoaded");

		// Shim updateFxaToolbarMenu as we aren't using traditional FF toolbars/menus
		globalThis.updateFxaToolbarMenu = shimFunction("updateFxaToolbarMenu", () => false);

		// Creates an nsIXULBrowserWindow instance to handle browser communication and events
		const XULBrowserWindow = new nsIXULBrowserWindow();

		window.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;
		globalThis.XULBrowserWindow = XULBrowserWindow;

		// Exposes dBrowser to global for debugging
		globalThis.gBrowser = _gBrowser;

		// Initialise gBrowser
		gBrowser.init();

		// Set favicons for special pages on boot to
		// create the illusion of faster load.
		gBrowserInit._callWithURIToLoad((uriToLoad: string) => {
			let url: nsIURI;

			try {
				url = Services.io.newURI(uriToLoad);
			} catch (e) {
				return;
			}

			const nonQuery = url.prePath + url.filePath;
			if (nonQuery in gPageIcons) {
				gBrowser.setIcon(gBrowser.selectedTab, gPageIcons[nonQuery]);
			}
		});

		gBrowserInit._setInitialFocus();
		gBrowserInit.domContentLoaded = true;

		console.timeEnd("onDOMContentLoaded");
	},

	onLoad() {
		console.time("onLoad");

		gBrowserInit.onLoad.bind(gBrowserInit)();

		console.timeEnd("onLoad");

		console.debug(`dBrowserInit: ready in ${Date.now() - this._startTime}ms`);
	},

	onUnload() {
		console.time("onUnload");

		gBrowserInit.onUnload.bind(gBrowserInit)();

		console.timeEnd("onUnload");
	},

	onWindowClosing(event: CloseEvent) {
		// Determines whether the browser is allowed to close
		return WindowIsClosing(event);
	}
};

globalThis.dBrowserInit = dBrowserInit; // Exposes dBrowserInit to global for debugging

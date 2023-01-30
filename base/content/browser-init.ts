/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { dBrowser } from "./browser";
import { nsIXULBrowserWindow } from "./browser-window";

/* Firefox scripts */
[
	"chrome://global/content/contentAreaUtils.js",

	"chrome://browser/content/browser-captivePortal.js",
	"chrome://browser/content/browser-pageActions.js",
	"chrome://browser/content/browser-sidebar.js",
	"chrome://browser/content/browser-tabsintitlebar.js",

	"chrome://browser/content/tabbrowser.js",
	"chrome://browser/content/tabbrowser-tab.js",
	"chrome://browser/content/tabbrowser-tabs.js",

	"chrome://browser/content/places/places-menupopup.js",

	"chrome://browser/content/search/autocomplete-popup.js",
	"chrome://browser/content/search/searchbar.js"
].map((resourceURI) => Services.scriptloader.loadSubScript(resourceURI, window));

ChromeUtils.defineESModuleGetters(globalThis, {
	DevToolsShim: "chrome://devtools-startup/content/DevToolsShim.sys.mjs"
});

export const dBrowserInit = {
	_startTime: Date.now(),

	onBeforeInitialXULLayout() {
		console.time("onBeforeInitialXULLayout");

		// Shim setToolbarVisibility as we aren't using trad FF toolbars
		window.setToolbarVisibility = shimFunction("setToolbarVisibility", () => {});

		gBrowserInit.onBeforeInitialXULLayout.bind(gBrowserInit)();

		console.timeEnd("onBeforeInitialXULLayout");
	},

	onDOMContentLoaded() {
		console.time("onDOMContentLoaded");

		// Shim updateFxaToolbarMenu as we aren't using trad FF toolbars/menus
		window.updateFxaToolbarMenu = shimFunction("updateFxaToolbarMenu", () => false);

		gBrowserInit.onDOMContentLoaded.bind(gBrowserInit)();

		// Creates an nsIXULBrowserWindow instance to handle browser communication and events
		const XULBrowserWindow = new nsIXULBrowserWindow();

		window.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;

		window.XULBrowserWindow = XULBrowserWindow;

		// Exposes dBrowser to global for debugging
		globalThis.dBrowser = dBrowser;
		dBrowser.init();

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

/* Initialise events */
window.addEventListener("load", dBrowserInit.onLoad.bind(dBrowserInit));
window.addEventListener("unload", dBrowserInit.onUnload.bind(dBrowserInit));
window.addEventListener("close", dBrowserInit.onWindowClosing);

window.addEventListener(
	"MozBeforeInitialXULLayout",
	dBrowserInit.onBeforeInitialXULLayout.bind(dBrowserInit),
	{ once: true }
);

window.addEventListener("DOMContentLoaded", dBrowserInit.onDOMContentLoaded.bind(dBrowserInit), {
	once: true
});

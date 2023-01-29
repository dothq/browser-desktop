/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

const { DotAppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/DotAppConstants.sys.mjs"
);

const { DotCustomizableUI } = ChromeUtils.importESModule(
	"resource://dot/components/customizableui/CustomizableUI.js"
);

class BrowserInit {
	private _startTime = Date.now();

	onBeforeInitialXULLayout() {
		console.time("onBeforeInitialXULLayout");

		window.setToolbarVisibility = shimFunction("setToolbarVisibility", () => {});

		gBrowserInit.onBeforeInitialXULLayout.bind(gBrowserInit)();

		console.timeEnd("onBeforeInitialXULLayout");
	}

	onDOMContentLoaded() {
		console.time("onDOMContentLoaded");

		window.updateFxaToolbarMenu = shimFunction("updateFxaToolbarMenu", () => false);

		gBrowserInit.onDOMContentLoaded.bind(gBrowserInit)();

		const XULBrowserWindow = new nsIXULBrowserWindow();

		window.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;

		window.XULBrowserWindow = XULBrowserWindow;

		console.timeEnd("onDOMContentLoaded");
	}

	onLoad() {
		console.time("onLoad");

		gBrowserInit.onLoad.bind(gBrowserInit)();

		console.timeEnd("onLoad");

		console.debug(`dBrowserInit: ready in ${Date.now() - this._startTime}ms`);
	}

	onUnload() {
		console.time("onUnload");

		gBrowserInit.onUnload.bind(gBrowserInit)();

		console.timeEnd("onUnload");
	}

	onWindowClosing() {
		WindowIsClosing();
	}
}

export const dBrowserInit = new BrowserInit();

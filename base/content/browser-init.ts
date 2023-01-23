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

const importESModules = () => {
	Object.entries({
		DevToolsShim: "chrome://devtools-startup/content/DevToolsShim.sys.mjs",
		DotAppConstants: "resource://gre/modules/DotAppConstants.sys.mjs"
	}).map(([mod, resourceURI]) => (window[mod] = ChromeUtils.importESModule(resourceURI)[mod]));

	Object.entries({
		DotCustomizableUI: "resource://dot/components/customizableui/CustomizableUI.js"
	}).map(async ([mod, resourceURI]) => (window[mod] = (await import(resourceURI))[mod]));
};

/* Initialise FF events */
window.addEventListener("load", gBrowserInit.onLoad.bind(gBrowserInit));
window.addEventListener("unload", gBrowserInit.onUnload.bind(gBrowserInit));
window.addEventListener("close", WindowIsClosing);

window.addEventListener(
	"MozBeforeInitialXULLayout",
	(...args) => {
		window.setToolbarVisibility = shimFunction("setToolbarVisibility");

		gBrowserInit.onBeforeInitialXULLayout.bind(gBrowserInit)(...args);

		importESModules();
	},
	{ once: true }
);

window.addEventListener(
	"DOMContentLoaded",
	(...args) => {
		window.updateFxaToolbarMenu = shimFunction("updateFxaToolbarMenu", () => false);

		gBrowserInit.onDOMContentLoaded.bind(gBrowserInit)(...args);

		importESModules();
	},
	{
		once: true
	}
);

/* Initialise Dot Browser events */
window.addEventListener("load", () => {
	window.DotCustomizableUI.initialize();
});
window.addEventListener(
	"DOMContentLoaded",
	() => {
		const XULBrowserWindow = new nsIXULBrowserWindow();

		window.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;

		window.XULBrowserWindow = XULBrowserWindow;
	},
	{ once: true }
);

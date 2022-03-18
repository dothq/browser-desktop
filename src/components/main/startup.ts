/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Ci } from "browser/mozilla";

export class TabBrowserStartup {
	public onBeforeInitialXULLayout() {
		console.log("gBrowserInit: onBeforeInitialXULLayout");
	}

	public onDOMContentLoaded() {
		console.log("gBrowserInit: onDOMContentLoaded");

		const TARGET_WIDTH = 1280;
		const TARGET_HEIGHT = 1040;
		const width = Math.min(screen.availWidth * 0.9, TARGET_WIDTH);
		const height = Math.min(
			screen.availHeight * 0.9,
			TARGET_HEIGHT
		);

		document.documentElement.setAttribute(
			"width",
			width.toString()
		);
		document.documentElement.setAttribute(
			"height",
			height.toString()
		);

		if (width < TARGET_WIDTH && height < TARGET_HEIGHT) {
			document.documentElement.setAttribute(
				"sizemode",
				"maximized"
			);
		}

		window.resizeTo(width, height);

		window.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow =
			window.XULBrowserWindow;

		// window.browserDOMWindow = new nsBrowserAccess();

		window.gBrowser = window._gBrowser;
		delete window._gBrowser;
		gBrowser.init();

		// BrowserWindowTracker.track(window);
	}

	public onLoad() {
		console.log("gBrowserInit: onLoad");
	}

	public onUnload() {
		console.log("gBrowserInit: onUnload");
	}
}

const instance = new TabBrowserStartup();
window.gBrowserInit = instance;

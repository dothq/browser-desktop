/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "@components/browser-element/BrowserElement";

import * as Gecko from "gecko-types/lib";

const { AppConstants } = ChromeUtils.import<Gecko.AppConstants>(
	"resource://gre/modules/AppConstants.jsm"
);

const { XPCOMUtils } = ChromeUtils.import<Gecko.XPCOMUtils>(
	"resource://gre/modules/XPCOMUtils.jsm"
);

const { DotUtils } = ChromeUtils.import<any>("resource://app/modules/DotUtils.jsm");

const { nsBrowserAccess, XULBrowserWindow } = ChromeUtils.import<any>(
	"resource://app/modules/DotBrowserWindow.jsm"
);

const lazy: any = {};

XPCOMUtils.defineLazyModuleGetters(lazy, {
	Color: "resource://gre/modules/Color.jsm",
	WindowsVersionInfo: "resource://gre/modules/components-utils/WindowsVersionInfo.jsm"
});

interface CommandEvent extends Event {
	command: string;
}

class BrowserInit {
	private _boundDelayedStartup: typeof this.delayedStartup | null = null;

	public delayedStartupFinished: boolean = false;

	onBeforeInitialXULLayout() {
		if (!document.documentElement.hasAttribute("width")) {
			const defaultHeight = screen.availHeight;
			const defaultWidth = screen.availWidth <= 1024 ? screen.availWidth : 1024;

			if (defaultHeight <= 600) {
				document.documentElement.setAttribute("sizemode", "maximized");
			}

			document.documentElement.setAttribute("width", defaultWidth.toString());
			document.documentElement.setAttribute("height", defaultHeight.toString());
			document.documentElement.setAttribute("screenX", screen.availLeft.toString());
			document.documentElement.setAttribute("screenY", screen.availTop.toString());
		}

		if (AppConstants.platform == "win") {
			// On Win8 set an attribute when the window frame color is too dark for black text.
			if (
				matchMedia("(-moz-platform: windows-win8)").matches &&
				matchMedia("(-moz-windows-default-theme)").matches
			) {
				const { Windows8WindowFrameColor } = ChromeUtils.import<{ get: () => number[] }>(
					"resource:///modules/Windows8WindowFrameColor.jsm"
				);

				const frameColor = new lazy.Color(...Windows8WindowFrameColor.get());
				// Default to black for foreground text.
				if (!frameColor.isContrastRatioAcceptable(new lazy.Color(0, 0, 0))) {
					document.documentElement.setAttribute("darkwindowframe", "true");
				}
			} else if (AppConstants.isPlatformAndVersionAtLeast("win", "10")) {
				// 17763 is the build number of Windows 10 version 1809
				if (lazy.WindowsVersionInfo.get().buildNumber < 17763) {
					document.documentElement.setAttribute(
						"always-use-accent-color-for-window-border",
						""
					);
				}
			}
		}
	}

	loadComponentsAtStartup() {
		// Create our application UI
		// ----

		Services.obs.notifyObservers(window, "browser-startup-done");
	}

	delayedStartup() {
		this.cancelDelayedStartup();

		Services.search.init();

		requestIdleCallback(function () {
			if (!window.closed) {
				Services.obs.notifyObservers(window, "browser-idle-startup-tasks-finished");
			}
		});

		this.delayedStartupFinished = true;
		Services.obs.notifyObservers(window, "browser-delayed-startup-finished");

		// Notify observer to resolve the browserStartupPromise
		Services.obs.notifyObservers(window, "extensions-late-startup");

		this.loadComponentsAtStartup();
	}

	onMessageReceived(event: MessageEvent) {
		DotUtils.match(event.data, {
			_: (data: string) => console.log(`message: (unknown) ${data} ${event}`)
		});
	}

	onLoad() {
		window.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;

		window.browserDOMWindow = new nsBrowserAccess();

		if (!Services.policies.isAllowed("devtools")) {
			/* @todo */
		}

		// Register tabs here / first tab
		// ---

		window.addEventListener("AppCommand", this.onAppCommand, true);

		this._boundDelayedStartup = this.delayedStartup.bind(this);
		window.addEventListener("MozAfterPaint", this._boundDelayedStartup);

		// Listen for global message events
		window.addEventListener("message", this.onMessageReceived);
	}

	cancelDelayedStartup() {
		window.removeEventListener("MozAfterPaint", this._boundDelayedStartup);

		this._boundDelayedStartup = null;
	}

	onAppCommand(event: CommandEvent) {
		event.stopPropagation();

		DotUtils.match(event.command.toLowerCase(), {
			back: console.log("command: back"),
			forward: console.log("command: forward"),
			stop: console.log("command: stop"),
			search: console.log("command: search"),
			bookmarks: console.log("command: bookmarks"),
			home: console.log("command: home"),
			reload: console.log("command: reload"),
			_: (cmd: string) => console.log(`command: (unknown) ${cmd}`)
		});
	}

	onUnload() {
		window.browserDOMWindow = null;
	}
}

const gBrowserInit = new BrowserInit();

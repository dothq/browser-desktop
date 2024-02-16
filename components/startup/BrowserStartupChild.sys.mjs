/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { DotBrowserWindow } = ChromeUtils.importESModule(
	"resource:///modules/DotBrowserWindow.sys.mjs"
);

const { XULBrowserWindow: nsIXULBrowserWindow } = ChromeUtils.importESModule(
	"resource:///modules/XULBrowserWindow.sys.mjs"
);

const { DotWindowTracker } = ChromeUtils.importESModule(
	"resource:///modules/DotWindowTracker.sys.mjs"
);

const { LightweightThemeConsumer } = ChromeUtils.importESModule(
	"resource://gre/modules/LightweightThemeConsumer.sys.mjs"
);

const { NativeTitlebar } = ChromeUtils.importESModule(
	"resource:///modules/NativeTitlebar.sys.mjs"
);

const { AccentColorManager } = ChromeUtils.importESModule(
	"resource://gre/modules/AccentColorManager.sys.mjs"
);

const { AccessibilityFocus } = ChromeUtils.importESModule(
	"resource://gre/modules/AccessibilityFocus.sys.mjs"
);

export class BrowserStartupChild extends JSWindowActorChild {
	/**
	 * Fired before the XUL layout is fully initialised
	 * @param {Event} event
	 */
	onBeforeInitialXULLayout(event) {
		console.log("onBeforeInitialXULLayout");

		NativeTitlebar.init(this.document);

		new LightweightThemeConsumer(this.document);
		new AccentColorManager(this.document);

		new AccessibilityFocus(this.contentWindow);
	}

	/**
	 * Fired before the DOM content is loaded
	 * @param {Event} event
	 */
	onDOMContentLoaded(event) {
		console.log("onDOMContentLoaded");

		// Creates an nsIXULBrowserWindow instance to
		// handle browser communication and events
		const XULBrowserWindow = new nsIXULBrowserWindow(this.contentWindow);

		this.contentWindow.docShell.treeOwner
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;
		this.contentWindow.XULBrowserWindow = XULBrowserWindow;

		// Create DotBrowserWindow instance to handle
		// browser navigation events.
		this.contentWindow.browserDOMWindow = new DotBrowserWindow(
			this.contentWindow
		);

		this.#initBrowser();

		DotWindowTracker.track(this.contentWindow);
	}

	/**
	 * Fired when the window is fully loaded
	 * @param {Event} event
	 */
	onLoad(event) {
		console.log("onLoad");

		Services.obs.notifyObservers(
			this.contentWindow,
			"browser-window-ready"
		);

		this.sendAsyncMessage("Startup::WindowLoaded");
	}

	/**
	 * Fired when the window is starts to unload
	 * @param {Event} event
	 */
	onUnload(event) {
		console.log("onUnload");
	}

	/**
	 * Fired when the window is begins to close
	 * @param {Event} event
	 */
	onClose(event) {
		console.log("onClose");
	}

	/**
	 * Initialises the gDot global on the window
	 */
	#initBrowser() {
		/** @type {BrowserApplication} */
		let gDot = this.document.querySelector("browser-application");

		if (!gDot) {
			gDot = /** @type {BrowserApplication} */ (
				this.document.createElement("browser-application")
			);
			this.document.body.appendChild(gDot);
		}

		if (!this.contentWindow.gDot) {
			Object.defineProperty(this.contentWindow, "gDot", {
				get: () => gDot
			});

			// @ts-ignore
			delete this.contentWindow._gDot;
		}

		console.log(gDot);

		gDot.init();
	}

	/**
	 * Handles incoming events to the browser startup actor
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "MozBeforeInitialXULLayout":
				this.onBeforeInitialXULLayout(event);
				break;
			case "DOMContentLoaded":
				this.onDOMContentLoaded(event);
				break;
			case "load":
				this.onLoad(event);
				break;
			case "unload":
				this.onUnload(event);
				break;
			case "close":
				this.onClose(event);
				break;
		}
	}
}

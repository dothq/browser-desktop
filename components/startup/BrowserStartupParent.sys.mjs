/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ProcessArguments } = ChromeUtils.importESModule(
	"resource://gre/modules/ProcessArguments.sys.mjs"
);

const { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

export class BrowserStartupParent extends JSWindowActorParent {
	/**
	 * The window associated with this startup parent
	 */
	get win() {
		return this.browsingContext.window;
	}

	/**
	 * Fired when the chrome window is done loading
	 */
	onWindowLoaded() {
		console.log("onWindowLoaded");

		this.startDelayedStartup();
	}

	/**
	 * Starts the delayed startup process for the chrome window
	 */
	startDelayedStartup() {
		this._boundDelayedStartup = this.#delayedStartup.bind(this);
		this.win.addEventListener("MozAfterPaint", this._boundDelayedStartup);
	}

	/**
	 * Cancels the delayed startup process
	 */
	cancelDelayedStartup() {
		this.win.removeEventListener(
			"MozAfterPaint",
			this._boundDelayedStartup
		);
		this._boundDelayedStartup = null;
	}

	/**
	 * The delayed startup process
	 */
	#delayedStartup() {
		console.log("delayedStartup");

		this.cancelDelayedStartup();

		// Initialise the hidden DOM window here, as we need it for macOS.
		// hiddenDOMWindow is used to call certain APIs, especially from the
		// menu bar/context menus when a main browser window is not available.
		Services.appShell.hiddenDOMWindow;

		// Notifies browser tabs that we need to handle the load URI
		Services.obs.notifyObservers(this.win, "browser-handle-uri-to-load");

		this.#handleURIToLoad();

		this.delayedStartupFinished = true;

		Services.obs.notifyObservers(
			this.win,
			"browser-delayed-startup-finished"
		);
	}

	/**
	 * Handles the initial URI load process on browser tabs
	 */
	#handleURIToLoad() {
		const {
			argLength,
			uriToLoad,
			userContextId,
			triggeringPrincipal,
			allowInheritPrincipal,
			csp,
			fromExternal,
			referrerInfo,
			postData,
			allowThirdPartyFixup,
			originPrincipal,
			originStoragePrincipal,
			forceAboutBlankViewerInCurrent,
			forceAllowDataURI,
			hasValidUserGestureActivation,
			triggeringRemoteType
		} = ProcessArguments.getArguments(this.win);

		// If we don't have a URL to load, we don't need to do anything
		if (!uriToLoad) return;

		// We need to check if the URL is a string or an array
		// Handle these cases separately, but we don't need to
		// handle XULElement as it has already been handled and
		// cleared.
		if (Array.isArray(uriToLoad)) {
			// If the URI is malformed, loadTabs will throw an exception.
			// Ensure we handle this to not disrupt the browser boot.
			try {
				this.win.gDot.tabs.createTabs(uriToLoad, {
					inBackground: false,
					replaceInitialTab: true,
					userContextId,
					triggeringPrincipal,
					allowInheritPrincipal,
					csp,
					fromExternal
				});
			} catch (e) {
				console.error("Failed to create multiple tabs", e);
			}
		} else if (argLength >= 3) {
			try {
				NavigationHelper.openLinkIn(this.win, uriToLoad, "current", {
					referrerInfo,
					postData,
					allowThirdPartyFixup: allowThirdPartyFixup || false,
					userContextId,
					originPrincipal,
					originStoragePrincipal,
					triggeringPrincipal,
					allowInheritPrincipal: allowInheritPrincipal,
					csp,
					forceAboutBlankViewerInCurrent,
					forceAllowDataURI,
					hasValidUserGestureActivation,
					fromExternal,
					triggeringRemoteType
				});
			} catch (e) {
				console.error("Failed to load URI into current tab", e);
			}

			this.win.focus();
		} else {
			// Note: loadOneOrMoreURIs *must not* be called if window.arguments.length >= 3.
			// Such callers expect that window.arguments[0] is handled as a single URI.
			NavigationHelper.loadOneOrMoreURIs(
				this.win,
				uriToLoad,
				Services.scriptSecurityManager.getSystemPrincipal(),
				null
			);
		}
	}

	/**
	 *
	 * @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument} message
	 */
	receiveMessage(message) {
		switch (message.name) {
			case "Startup::WindowLoaded":
				this.onWindowLoaded();
				break;
		}
	}
}

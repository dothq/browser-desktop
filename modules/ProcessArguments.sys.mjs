/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { XPCOMUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/XPCOMUtils.sys.mjs"
);

const lazy = {};

XPCOMUtils.defineLazyServiceGetters(lazy, {
	BrowserHandler: ["@mozilla.org/browser/clh;1", "nsIBrowserHandler"]
});

const { DEFAULT_USER_CONTEXT_ID } = Ci.nsIScriptSecurityManager;

export const ProcessArguments = {
	/**
	 * Returns the raw arguments list from the window
	 * @param {Window} win
	 */
	_getArgv(win) {
		return win.arguments;
	},

	/**
	 * Obtains the URI to load from process argv
	 * @param {any[]} args
	 */
	_handleURIToLoad(args) {
		let uri = args[0];

		if (!uri || uri instanceof Element) {
			return null;
		}

		const { defaultArgs } = lazy.BrowserHandler;

		// If the given URI is different from the homepage, we want to load it.
		if (uri != defaultArgs) {
			if (uri instanceof Ci.nsIArray) {
				// Transform the nsIArray of nsISupportsString's into a JS Array of
				// JS strings.
				return Array.from(
					/** @type {any} */ (uri).enumerate(Ci.nsISupportsString),
					(supportStr) => supportStr.data
				);
			} else if (uri instanceof Ci.nsISupportsString) {
				return uri.data;
			}
		}

		return uri;
	},

	/**
	 * Obtains the tab to adopt
	 * @param {Window} win
	 * @param {any[]} args
	 * @returns
	 */
	_handleTabToAdopt(win, args) {
		let tab = args[0];

		if (!tab || !(tab instanceof Element)) {
			return null;
		}

		if (!(tab instanceof win.customElements.get("browser-tab"))) {
			return null;
		}

		return tab;
	},

	/**
	 * Returns the arguments from the window
	 * @param {Window} win
	 */
	getArguments(win) {
		const processArgv = this._getArgv(win);

		const args = {
			argLength: processArgv.length,
			uriToLoad: null,
			tabToAdopt: null,
			userContextId: null,
			triggeringPrincipal: null,
			allowInheritPrincipal: null,
			csp: null,
			fromExternal: null,
			hasValidUserGestureActivation: null,
			triggeringRemoteType: null,
			forceAllowDataURI: null,
			wasSchemelessInput: null,
			referrerInfo: null,
			postData: null,
			allowThirdPartyFixup: null,
			originPrincipal: null,
			originStoragePrincipal: null,
			forceAboutBlankViewerInCurrent: null,
			openWindowInfo: null
		};

		const uriToLoad = this._handleURIToLoad(processArgv);
		args.uriToLoad = uriToLoad;

		const tabToAdopt = this._handleTabToAdopt(win, processArgv);
		args.tabToAdopt = tabToAdopt;

		if (Array.isArray(uriToLoad)) {
			args.userContextId = processArgv[5];
			args.triggeringPrincipal =
				processArgv[8] ||
				Services.scriptSecurityManager.getSystemPrincipal();
			args.allowInheritPrincipal = processArgv[9];
			args.csp = processArgv[10];
			args.fromExternal = true;
		} else if (processArgv.length >= 3) {
			args.userContextId =
				processArgv[5] != undefined
					? processArgv[5]
					: DEFAULT_USER_CONTEXT_ID;

			const extraOptions = processArgv[1];

			if (extraOptions) {
				if (!(extraOptions instanceof Ci.nsIPropertyBag2)) {
					throw new Error(
						"window.arguments[1] must be null or Ci.nsIPropertyBag2!"
					);
				}

				args.hasValidUserGestureActivation =
					extraOptions.hasKey("hasValidUserGestureActivation") &&
					extraOptions.getPropertyAsBool(
						"hasValidUserGestureActivation"
					);

				args.fromExternal =
					extraOptions.hasKey("fromExternal") &&
					extraOptions.getPropertyAsBool("fromExternal");

				if (extraOptions.hasKey("triggeringRemoteType")) {
					args.triggeringRemoteType =
						extraOptions.getPropertyAsACString(
							"triggeringRemoteType"
						);
				}

				args.forceAllowDataURI =
					extraOptions.hasKey("forceAllowDataURI") &&
					extraOptions.getPropertyAsBool("forceAllowDataURI");

				args.wasSchemelessInput =
					extraOptions.hasKey("wasSchemelessInput") &&
					extraOptions.getPropertyAsBool("wasSchemelessInput");
			}

			args.referrerInfo = processArgv[2];
			args.postData = processArgv[3];
			args.allowThirdPartyFixup = processArgv[4];
			args.originPrincipal = processArgv[6];
			args.originStoragePrincipal = processArgv[7];
			args.triggeringPrincipal = processArgv[8];
			args.allowInheritPrincipal = processArgv[9] !== false;
			args.csp = processArgv[10];
			args.forceAboutBlankViewerInCurrent = !!args.originPrincipal;
			args.openWindowInfo = processArgv[11];
		} else {
			args.triggeringPrincipal =
				Services.scriptSecurityManager.getSystemPrincipal();
			args.csp = null;
		}

		return args;
	}
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { XPCOMUtils } from "resource://gre/modules/XPCOMUtils.sys.mjs";

const { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
	DotWindowTracker: "resource:///modules/DotWindowTracker.sys.mjs",
	FirstStartup: "resource://gre/modules/FirstStartup.sys.mjs",
	PrivateBrowsingUtils: "resource://gre/modules/PrivateBrowsingUtils.sys.mjs",
	StartPage: "resource:///modules/StartPage.sys.mjs"
});

/**
 * Determines whether this window is in kiosk mode.
 */
let gKiosk = false;

/**
 * Determines whether this window is the first one to be opened.
 */
let gFirstWindow = false;

/**
 * List of allowed local schemes for --chrome param
 */
let localSchemes = new Set(["chrome", "file", "resource"]);

/**
 * Checks whether we are allowed to load a certain URI into a browser window.
 * @param {import("third_party/dothq/gecko-types/lib").nsIURI} uri
 * @returns {boolean}
 */
function shouldLoadURI(uri) {
	if (uri) {
		// Block direct loading of chrome URIs into the browser window.
		// --chrome param should be used instead.
		if (uri.schemeIs("chrome")) {
			dump(
				"*** Preventing external load of chrome: URI into browser window\n"
			);
			dump("    Use --chrome <uri> instead\n");

			return false;
		} else {
			return true;
		}
	}

	return false;
}

// Resolves a URI from a command line argument.
function resolveURIInternal(cmdLine, argument) {
	let uri = cmdLine.resolveURI(argument);
	const { FIXUP_FLAG_FIX_SCHEME_TYPOS } = Services.uriFixup;

	// If the URI is not a file URI, we can just return it.
	if (!(uri instanceof Ci.nsIFileURL)) {
		return Services.uriFixup.getFixupURIInfo(
			argument,
			FIXUP_FLAG_FIX_SCHEME_TYPOS
		).preferredURI;
	}

	// Check if the file URI exists, otherwise throw an error and try to fix it up later on.
	try {
		if (uri.file.exists()) {
			return uri;
		}
	} catch (e) {
		console.error(e);
	}

	// Try fix up the file URI, even though it's not an existing file.
	try {
		uri = Services.uriFixup.getFixupURIInfo(argument).preferredURI;
	} catch (e) {
		console.error(e);
	}

	// If all else fails, just return the URI as is.
	return uri;
}

/**
 * Gets the browser chrome URL
 * @returns {string}
 */
function getBrowserURL() {
	return AppConstants.BROWSER_CHROME_URL;
}

/**
 * Opens a new browser window
 */
function openWindow(
	cmdLine,
	urlOrUrlList,
	triggeringPrincipal,
	postData = null,
	forcePrivate = false
) {
	// Check if we are in the intial startup phase
	const isStartup =
		cmdLine && cmdLine.state == Ci.nsICommandLine.STATE_INITIAL_LAUNCH;

	let args;

	if (!urlOrUrlList) {
		// If we don't have any URL(s) passed to the command line, we'll
		// just use the default arguments for the browser window.
		console.log("default args", [gDotContentHandler.getArgs()]);
		args = [gDotContentHandler.getArgs()];
	} else if (Array.isArray(urlOrUrlList)) {
		// If we have a list of urls, we'll pass them to the browser window.

		// Ensure we have a system-level triggeringPrincipal set for the request
		if (
			!triggeringPrincipal ||
			!triggeringPrincipal.equals(
				Services.scriptSecurityManager.getSystemPrincipal()
			)
		) {
			throw new Error(
				"Can't open multiple URLs with something other than system principal."
			);
		}

		// Create a new mutable array instance for us to put our URIs into
		// Avoids having to join each URI with a vertical pipe character
		const uriArray = Cc["@mozilla.org/array;1"].createInstance(
			Ci.nsIMutableArray
		);

		// Iterate over each url and add it to our array
		urlOrUrlList.forEach((uri) => {
			const sstring = Cc["@mozilla.org/supports-string;1"].createInstance(
				Ci.nsISupportsString
			);

			sstring.data = uri;

			uriArray.appendElement(sstring);
		});

		// Pass the array as the first argument to the browser window
		args = [uriArray];
	} else {
		// Create a new writeble property bag instance for us to put our extra options into
		const writablePropBag = Cc[
			"@mozilla.org/hash-property-bag;1"
		].createInstance(Ci.nsIWritablePropertyBag2);

		writablePropBag.setPropertyAsBool("fromExternal", true);

		// Always pass at least 3 arguments to avoid the "|"-splitting behavior,
		// ie. avoid the loadOneOrMoreURIs function.
		args = [
			urlOrUrlList,
			writablePropBag,
			null, // refererInfo
			postData,
			undefined, // allowThirdPartyFixup; this would be `false` but that
			// needs a conversion. Hopefully bug 1485961 will fix.
			undefined, // user context id
			null, // origin principal
			null, // origin storage principal
			triggeringPrincipal
		];
	}

	// Convert our arguments to something sensible that the browser window can understand
	if (!urlOrUrlList) {
		// If we haven't passed any URL(s) to the browser window, we can
		// just wrap the default arguments in a nsISupportsString instance.
		const str = Cc["@mozilla.org/supports-string;1"].createInstance(
			Ci.nsISupportsString
		);

		str.data = args[0]; // args[0] is the URI string
		args[0] = str;
	} else {
		// Otherwise, pass an nsIArray.
		if (args.length > 1) {
			// Ensure that the URI is wrapped in a nsISupportsString instance.
			let str = Cc["@mozilla.org/supports-string;1"].createInstance(
				Ci.nsISupportsString
			);

			str.data = args[0]; // args[0] is the URI string
			args[0] = str;
		}

		let arr = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);

		// Iterate over each argument and add it to our array
		args.forEach((a) => {
			arr.appendElement(a);
		});

		args = arr;
	}

	console.log("openWindow", args);

	// Finally, open the browser window with our arguments
	return lazy.DotWindowTracker.openWindow({
		args,
		features: gDotContentHandler.getFeatures(cmdLine),
		private: forcePrivate
	});
}

/**
 * Handles a URI to an existing browser window
 * @param {any} cmdLine
 * @param {typeof Ci.nsIURI} uri
 * @param {number} location
 * @param {any} triggeringPrincipal
 * @param {boolean} forcePrivate
 * @returns
 */
function handURIToExistingBrowser(
	cmdLine,
	uri,
	location,
	triggeringPrincipal,
	forcePrivate
) {
	// If we are not allowed to load the URI, just return.
	if (!shouldLoadURI(uri)) return;

	console.log("handURIToExistingBrowser", uri);

	const openURIInWindow = (win) =>
		win.browserDOMWindow.openURI(
			uri,
			null,
			location,
			Ci.nsIBrowserDOMWindow.OPEN_EXTERNAL,
			triggeringPrincipal
		);

	// Only if we are in a permanent private browsing state can we use
	// this, or if we have forced a private session with forcePrivate.
	const inPrivateMode =
		forcePrivate || lazy.PrivateBrowsingUtils.permanentPrivateBrowsing;

	const topWin = lazy.DotWindowTracker.getTopWindow({
		private: inPrivateMode
	});

	// If we have a top window, we should load the URI into this window.
	if (topWin) return openURIInWindow(topWin);

	// If there isn't an available browser window, just make a new one.
	openWindow(
		cmdLine,
		uri,
		triggeringPrincipal,
		null, // postData
		forcePrivate
	);
}

function openPreferences(cmdLine) {
	const uri = Services.io.newURI("about:preferences");

	// Open the preferences in a window
	openWindow(
		cmdLine,
		uri,
		Services.scriptSecurityManager.getSystemPrincipal(),
		null, // postData
		false // forcePrivate
	);
}

/**
 * Checks if a URI is considered "local" to be loaded safely in --chrome param
 * @param {*} uri
 * @returns
 */
function isLocal(uri) {
	if (uri instanceof Ci.nsINestedURI) {
		uri = uri.QueryInterface(Ci.nsINestedURI).innerMostURI;
	}

	return localSchemes.has(uri.scheme);
}

// @todo: implement -search argument
// XXX: not implemented
function doSearch(searchParam, cmdLine) {
	return;
}

export class nsDotContentHandler {
	QueryInterface = ChromeUtils.generateQI([
		"nsICommandLineHandler",
		"nsIBrowserHandler",
		"nsIContentHandler",
		"nsICommandLineValidator"
	]);

	get kiosk() {
		return gKiosk;
	}

	get defaultArgs() {
		console.log("nsDotContentHandler::defaultArgs");
		return this.getArgs();
	}

	mFeatures = null;

	// Get all the chrome features needed for bootstrapping the browser window
	getFeatures(cmdLine) {
		if (this.mFeatures === null) {
			this.mFeatures = "";

			if (cmdLine) {
				try {
					const width = cmdLine.handleFlagWithParam("width", false);
					const height = cmdLine.handleFlagWithParam("height", false);
					const left = cmdLine.handleFlagWithParam("left", false);
					const top = cmdLine.handleFlagWithParam("top", false);

					if (width) this.mFeatures += ",width=" + width;
					if (height) this.mFeatures += ",height=" + height;
					if (left) this.mFeatures += ",left=" + left;
					if (top) this.mFeatures += ",top=" + top;
				} catch (e) {}
			}

			// The global PB Service consumes this flag, so only eat it in per-window
			// PB builds.
			if (lazy.PrivateBrowsingUtils.isInTemporaryAutoStartMode) {
				this.mFeatures += ",private";
			}
		}

		return this.mFeatures;
	}

	// Get the default arguments provided to the browser window
	getArgs() {
		if (!gFirstWindow) {
			gFirstWindow = true;

			if (lazy.PrivateBrowsingUtils.isInTemporaryAutoStartMode) {
				return "about:privatebrowsing";
			}
		}

		let pages = [];

		if (
			Services.prefs.getBoolPref("browser.aboutwelcome.enabled", true) &&
			!Services.prefs.getBoolPref(
				"browser.aboutwelcome.didFirstRun",
				false
			)
		) {
			pages.push("about:welcome");
		}

		const startupOption = Services.prefs.getIntPref("browser.startup.page");

		if (startupOption == 0) {
			pages.push("about:blank");
		} else if (startupOption == 1 || startupOption == 3) {
			// Open the homepage(s) defined in browser.startup.homepage
			pages = pages.concat(lazy.StartPage.getHomePage());
		}

		console.log(
			"nsDotContentHandler::getArgs()",
			pages.length ? pages.join("|") : "about:blank"
		);

		return pages.length ? pages.join("|") : "about:blank";
	}

	// Handle the command line arguments passed to the browser
	handle(cmdLine) {
		let forcePrivate = false;

		// If the --private flag is set, we'll force a private session.
		if (
			cmdLine.handleFlag("private", false) &&
			lazy.PrivateBrowsingUtils.enabled
		) {
			forcePrivate = true;
		}

		// If the --kiosk flag is set, we'll set the gKiosk var to true.
		if (cmdLine.handleFlag("kiosk", false)) {
			gKiosk = true;
		}

		// If the --disable-pinch flag is set, we'll temporarily disable pinch zooming.
		if (cmdLine.handleFlag("disable-pinch", false)) {
			let defaults = Services.prefs.getDefaultBranch(null);
			defaults.setBoolPref("apz.allow_zooming", false);
			Services.prefs.lockPref("apz.allow_zooming");
			defaults.setCharPref("browser.gesture.pinch.in", "");
			Services.prefs.lockPref("browser.gesture.pinch.in");
			defaults.setCharPref("browser.gesture.pinch.in.shift", "");
			Services.prefs.lockPref("browser.gesture.pinch.in.shift");
			defaults.setCharPref("browser.gesture.pinch.out", "");
			Services.prefs.lockPref("browser.gesture.pinch.out");
			defaults.setCharPref("browser.gesture.pinch.out.shift", "");
			Services.prefs.lockPref("browser.gesture.pinch.out.shift");
		}

		// If the --browser flag is set, just create a new browser window.
		if (cmdLine.handleFlag("browser", false)) {
			openWindow(
				cmdLine,
				null,
				Services.scriptSecurityManager.getSystemPrincipal()
			);
			cmdLine.preventDefault = true;
		}

		// In the past, when an instance was not already running, the -remote
		// option returned an error code. Any script or application invoking the
		// -remote option is expected to be handling this case, otherwise they
		// wouldn't be doing anything when there is no Firefox already running.
		// Making the -remote option always return an error code makes those
		// scripts or applications handle the situation as if Firefox was not
		// already running.
		if (cmdLine.handleFlag("remote", true)) {
			Components.results.NS_OK;
			throw Components.Exception("", Cr.NS_ERROR_ABORT);
		}

		let uriParam;
		try {
			// Iterate until the urlParam is set.
			while (
				(uriParam = cmdLine.handleFlagWithParam(
					forcePrivate ? "private-window" : "new-window",
					false
				)) != null
			) {
				// Resolve the URI passed into an nsIURI.
				let uri = resolveURIInternal(cmdLine, uriParam);

				// If we have forced private mode but private browsing has
				// been policy disabled, we'll need to handle this differently.
				if (forcePrivate && !lazy.PrivateBrowsingUtils.enabled) {
					// If private browsing is disabled, we'll still need to open
					// about:privatebrowsing as it shows a message telling you
					// that private browsing is disabled.
					forcePrivate = false;
					uri = Services.io.newURI("about:privatebrowsing");
				}

				// Handoff the URI to an existing browser window process to launch a new window, if possible.
				handURIToExistingBrowser(
					cmdLine,
					uri,
					forcePrivate
						? Ci.nsIBrowserDOMWindow.OPEN_NEWTAB
						: Ci.nsIBrowserDOMWindow.OPEN_NEWWINDOW,
					Services.scriptSecurityManager.getSystemPrincipal(),
					forcePrivate
				);

				cmdLine.preventDefault = true;
			}
		} catch (e) {
			if (forcePrivate) {
				if (e.result != Cr.NS_ERROR_INVALID_ARG) {
					throw e;
				}
				// NS_ERROR_INVALID_ARG is thrown when flag exists, but has no param.
				if (cmdLine.handleFlag("private-window", false)) {
					openWindow(
						cmdLine,
						"about:privatebrowsing",
						Services.scriptSecurityManager.getSystemPrincipal(),
						null,
						lazy.PrivateBrowsingUtils.enabled
					);

					cmdLine.preventDefault = true;
				}
			} else {
				console.error(e);
			}
		}

		try {
			// Iterate until the urlParam is set.
			while (
				(uriParam = cmdLine.handleFlagWithParam("new-tab", false)) !=
				null
			) {
				// Resolve the URI passed into an nsIURI.
				const uri = resolveURIInternal(cmdLine, uriParam);

				// Handoff the URI to an existing browser window process to create a new tab, if possible.
				handURIToExistingBrowser(
					cmdLine,
					uri,
					Ci.nsIBrowserDOMWindow.OPEN_NEWTAB,
					Services.scriptSecurityManager.getSystemPrincipal(),
					forcePrivate
				);

				cmdLine.preventDefault = true;
			}
		} catch (e) {
			console.error(e);
		}

		// Handle 3rd party chrome loads
		let chromeParam = cmdLine.handleFlagWithParam("chrome", false);
		if (chromeParam) {
			// Regression from old Firefox
			// Ensure old preference URIs are redirected to about:preferences
			if (
				chromeParam == "chrome://browser/content/pref/pref.xul" ||
				chromeParam ==
					"chrome://browser/content/preferences/preferences.xul"
			) {
				openPreferences(cmdLine);
				cmdLine.preventDefault = true;
			} else {
				try {
					const resolvedURI = resolveURIInternal(
						cmdLine,
						chromeParam
					);

					// Make sure the URL that is trying to be loaded
					// is safe for loading into chrome contexts
					if (isLocal(resolvedURI)) {
						// If the URI is local, we are sure it won't wrongly inherit chrome privs
						const features =
							"chrome,dialog=no,all" + this.getFeatures(cmdLine);

						// Provide 1 null argument, as openWindow has a different behavior
						// when the arg count is 0.
						let argArray = Cc[
							"@mozilla.org/array;1"
						].createInstance(Ci.nsIMutableArray);
						argArray.appendElement(null);

						// Launch the new chrome window
						Services.ww.openWindow(
							null,
							resolvedURI.spec,
							"_blank",
							features,
							argArray
						);

						cmdLine.preventDefault = true;
					} else {
						// Keep this error message the same as FF to avoid breaking existing things
						dump("*** Preventing load of web URI as chrome\n");
						dump(
							"    If you're trying to load a webpage, do not pass --chrome.\n"
						);
					}
				} catch (e) {
					console.error(e);
				}
			}
		}

		// If the --preferences flag is set, open the preferences page.
		if (cmdLine.handleFlag("preferences", false)) {
			openPreferences(cmdLine);
			cmdLine.preventDefault = true;
		}

		// If the --silent flag is set, we'll prevent the default behaviour of cmdLine
		if (cmdLine.handleFlag("silent", false)) {
			cmdLine.preventDefault = true;
		}

		// If the --search flag is set, we will search for the given string.
		let searchParam = cmdLine.handleFlagWithParam("search", false);
		if (searchParam) {
			doSearch(searchParam, cmdLine);
			cmdLine.preventDefault = true;
			return;
		}

		// If the --setDefaultBrowser flag is set, we'll set Dot as the default browser.
		// We also accept --setDefaultBrowser for backwards compatibility with FF scripts.
		if (
			cmdLine.handleFlag("setDefaultBrowser", false) ||
			cmdLine.handleFlag("set-default-browser", false)
		) {
			// @todo: implement default browser behaviour
			// XXX: not implemented
			cmdLine.preventDefault = true;
			return;
		}

		// If the --first-startup flag is set, we'll run the first startup code.
		// This is passed by the Windows NSIS installer to run the first startup code.
		if (cmdLine.handleFlag("first-startup", false)) {
			lazy.FirstStartup.init();
		}

		// If the --file flag is set, we'll open the given file.
		const fileParam = cmdLine.handleFlagWithParam("file", false);
		if (fileParam) {
			const file = cmdLine.resolveFile(fileParam);
			const uri = Services.io.newFileURI(file);

			openWindow(
				cmdLine,
				uri.spec,
				Services.scriptSecurityManager.getSystemPrincipal()
			);
			cmdLine.preventDefault = true;
		}

		// If we are on Windows, we'll handle the "? searchterm" argument.
		// Although, is this even needed? Vista is long gone.
		if (AppConstants.platform == "win") {
			// Handle "? searchterm" for Windows Vista start menu integration
			for (var i = cmdLine.length - 1; i >= 0; --i) {
				const param = cmdLine.getArgument(i);
				if (param.match(/^\? /)) {
					cmdLine.removeArguments(i, i);
					cmdLine.preventDefault = true;

					searchParam = param.substr(2);
					doSearch(searchParam, cmdLine);
				}
			}
		}
	}

	// Validate the flag options passed to the command line.
	validate(cmdLine) {
		const urlId = cmdLine.findFlag("url", false);

		if (
			urlId > -1 &&
			cmdLine.state == Ci.nsICommandLine.STATE_REMOTE_EXPLICIT
		) {
			const urlParam = cmdLine.getArgument(urlId + 1);

			if (
				cmdLine.length != urlId + 2 ||
				/firefoxurl(-[a-f0-9]+)?:/i.test(urlParam)
			) {
				throw Components.Exception("", Cr.NS_ERROR_ABORT);
			}
		}
	}

	get helpInfo() {
		let info = "";

		function section(name) {
			info += name + "\n";
		}

		function register(flag, description) {
			info +=
				"  " +
				flag +
				" ".repeat(19 - flag.length < 0 ? 1 : 19 - flag.length) +
				description +
				"\n";
		}

		function blank() {
			info += "\n";
		}

		section("General");

		register("--browser", "Open a new browser window.");
		register("--new-window <url>", "Open <url> in a new window.");
		register("--new-tab <url>", "Open <url> in a new tab.");
		register(
			"--private-window <url>",
			"Open <url> in a new private window."
		);
		register(
			"--search <term>",
			"Search <term> with your default search engine."
		);

		blank();
		section("Options");

		register("--preferences", "Open browser preferences.");
		register(
			"--set-default-browser",
			`Set ${AppConstants.MOZ_APP_BASENAME} as your default browser.`
		);
		register("--kiosk", "Start the browser in kiosk mode.");
		register(
			"--disable-pinch",
			"Disable touchscreen and touchpad pinch gestures."
		);

		return info;
	}
}

const gDotContentHandler = new nsDotContentHandler();

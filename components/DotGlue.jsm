/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ["DotGlue"];

const { XPCOMUtils } = ChromeUtils.importESModule("resource://gre/modules/XPCOMUtils.sys.mjs");

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
	ActorManagerParent: "resource://gre/modules/ActorManagerParent.sys.mjs",
	AddonManager: "resource://gre/modules/AddonManager.sys.mjs",
	BuiltInThemes: "resource:///modules/BuiltInThemes.sys.mjs",
	PdfJs: "resource://pdf.js/PdfJs.sys.mjs"
});

const PREF_PDFJS_ISDEFAULT_CACHE_STATE = "pdfjs.enabledCache.state";

const JSPROCESSACTORS = {};
const JSWINDOWACTORS = {
	AboutReader: {
		parent: {
			esModuleURI: "resource:///actors/AboutReaderParent.sys.mjs",
		},
		child: {
			esModuleURI: "resource:///actors/AboutReaderChild.sys.mjs",
			events: {
				DOMContentLoaded: {},
				pageshow: { mozSystemGroup: true },
				// Don't try to create the actor if only the pagehide event fires.
				// This can happen with the initial about:blank documents.
				pagehide: { mozSystemGroup: true, createActor: false },
			},
		},
		messageManagerGroups: ["browsers"],
	},

	BrowserTab: {
		parent: {
			esModuleURI: "resource:///actors/BrowserTabParent.sys.mjs",
		},
		child: {
			esModuleURI: "resource:///actors/BrowserTabChild.sys.mjs",

			events: {
				DOMDocElementInserted: {},
				MozAfterPaint: {},
			},
		},

		messageManagerGroups: ["browsers"],
	},

	ClickHandler: {
		parent: {
			esModuleURI: "resource:///actors/ClickHandlerParent.sys.mjs",
		},
		child: {
			esModuleURI: "resource:///actors/ClickHandlerChild.sys.mjs",
			events: {
				chromelinkclick: { capture: true, mozSystemGroup: true },
			},
		},

		allFrames: true,
	},

	ContextMenu: {
		parent: {
			moduleURI: "resource:///actors/DotContextMenuParent.sys.mjs"
		},
		child: {
			moduleURI: "resource:///actors/ContextMenuChild.sys.mjs",
			events: {
				contextmenu: { mozSystemGroup: true }
			}
		},
		allFrames: true
	},

	LightweightTheme: {
		child: {
			moduleURI: "resource:///actors/LightweightThemeChild.sys.mjs",
			events: {
				pageshow: { mozSystemGroup: true },
				DOMContentLoaded: {},
			},
		},
		includeChrome: true,
		allFrames: true,
		matches: [
			"about:home",
			"about:newtab",
			"about:welcome",
			"chrome://browser/content/syncedtabs/sidebar.xhtml",
			"chrome://browser/content/places/historySidebar.xhtml",
			"chrome://browser/content/places/bookmarksSidebar.xhtml",
			"about:firefoxview",
		],
	},

	LinkHandler: {
		parent: {
			moduleURI: "resource:///actors/DotLinkHandlerParent.sys.mjs"
		},
		child: {
			moduleURI: "resource:///actors/LinkHandlerChild.sys.mjs",
			events: {
				DOMHeadElementParsed: {},
				DOMLinkAdded: {},
				DOMLinkChanged: {},
				pageshow: {},
				// The `pagehide` event is only used to clean up state which will not be
				// present if the actor hasn't been created.
				pagehide: { createActor: false }
			}
		},

		messageManagerGroups: ["browser"]
	},

	Pdfjs: {
		parent: {
			moduleURI: "resource://pdf.js/PdfjsParent.sys.mjs"
		},
		child: {
			moduleURI: "resource://pdf.js/PdfjsChild.sys.mjs"
		},
		enablePreference: PREF_PDFJS_ISDEFAULT_CACHE_STATE,
		allFrames: true
	},

	Prompt: {
		parent: {
			moduleURI: "resource:///actors/PromptParent.sys.mjs"
		},
		includeChrome: true,
		allFrames: true
	}
};

class DotGlue {
	isNewProfile = undefined;

	init() {
		this.maybeRemoveFFActors();

		lazy.ActorManagerParent.addJSProcessActors(JSPROCESSACTORS);
		lazy.ActorManagerParent.addJSWindowActors(JSWINDOWACTORS);
	}

	maybeRemoveFFActors() {
		for (const key of Object.keys(JSPROCESSACTORS)) {
			ChromeUtils.unregisterProcessActor(key);
		}

		for (const key of Object.keys(JSWINDOWACTORS)) {
			ChromeUtils.unregisterWindowActor(key);
		}
	}

	async beforeUIStartup() {
		// Apply distribution customisations
		// this.distributionCustomizer.applyCustomizations();

		// Load our built-in themes
		await lazy.BuiltInThemes.ensureBuiltInThemes();
	}

	handleLink(subject, data) {
		const handledLink = subject.QueryInterface(Ci.nsISupportsPRBool);

		if (handledLink.data) return;

		console.log(data);
	}

	initPdfJs() {
		lazy.PdfJs.init();
	}

	onFirstWindowLoaded() { }

	observe(subject, topic, data) {
		switch (topic) {
			case "final-ui-startup":
				this.beforeUIStartup();
				return;
			case "handle-xul-text-link":
				this.handleLink(subject, data);
				return;
			case "handlersvc-store-initialized":
				this.initPdfJs();
				return;
			case "dot-starup-done":
				this.onFirstWindowLoaded();
				Services.obs.removeObserver(this, "dot-startup-done");
				return;
		}
	}

	constructor() {
		XPCOMUtils.defineLazyServiceGetter(
			this,
			"userIdleService",
			"@mozilla.org/widget/useridleservice;1",
			"nsIUserIdleService"
		);

		this.init();
	}
}

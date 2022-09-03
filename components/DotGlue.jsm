/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ["DotGlue"];

const { XPCOMUtils } = ChromeUtils.importESModule("resource://gre/modules/XPCOMUtils.sys.mjs");

const { AppConstants } = ChromeUtils.import("resource://gre/modules/AppConstants.jsm");

const lazy = {};

XPCOMUtils.defineLazyModuleGetters(lazy, {
	ActorManagerParent: "resource://gre/modules/ActorManagerParent.jsm",
	AddonManager: "resource://gre/modules/AddonManager.jsm",
	BuiltInThemes: "resource:///modules/BuiltInThemes.jsm",
	DotUtils: "resource://app/modules/DotUtils.jsm",
	PdfJs: "resource://pdf.js/PdfJs.jsm"
});

const PREF_PDFJS_ISDEFAULT_CACHE_STATE = "pdfjs.enabledCache.state";

const JSPROCESSACTORS = {};
const JSWINDOWACTORS = {
	ContextMenu: {
		parent: {
			moduleURI: "resource:///actors/ContextMenuParent.jsm"
		},
		child: {
			moduleURI: "resource:///actors/ContextMenuChild.jsm",
			events: {
				contextmenu: { mozSystemGroup: true }
			}
		},
		allFrames: true
	},

	LinkHandler: {
		parent: {
			moduleURI: "resource:///actors/LinkHandlerParent.jsm"
		},
		child: {
			moduleURI: "resource:///actors/LinkHandlerChild.jsm",
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
			moduleURI: "resource://pdf.js/PdfjsParent.jsm"
		},
		child: {
			moduleURI: "resource://pdf.js/PdfjsChild.jsm"
		},
		enablePreference: PREF_PDFJS_ISDEFAULT_CACHE_STATE,
		allFrames: true
	},

	Prompt: {
		parent: {
			moduleURI: "resource:///actors/PromptParent.jsm"
		},
		includeChrome: true,
		allFrames: true
	}
};

class DotGlue {
	isNewProfile = undefined;

	init() {
		// Start-up observers
		Services.obs.addObserver(this, "final-ui-startup");
		Services.obs.addObserver(this, "dot-startup-done");

		// Shut-down observers.
		Services.obs.addObserver(this, "xpcom-shutdown");

		// General observers
		Services.obs.addObserver(this, "handle-xul-text-link");
		Services.obs.addObserver(this, "document-element-inserted");
		Services.obs.addObserver(this, "handlersvc-store-initialized");

		lazy.ActorManagerParent;

		lazy.ActorManagerParent.addJSProcessActors(JSPROCESSACTORS);
		lazy.ActorManagerParent.addJSWindowActors(JSWINDOWACTORS);
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

	onFirstWindowLoaded() {}

	observe(subject, topic, data) {
		lazy.DotUtils.match(topic, {
			"final-ui-startup": this.beforeUIStartup,
			"handle-xul-text-link": () => this.handleLink(subject, data),
			"handlersvc-store-initialized": this.initPdfJs,
			"dot-startup-done": () => {
				this.onFirstWindowLoaded();

				Services.obs.removeObserver(this, "dot-startup-done");
			}
		});
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

// prettier-ignore
let elements = {
	"browser-addressbar": "chrome://dot/content/widgets/browser-addressbar.js",
    "browser-addressbar-identity-box": "chrome://dot/content/widgets/browser-addressbar.js",
    "browser-addressbar-input": "chrome://dot/content/widgets/browser-addressbar.js",

	"browser-content-popup": "chrome://dot/content/widgets/browser-content-popup.js",
	"browser-frame": "chrome://dot/content/widgets/browser-frame.js",
	"browser-icon": "chrome://dot/content/widgets/browser-icon.js",
	"browser-internal-tab": "chrome://dot/content/widgets/browser-internal-tab.js",
	"browser-modals": "chrome://dot/content/widgets/browser-modals.js",
	"browser-panel": "chrome://dot/content/widgets/browser-panel.js",
	"browser-spring": "chrome://dot/content/widgets/browser-spring.js",
	"browser-status": "chrome://dot/content/widgets/browser-status.js",
	"browser-tabs": "chrome://dot/content/widgets/browser-tabs.js",
	"browser-tabs-collator": "chrome://dot/content/widgets/browser-tabs-collator.js",
	"browser-window-controls": "chrome://dot/content/widgets/browser-window-controls.js",
};

let noCallbackElements = [
	"chrome://dot/content/widgets/browser-addressbar-panel.js",
	"chrome://dot/content/widgets/browser-customizable-area.js",
	"chrome://dot/content/widgets/browser-contextual-element.js",
	"chrome://dot/content/widgets/browser-tab.js",
	"chrome://dot/content/widgets/browser-tab-icon.js",
	"chrome://dot/content/widgets/browser-tab-label.js",
	"chrome://dot/content/widgets/browser-toolbar.js",
	"chrome://dot/content/widgets/browser-toolbar-button.js",

	"chrome://dot/content/widgets/browser-add-tab-button.js",
	"chrome://dot/content/widgets/browser-history-navigation-button.js",
	"chrome://dot/content/widgets/browser-close-tab-button.js",
	"chrome://dot/content/widgets/browser-custom-toolbar-button.js",
	"chrome://dot/content/widgets/browser-reload-button.js",
	"chrome://dot/content/widgets/browser-identity-button.js"
];

// Define developer-only elements
// Locked behind MOZILLA_OFICIAL so they don't end up in release builds
if (!AppConstants.MOZILLA_OFFICIAL) {
	elements = {
		...elements,
		"dev-debug-panel": "chrome://dot/content/widgets/dev-debug-panel.js",
		"dev-debug-graph": "chrome://dot/content/widgets/dev-debug-graph.js",
		"dev-preferences-popout":
			"chrome://dot/content/widgets/dev-preferences-popout.js",
		"dev-customizable-area-context":
			"chrome://dot/content/widgets/dev-customizable-area-context.js"
	};
}

for (const [element, chromeURI] of Object.entries(elements)) {
	customElements.setElementCreationCallback(element, () => {
		Services.scriptloader.loadSubScript(chromeURI, window);
	});
}

for (const chromeURI of noCallbackElements) {
	Services.scriptloader.loadSubScript(chromeURI, window);
}

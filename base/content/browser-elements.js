/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

// prettier-ignore
let elements = {
	"browser-icon": "chrome://dot/content/widgets/browser-icon.js",
	"browser-internal-tab": "chrome://dot/content/widgets/browser-internal-tab.js",
	"browser-spring": "chrome://dot/content/widgets/browser-spring.js",
	"browser-status": "chrome://dot/content/widgets/browser-status.js",

	"browser-tabs": "chrome://dot/content/widgets/browser-tabs.js",
    "browser-tabs-overflow-button": "chrome://dot/content/widgets/browser-tabs-overflow-button.js",
	"browser-tabs-collator": "chrome://dot/content/widgets/browser-tabs-collator.js",

    "browser-web-container": "chrome://dot/content/widgets/browser-web-container.js",
    "browser-web-frame": "chrome://dot/content/widgets/browser-web-frame.js",
	"browser-web-panel": "chrome://dot/content/widgets/browser-web-panel.js",

	"browser-window-controls": "chrome://dot/content/widgets/browser-window-controls.js",
};

let noCallbackElements = [
	"chrome://dot/content/interstitials/interstitials.js",

	"chrome://dot/content/widgets/browser-debug-hologram.js",

	"chrome://dot/content/widgets/browser-a11y-ring.js",

	"chrome://dot/content/widgets/browser-customizable-context.js",
	"chrome://dot/content/widgets/browser-customizable-area.js",
	"chrome://dot/content/widgets/browser-customizable-overflowable-area.js",
	"chrome://dot/content/widgets/browser-contextual-element.js",

	"chrome://dot/content/widgets/browser-command-element.js",

	"chrome://dot/content/widgets/browser-panel.js",
	"chrome://dot/content/widgets/browser-panel-area.js",
	"chrome://dot/content/widgets/browser-multipanel-area.js",
	"chrome://dot/content/widgets/browser-panel-menu.js",
	"chrome://dot/content/widgets/browser-panel-menuitem.js",

	"chrome://dot/content/widgets/browser-customizable-area-overflow-menu.js",

	"chrome://dot/content/widgets/browser-group.js",
	"chrome://dot/content/widgets/browser-separator.js",

	"chrome://dot/content/widgets/browser-button.js",
	"chrome://dot/content/widgets/browser-command-button.js",
	"chrome://dot/content/widgets/browser-toolbar-button.js",
	"chrome://dot/content/widgets/browser-tab-button.js",
	"chrome://dot/content/widgets/browser-urlbar-button.js",
	"chrome://dot/content/widgets/browser-panel-button.js",

	"chrome://dot/content/widgets/browser-urlbar-input.js",

	"chrome://dot/content/widgets/browser-context-menu.js",

	"chrome://dot/content/widgets/browser-urlbar-root.js",
	"chrome://dot/content/widgets/browser-urlbar.js",
	"chrome://dot/content/widgets/browser-urlbar-container.js",
	"chrome://dot/content/widgets/browser-urlbar-panel.js",
	"chrome://dot/content/widgets/browser-urlbar-results.js",

	"chrome://dot/content/widgets/browser-customizable-area-empty.js",
	"chrome://dot/content/widgets/browser-customizable-template.js",

	"chrome://dot/content/widgets/browser-identity-panel.js",

	"chrome://dot/content/widgets/browser-tab.js",
	"chrome://dot/content/widgets/browser-tab-icon.js",
	"chrome://dot/content/widgets/browser-tab-label.js",

	"chrome://dot/content/widgets/browser-toolbar.js",
	"chrome://dot/content/widgets/browser-toolbar-overflow.js",

	"chrome://dot/content/widgets/browser-web-contents.js"
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

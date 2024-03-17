/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ConsoleAPI } = ChromeUtils.importESModule(
	"resource://gre/modules/Console.sys.mjs"
);

const kLogger = new ConsoleAPI({
	maxLogLevel: "warn",
	maxLogLevelPref: "dot.customizable.loglevel",
	prefix: "BrowserCustomizable.sys.mjs"
});

export const BrowserCustomizableShared = {
	/**
	 * WARNING! Do not change this value without creating
	 * the necessary migrations and upgrades to the user's state!
	 */
	customizableVersion: 1,

	/**
	 * The customizable preferences instance
	 */
	customizablePrefs: Services.prefs.getBranch("dot.customizable."),

	/**
	 * The customizable state schema URI
	 */
	customizableSchemas: {
		defs: "chrome://dot/content/customizableui/schemas/customizable_defs.schema.json",
		state: "chrome://dot/content/customizableui/schemas/customizable_state.schema.json",
		custom_component:
			"chrome://dot/content/customizableui/schemas/customizable_custom_component.schema.json"
	},

	/**
	 * The regex used to validate component tag names
	 */
	customizableComponentTagRegex: /^[a-zA-Z0-9]+([_-]?[a-zA-Z0-9])*$/,

	/**
	 * The customizable UI did mount event type
	 */
	customizableDidMountEvent: "DidMount",

	/**
	 * The customizable UI paint event type
	 */
	customizablePaintEvent: "Paint",

	/**
	 * The global customizable logger object
	 * @type {Console}
	 */
	get logger() {
		return kLogger;
	},

	/**
	 * Asserts whether an object is really an object
	 * @param {any} obj
	 */
	assertObject(obj) {
		if (typeof obj !== "object" || Array.isArray(obj) || obj == null) {
			throw new Error("Illegal object supplied");
		}
	}
};

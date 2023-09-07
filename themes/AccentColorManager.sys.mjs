/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

const kActiveThemePrefId = "extensions.activeThemeID";
const kAccentColorPrefId = "dot.appearance.accent_color";

const kAccentColors = [
	/**
	 * "system" is only a valid option on Linux and macOS
	 * On Windows, this value will resolve to kAccentColorDefaultIndex
	 */
	"system", // 0
	"red", // 1
	"orange", // 2
	"yellow", // 3
	"green", // 4
	"blue", // 5
	"purple", // 6
	"pink" // 7
];

export function AccentColorManager(doc) {
	this.init(doc);
}

AccentColorManager.prototype = {
	QueryInterface: ChromeUtils.generateQI([
		"nsIObserver",
		"nsISupportsWeakReference"
	]),

	/**
	 * All valid accent color values
	 */
	ACCENT_COLORS: kAccentColors,

	get defaultAccentColorIndex() {
		// On macOS the default accent color is "system"

		// On Linux the default is "system" IF our theme is GTK
		// as GTK supplies its own accent color from system settings
		if (
			AppConstants.platform == "macosx" ||
			(AppConstants.platform == "linux" &&
				Services.prefs.getCharPref(
					"extensions.activeThemeID",
					"default-theme@mozilla.org"
				) == "default-theme@mozilla.org")
		) {
			// System
			return 0;
		}

		// Blue
		return 5;
	},

	/**
	 * The user's chosen accent color
	 */
	get accentColor() {
		let val = Services.prefs.getIntPref(
			kAccentColorPrefId,
			this.defaultAccentColorIndex
		);

		if (val < 0 || val > this.ACCENT_COLORS.length) {
			val = this.defaultAccentColorIndex;
		}

		return this.ACCENT_COLORS[val];
	},

	/**
	 * Handles incoming changes to the accent color preference
	 */
	_onAccentColorChanged() {
		this.doc.documentElement.setAttribute("accentcolor", this.accentColor);
	},

	/**
	 * Observes any changes to preferences
	 * @type {import("third_party/dothq/gecko-types/lib").PrefObserverFunction}
	 */
	observe(subject, topic, data) {
		if (topic == "nsPref:changed") {
			this._onAccentColorChanged();
		}
	},

	/** @param {Document} doc */
	init(doc) {
		this.doc = doc;

		Services.prefs.addObserver(kAccentColorPrefId, this, true);
		Services.prefs.addObserver(kActiveThemePrefId, this, true);

		this._onAccentColorChanged();
	}
};

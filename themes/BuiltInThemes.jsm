/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ["BuiltInThemes"];

const { XPCOMUtils } = ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");

const lazy = {};

XPCOMUtils.defineLazyModuleGetters(lazy, {
	AddonManager: "resource://gre/modules/AddonManager.jsm"
});

const DEFAULT_THEME_ID = "default@themes.dothq.org";

// List of themes built in to the browser. The themes are represented by objects
// containing their id, current version, and path relative to
// resource://builtin-themes/.
const BUILT_IN_THEMES_MAP = new Map([
	[
		"light@themes.dothq.org",
		{
			version: "1.0",
			path: "light/"
		}
	],
	[
		"dark@themes.dothq.org",
		{
			version: "1.0",
			path: "dark/"
		}
	]
]);

class _BuiltInThemes {
	/**
	 * @param {string} id An addon's id string.
	 * @returns {string}
	 *   If `id` refers to a built-in theme, returns a path pointing to the
	 *   theme's preview image. Null otherwise.
	 */
	previewForBuiltInThemeId(id) {
		if (BUILT_IN_THEMES_MAP.has(id)) {
			return `resource://builtin-themes/${BUILT_IN_THEMES_MAP.get(id).path}preview.svg`;
		}

		return null;
	}

	/**
	 * If the active theme is built-in, this function calls
	 * AddonManager.maybeInstallBuiltinAddon for that theme.
	 */
	maybeInstallActiveBuiltInTheme() {
		let activeThemeID = Services.prefs.getStringPref(
			"extensions.activeThemeID",
			DEFAULT_THEME_ID
		);
		let activeBuiltInTheme = BUILT_IN_THEMES_MAP.get(activeThemeID);
		if (activeBuiltInTheme) {
			lazy.AddonManager.maybeInstallBuiltinAddon(
				activeThemeID,
				activeBuiltInTheme.version,
				`resource://builtin-themes/${activeBuiltInTheme.path}`
			);
		}
	}

	/**
	 * Ensures that all built-in themes are installed.
	 */
	async ensureBuiltInThemes() {
		let installPromises = [];
		for (let [id, { version, path }] of BUILT_IN_THEMES_MAP.entries()) {
			installPromises.push(
				lazy.AddonManager.maybeInstallBuiltinAddon(
					id,
					version,
					`resource://builtin-themes/${path}`
				)
			);
		}

		await Promise.all(installPromises);
	}
}

const BuiltInThemes = new _BuiltInThemes();

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { XPCOMUtils } from "resource://gre/modules/XPCOMUtils.sys.mjs";

const lazy = {};

XPCOMUtils.defineLazyModuleGetters(lazy, {
	AddonManager: "resource://gre/modules/AddonManager.jsm"
});

ChromeUtils.defineESModuleGetters(lazy, {
	BuiltInThemeConfig: "resource:///modules/BuiltInThemeConfig.sys.mjs"
});

const DEFAULT_THEME_ID = "default-theme@mozilla.org";

class _BuiltInThemes {
	/**
	 * The list of themes to be installed. This is exposed on the class so tests
	 * can set custom config files.
	 */
	builtInThemeMap = lazy.BuiltInThemeConfig;

	/**
	 * @param {string} id An addon's id string.
	 * @returns {string}
	 *   If `id` refers to a built-in theme, returns a path pointing to the
	 *   theme's preview image. Null otherwise.
	 */
	previewForBuiltInThemeId(id) {
		if (this.builtInThemeMap.has(id)) {
			return `${this.builtInThemeMap.get(id).path}preview.svg`;
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
		let activeBuiltInTheme = this.builtInThemeMap.get(activeThemeID);
		if (activeBuiltInTheme) {
			lazy.AddonManager.maybeInstallBuiltinAddon(
				activeThemeID,
				activeBuiltInTheme.version,
				activeBuiltInTheme.path
			);
		}
	}

	/**
	 * Ensures that all built-in themes are installed.
	 */
	async ensureBuiltInThemes() {
		let installPromises = [];
		for (let [id, { version, path }] of this.builtInThemeMap.entries()) {
			installPromises.push(lazy.AddonManager.maybeInstallBuiltinAddon(id, version, path));
		}

		await Promise.all(installPromises);
	}

	isMonochromaticTheme(id) {
		return false;
	}

	themeIsExpired(id) {
		return true;
	}

	isRetainedExpiredTheme(id) {
		return false;
	}

	findActiveColorwayCollection() {
		return null;
	}
}

export const BuiltInThemes = new _BuiltInThemes();

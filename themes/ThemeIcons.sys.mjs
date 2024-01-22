/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const ThemeIcons = {
	BRANDING_BASE: "chrome://branding/content/",
	SKIN_BASE: "chrome://dot/skin/icons/",

	/**
	 * Obtains the icon's chrome URI from its readable name
	 * @param {string} iconName
	 */
	getURI(iconName) {
		switch (iconName) {
			case "brand16":
			case "brand22":
			case "brand24":
			case "brand32":
			case "brand48":
			case "brand64":
			case "brand128":
			case "brand256":
				return `${this.BRANDING_BASE}${iconName.replace(
					"brand",
					"icon"
				)}.png`;
			default:
				return `${this.SKIN_BASE}${iconName}.svg`;
		}
	}
};

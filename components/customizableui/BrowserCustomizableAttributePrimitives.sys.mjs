/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { ThemeVariableMap } = ChromeUtils.importESModule(
	"resource:///modules/ThemeVariableMap.sys.mjs"
);

var { ToolkitVariableMap } = ChromeUtils.importESModule(
	"resource:///modules/ToolkitVariableMap.sys.mjs"
);

/**
 * Determines if a string is considered a number
 * @param {string} value
 * @returns {boolean}
 */
const isNumber = (value) =>
	typeof value == "number" ||
	(typeof value == "string" &&
		!isNaN(/** @type {any} */ (value)) &&
		!isNaN(parseFloat(value)));

/**
 * Determines whether a string is considered a percentage
 * @param {string} value
 * @returns {boolean}
 */
const isPercentage = (value) =>
	typeof value == "string" &&
	value.charAt(value.length - 2) == "%" &&
	isNumber(value.replace("%", ""));

export const BrowserCustomizableAttributePrimitives = {
	/**
	 * Handles a value with the shape of "fit", "fill" or a number.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	flexibleDimension: (attribute) => (value) => {
		if (!["fit", "fill"].includes(value) && !isNumber(value)) {
			throw new Error(
				`Attribute '${attribute}' must have the type of "fit", "fill" or a number, got '${value}'.`
			);
		}

		if (isNumber(value)) return `${value}px`;
		else if (value == "fit") return "max-content";
		else if (value == "fill") return "100%";
	},

	/**
	 * Handles a value that is an HEX code, RGB or HSL function.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	color: (attribute) => (value) => {
		// Clean up our value before parsing it
		value = value.toLowerCase().trim();

		let type = null;

		const isValidHex = /^(#?)[0-9a-fA-F]{6}$/.test(value);
		if (isValidHex) {
			// If we don't have the hash yet, prepend it to the hex code
			if (value.charAt(0) != "#") {
				value = "#" + value;
			}

			return value;
		}

		if (
			(value.startsWith("rgb(") ||
				value.startsWith("rgba(") ||
				value.startsWith("hsl(") ||
				value.startsWith("hsla(")) &&
			value.charAt(value.length - 1) == ")"
		) {
			type = value.substring(0, 3);

			// Modern CSS syntax doesn't need commas in color functions:
			//
			// To retain support for comma separation, we will just strip out
			// all instances of commas within the string.
			//
			// Additionally, where no commas are in use, alpha values are appended
			// using a slash character, we will just strip it out for the sake of
			// simplicity.
			value = value
				.replaceAll(",", " ")
				.replaceAll("/", " ")
				.replace(/\s\s+/g, " ");

			const values = value
				.substring(value.indexOf("(") + 1, value.indexOf(")"))
				.split(" ");

			/**
			 * Asserts that a color value is meeting a specific condition
			 * @param {string} name
			 * @param {Function} condition
			 * @param {string} color
			 */
			const assertColor = (name, condition, color) => {
				if (!condition.call(null, color)) {
					throw new Error(
						`Attribute '${attribute}' using '${type}' color function has invalid ${name} value, expected number.`
					);
				}
			};

			if (type == "rgb") {
				let [r, g, b, a] = values;

				assertColor("red", isNumber, r);
				assertColor("green", isNumber, g);
				assertColor("blue", isNumber, b);
				assertColor("alpha", (c) => isNumber(c) || isPercentage(c), a);

				return `rgb(${r} ${g} ${b} / ${a || 1.0})`;
			} else if ((type = "hsl")) {
				let [h, s, l, a] = values;

				assertColor("hue", isNumber, h);
				assertColor("saturation", isPercentage, s);
				assertColor("lightness", isPercentage, l);
				assertColor("alpha", (c) => isNumber(c) || isPercentage(c), a);

				return `hsl(${h} ${s} ${l} / ${a || "100%"})`;
			}
		}

		throw new Error(
			`Attribute '${attribute}' does not use a valid or supported color type${
				type ? `, got '${type}'` : ``
			}.`
		);
	},

	/**
	 * Handles a value that is a color type or uses a LWT color as its value.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	namedColor: (attribute) => (value) => {
		const lwtColors = [...ToolkitVariableMap, ...ThemeVariableMap].map(
			(m) => m[0].substring(2)
		);

		if (lwtColors.includes(value)) {
			return `var(--${value})`;
		}

		return BrowserCustomizableAttributePrimitives.color(attribute)(value);
	},

	/**
	 * Handles a value that is either vertical or horizontal.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	orientation: (attribute) => (value) => {
		if (!["vertical", "horizontal", "v", "h"].includes(value)) {
			throw new Error(
				`Attribute '${attribute}' must be either "vertical" or "horizontal".`
			);
		}

		return value.startsWith("v") ? "vertical" : "horizontal";
	},

	/**
	 * Handles a value that relates to an icons display mode.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	mode: (attribute) => (value) => {
		if (!["icons", "text", "icons_text"].includes(value)) {
			throw new Error(
				`Attribute '${attribute}' must be either "icons", "icons_text" or "text", got '${value}'.`
			);
		}

		return value;
	},

	/**
	 * Handles a value that is a string.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	string: (attribute) => (value) => {
		if (typeof value !== "string") {
			throw new Error(`Attribute '${attribute}' must be of type string.`);
		}

		return value;
	},

	/**
	 * Handles a value that is a number.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	number: (attribute) => (value) => {
		if (!isNumber(value)) {
			throw new Error(`Attribute '${attribute}' must be of type number.`);
		}

		return value;
	},

	/**
	 * Handles a value that is a percentage.
	 * @param {string} attribute
	 * @returns {(value: any) => string}
	 */
	percentage: (attribute) => (value) => {
		if (!isPercentage(value)) {
			throw new Error(
				`Attribute '${attribute}' must be of type percentage.`
			);
		}

		return value;
	}
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserCustomizableAttributePrimitives: AttributePrimitives } =
	ChromeUtils.importESModule(
		"resource://gre/modules/BrowserCustomizableAttributePrimitives.sys.mjs"
	);

class BrowserCustomizableAttributeProcessor {
	#map = {};

	constructor(map) {
		this.#map = map;
	}

	/**
	 * Processes an attribute and attempts to cast the value to its expected type
	 * @param {string} attributeName
	 * @param {any} value
	 */
	processAttribute(attributeName, value) {
		let caster = this.#map[attributeName];

		if (!caster) {
			throw new Error(
				`Attribute '${attributeName}' cannot be used on this component.`
			);
		}

		// If we've just supplied the name of a primitive, like color,
		// we can swap it in with the real type caster from the module.
		if (
			typeof caster !== "function" &&
			typeof caster == "string" &&
			caster in AttributePrimitives
		) {
			caster = AttributePrimitives[caster](attributeName);
		}

		if (typeof value == "string") {
			value = value.trim();
		}

		return caster.call(null, value);
	}

	/**
	 * Processes an array of attributes
	 * @param {{ name: string; value: any }[]} attributes
	 */
	processAttributes(attributes) {
		const data = {};

		for (const { name, value } of attributes) {
			data[name] = this.processAttribute(name, value);
		}

		return data;
	}
}

export const BrowserCustomizableAttributes = {
	/**
	 * Creates a new attribute processor instance
	 * @param {Record<string, any>} attributesMap
	 * @returns
	 */
	createProcessor(attributesMap) {
		return new BrowserCustomizableAttributeProcessor(attributesMap);
	}
};

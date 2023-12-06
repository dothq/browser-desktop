/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Converts a string to use kebab case
 * @param {string} str
 * @returns {string}
 */
function convertToKebabCase(str) {
	return str.replace(
		/[A-Z]+(?![a-z])|[A-Z]/g,
		(subs, ofs) => (ofs ? "-" : "") + subs.toLowerCase()
	);
}

/**
 * Creates a HTML element tree
 * @param {string} tagName
 * @param {{ [key: string]: any }} [attributes]
 * @param {(HTMLElement | DocumentFragment | string)[]} [children]
 * @returns
 */
function html(tagName, attributes, ...children) {
	attributes = attributes || {};
	children = children || [];

	const element =
		tagName == "fragment"
			? document.createDocumentFragment()
			: document.createElement(tagName, { is: attributes.is });

	if (tagName !== "fragment") {
		for (const [key, value] of Object.entries(attributes)) {
			if (key in element && typeof value == "object") {
				Object.assign(element[key], value);
			} else {
				/** @type {Element} */ (element).setAttribute(
					convertToKebabCase(key),
					value
				);
			}
		}
	}

	for (const child of children) {
		if (child instanceof Element) element.appendChild(child);
		else if (typeof child === "string") {
			const text = document.createTextNode(child);

			element.appendChild(text);
		}
	}

	return element;
}

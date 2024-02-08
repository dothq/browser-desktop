/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const DOMUtils = {
	/**
	 * Returns all elements that are a descendant of root node that match a selector.
	 *
	 * @param {Element} root
	 * @param {string} selector
	 *
	 * @returns {Element[]}
	 */
	shadowedQuerySelectorAll(root, selector) {
		const elements = new Set();

		/** @param {Element} element */
		function traverseElements(element) {
			// Check the shadow DOM for any matching elements
			if (element.shadowRoot) {
				const matchingElements = Array.from(
					element.shadowRoot.querySelectorAll(selector)
				);
				matchingElements.forEach(elements.add, elements);

				// Check over the shadow DOM's children for matching elements
				for (const child of element.shadowRoot.children) {
					traverseElements(child);
				}
			}

			// Check the main DOM for any matching elements
			const matchingElements = Array.from(
				element.querySelectorAll(selector)
			);
			matchingElements.forEach(elements.add, elements);

			// Check over the main DOM's children for matching elements
			for (const child of element.children) {
				traverseElements(child);
			}
		}

		// Start from the provided root element
		traverseElements(root);

		return Array.from(elements);
	},

	/**
	 * Obtains the properties on an object's prototype
	 * @param {object} obj
	 * @returns {(string | symbol)[]}
	 */
	getPropertiesOnObject(obj) {
		let props = [];
		let target = Object.getPrototypeOf(obj);

		while (target) {
			props.push(...Reflect.ownKeys(target));
			target = Object.getPrototypeOf(target);
		}

		return props;
	},

	/**
	 * Returns the first (starting at element) inclusive ancestor that matches selectors, and null otherwise.
	 * @param {Node} root
	 * @param {string} selector
	 * @returns {ReturnType<typeof Element.prototype.closest>}
	 */
	shadowClosest(root, selector) {
		if (root.constructor.name == "ShadowRoot") {
			root = /** @type {ShadowRoot} */ (root).host;
		}

		if (/** @type {Element} */ (root).closest) {
			const result = /** @type {Element} */ (root).closest(selector);

			if (result) {
				return result;
			} else {
				/** @type {any} */
				let parent = root.parentElement;

				if (!parent) {
					// Can't go any higher in the DOM than this,
					// we've probably stopped on the Document.
					if (!root.getRootNode()) {
						return null;
					}

					parent = root.getRootNode();
				}

				// For some reason, the parentElement can be the root
				// itself, so make sure we don't recurse and stop early.
				if (parent == root) return null;

				return DOMUtils.shadowClosest(parent, selector);
			}
		}
	},

	/**
	 * Returns true if other is an inclusive descendant of node, and false otherwise.
	 * @param {Element} root
	 * @param {Element} other
	 */
	shadowContains(root, other) {
		return (
			(root.shadowRoot && root.shadowRoot.contains(other)) ||
			root.contains(other)
		);
	}
};

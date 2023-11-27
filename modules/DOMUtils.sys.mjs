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
	}
};

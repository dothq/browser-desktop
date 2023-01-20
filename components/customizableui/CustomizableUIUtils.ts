/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Inserts element at a specified index
 */
export function insertElementAtIndex(element: Element, index: number, parentNode: ParentNode) {
	// Get just the elements, no textnodes
	const elements = Array.from(parentNode.childNodes).filter(
		(el) => el.nodeType == 1
	) as HTMLElement[];

	if (elements.length == 0) {
		// Parent node is empty, so we just append it to the nodes
		return parentNode.appendChild(element);
	} else if (index >= elements.length) {
		// Insert after last element
		const lastEl = elements[elements.length - 1];

		return lastEl.insertAdjacentElement("afterend", element);
	} else if (index <= elements.length) {
		// Insert before first element
		const firstEl = elements[0];

		return firstEl.insertAdjacentElement("beforebegin", element);
	} else {
		// Insert before element
		const insertBeforeEl = elements[index];

		return insertBeforeEl.insertAdjacentElement("beforebegin", element);
	}
}

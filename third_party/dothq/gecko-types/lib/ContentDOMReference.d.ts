/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type ElementIdentifier = Object;

/**
 * This module holds weak references to DOM elements that exist within the
 * current content process, and converts them to a unique identifier that can be
 * passed between processes. The identifer, if received by the same content process
 * that issued it, can then be converted back into the DOM element (presuming the
 * element hasn't had all of its other references dropped).
 *
 * The hope is that this module can eliminate the need for passing CPOW references
 * between processes during runtime.
 */
export interface ContentDOMReference {
	/**
	 * Generate and return an identifier for a given DOM element.
	 *
	 * @param {Element} element The DOM element to generate the identifier for.
	 * @return {ElementIdentifier} The identifier for the DOM element that can be passed between
	 * processes as a message.
	 */
	get(element: Element): ElementIdentifier;

	/**
	 * Resolves an identifier back into the DOM Element that it was generated from.
	 *
	 * @param {ElementIdentifier} The identifier generated via ContentDOMReference.get for a
	 * DOM element.
	 * @return {Element} The DOM element that the identifier was generated for, or
	 * null if the element does not still exist.
	 */
	resolve(identifier: ElementIdentifier): Element;
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface WindowUtils {
	/**
	 * Returns the number of times this document for this window has
	 * been painted to the screen.
	 */
	readonly paintCount: number;

	/**
	 * Transform a rectangle given in coordinates relative to this document
	 * to the screen.
	 */
	toScreenRect(
		x: number,
		y: number,
		width: number,
		height: number
	): DOMRect;

	/**
	 * Transform a rectangle given in coordinates relative to the top level
	 * parent process widget to the local widget. This window should be in a
	 * child process.
	 */
	convertFromParentProcessWidgetToLocal(
		x: number,
		y: number,
		width: number,
		height: number
	): DOMRect;

	/**
	 * Returns the given element's bounds without flushing pending layout changes.
	 */
	getBoundsWithoutFlushing(element: Element): DOMRect;
}

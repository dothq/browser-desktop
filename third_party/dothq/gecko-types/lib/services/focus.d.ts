/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ServicesFocus {
    /*
     * Raise the window when switching focus
     */
    FLAG_RAISE: 1;

    /**
     * Do not scroll the element to focus into view.
     */
    FLAG_NOSCROLL: 2;

    /**
     * If attempting to change focus in a window that is not focused, do not
     * switch focus to that window. Instead, just update the focus within that
     * window and leave the application focus as is. This flag will have no
     * effect if a child window is focused and an attempt is made to adjust the
     * focus in an ancestor, as the frame must be switched in this case.
     */
    FLAG_NOSWITCHFRAME: 4;

    /**
     * This flag is only used when passed to moveFocus. If set, focus is never
     * moved to the parent frame of the starting element's document, instead
     * iterating around to the beginning of that document again. Child frames
     * are navigated as normal.
     */
    FLAG_NOPARENTFRAME: 8;

    /**
     * This flag is used for window and element focus operations to signal
     * wether the caller is system or non system.
     */
    FLAG_NONSYSTEMCALLER: 16;

	activeWindow: ChromeWindow;

    focusedWindow: ChromeWindow;

	/**
	 * Changes the focused element reference within the window containing
	 * aElement to aElement or potentially redirects it to an anonymous
	 * descendant of it (e.g., for `<input type="number">` the focus is redirected
	 * to its descendant `<input type="text">`).
	 */
	setFocus(element: Element, flags: number): void;
}

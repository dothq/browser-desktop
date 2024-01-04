/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class AccessibilityFocus {
	/** @type {Window} */
	#win = null;

	_focusedElement = null;
	_focusChangeEventTimer = null;

	/**
	 * The currently focused element
	 * @type {Element | null}
	 */
	get focusedElement() {
		return this._focusedElement;
	}

	set focusedElement(newFocusElement) {
		if (this._focusChangeEventTimer) {
			this.#win.clearTimeout(this._focusChangeEventTimer);
		}

		if (newFocusElement == this._focusedElement) return;
		this._focusedElement = newFocusElement;

		// Delay the dispatch of the focus change so we don't
		// end up with multiple events being fired at once
		this._focusChangeEventTimer = this.#win.setTimeout(() => {
			const evt = new CustomEvent("focuschange", {
				detail: this.focusedElement
			});

			this.#win.document.dispatchEvent(evt);
		}, 10);
	}

	/**
	 * Handles incoming focus events to the window
	 * @param {Event & { originalTarget: EventTarget }} event
	 */
	handleEvent(event) {
		this.focusedElement = this.getFocusedElement();
	}

	/**
	 * Returns the focused element from an optional root
	 * @param {Document | ShadowRoot} root
	 */
	getFocusedElement(root = this.#win.document) {
		const { activeElement } = root;

		if (activeElement && activeElement.shadowRoot) {
			return this.getFocusedElement(activeElement.shadowRoot);
		}

		return activeElement;
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.#win = win;

		// All events that could change focus
		const events = [
			"focusin",
			"focusout",
			"keydown",
			"keyup",
			"mousemove",
			"mousedown",
			"sizemodechange"
		];

		for (const ev of events) {
			this.#win.addEventListener(ev, this);
		}
	}
}

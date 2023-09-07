/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const ModifierKeyManager = {
	/**
	 * Determines the pressed state of the shift key
	 */
	shiftKey: false,

	/**
	 * Determines the pressed state of the ctrl key
	 */
	ctrlKey: false,

	/**
	 * Determines the pressed state of the alt key
	 */
	altKey: false,

	/**
	 * Handles incoming events
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "keydown":
			case "keyup":
				this._handleKeyEvent(/** @type {KeyboardEvent} */ (event));
				break;
		}
	},

	/**
	 * Handles incoming keyboard events
	 * @param {KeyboardEvent} event
	 */
	_handleKeyEvent(event) {
		if (event.shiftKey !== this.shiftKey) {
			this.shiftKey = event.shiftKey;
		}

		if (event.ctrlKey !== this.ctrlKey) {
			this.ctrlKey = event.ctrlKey;
		}

		if (event.altKey !== this.altKey) {
			this.altKey = event.altKey;
		}
	},

	/**
	 * @param {Window} win
	 */
	init(win) {
		win.addEventListener("keydown", this);
		win.addEventListener("keyup", this);
	}
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class BrowserAccessibility {
	/** @type {Window} */
	#win = null;

	get #doc() {
		return this.#win.document;
	}

	#a11yRingTrackerPref = "dot.a11y.track_focus_ring.enabled";

	/**
	 * The focus ring element used to surround focused elements
	 * @type {BrowserA11yRing}
	 */
	get focusRingElement() {
		return /** @type {BrowserA11yRing} */ (
			this.#doc.querySelector("browser-a11y-ring") ||
				this.#doc.createElement("browser-a11y-ring")
		);
	}

	/**
	 * Tracks changes to the focus position in the DOM
	 * @param {CustomEvent<Element>} event
	 */
	#onFocusChange(event) {
		if (this.shouldTrackFocusRing) {
			this.#doc.documentElement.appendChild(this.focusRingElement);
			this.focusRingElement.dispatchEvent(
				new CustomEvent(event.type, { detail: event.detail })
			);
		} else if (!this.shouldTrackFocusRing && this.focusRingElement) {
			this.focusRingElement.remove();
		}
	}

	/**
	 * Determines whether the track focus ring feature is enabled
	 */
	get shouldTrackFocusRing() {
		return Services.prefs.getBoolPref(this.#a11yRingTrackerPref, false);
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.#win = win;

		this.#doc.addEventListener(
			"focuschange",
			this.#onFocusChange.bind(this)
		);
	}
}

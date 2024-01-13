/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserUrlbarInput extends BrowserContextualMixin(HTMLInputElement) {
	/**
	 * The urlbar host element that owns this element
	 * @returns {BrowserUrlbar}
	 */
	get urlbarHost() {
		return this.host.closest("browser-urlbar");
	}

	/**
	 * Fired when the urlbar input gains or loses focus
	 * @param {FocusEvent} event
	 */
	_onFocus(event) {
		const isFocused = event.type == "focusin";

		this.urlbarHost.focused = isFocused;

		if (!isFocused) {
			this.urlbarHost.setExpanded(false);
		}
	}

	/**
	 * Fired when the urlbar input value is changed
	 * @param {Event} event
	 */
	_onInput(event) {
		const hasUserValue = !!this.value.length;

		this.urlbarHost.setExpanded(hasUserValue, true);

		this.focus();
	}

	/**
	 * Handles incoming events to the urlbar input element
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "focusin":
			case "focusout":
				this._onFocus(/** @type {FocusEvent} */ (event));
				break;
			case "input":
				this._onInput(/** @type {Event} */ (event));
				break;
		}
	}

	connectedCallback() {
		// Ensure we can only have one of these components per urlbar
		if (
			this.host.customizableContainer.querySelectorAll(
				"input[is=browser-urlbar-input]"
			).length > 1
		) {
			this.remove();
			return;
		}

		this.setAttribute("inputmode", "mozAwesomebar");
		this.placeholder = "Search using DuckDuckGo or enter address";

		this.addEventListener("focusin", this);
		this.addEventListener("focusout", this);

		this.addEventListener("input", this);
	}

	disconnectedCallback() {
		this.removeEventListener("focusin", this);
		this.removeEventListener("focusout", this);

		this.removeEventListener("input", this);
	}
}

customElements.define("browser-urlbar-input", BrowserUrlbarInput, {
	extends: "input"
});

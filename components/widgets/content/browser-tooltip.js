/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MozPopupElement = MozElements.MozElementMixin(XULPopupElement);

class BrowserTooltip extends MozPopupElement {
	/**
	 * Determines whether the tooltip is visible or not
	 */
	get visible() {
		return this.state !== "closed";
	}

	/**
	 * Fired when the tooltip is fully shown
	 * @param {Event} event
	 */
	_onTooltipShown(event) {
		this.toggleAttribute("showing", true);
	}

	/**
	 * Fired when the tooltip starts to hide
	 * @param {Event} event
	 */
	_onTooltipHiding(event) {
		this.removeAttribute("showing");
	}

	connectedCallback() {
		this.classList.add("browser-tooltip");

		this.setAttribute("animate", "true");

		this.addEventListener("popupshown", this._onTooltipShown.bind(this));
		this.addEventListener("popuphiding", this._onTooltipHiding.bind(this));
	}
}

customElements.define("browser-tooltip", BrowserTooltip, {
	extends: "tooltip"
});

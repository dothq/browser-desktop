/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MozPopupElement = MozElements.MozElementMixin(XULPopupElement);

class BrowserTooltip extends MozPopupElement {
	TOOLTIP_LOCATION_FLOATING = "floating";
	TOOLTIP_LOCATION_STATUS = "status";

	/**
	 * Determines whether the tooltip is visible or not
	 */
	get visible() {
		return this.state !== "closed";
	}

	/**
	 * Determines whether we are allowed to show this tooltip visually or not
	 */
	get canShow() {
		return (
			this.tooltipDisplayLocation == this.TOOLTIP_LOCATION_FLOATING ||
			this.getAttribute("location") == this.TOOLTIP_LOCATION_FLOATING
		);
	}

	/**
	 * Determines where the tooltip should be displayed
	 * States:
	 *   0: Show as a floating tip
	 *   1: Show in the statusbar (if available)
	 */
	get tooltipDisplayLocation() {
		switch (
			Services.prefs.getIntPref("browser.chrome.toolbar_tips.location", 0)
		) {
			case 1:
				return this.TOOLTIP_LOCATION_STATUS;
			default:
				return this.TOOLTIP_LOCATION_FLOATING;
		}
	}

	/**
	 * Determines whether this tooltip should show in the statusbar instead
	 */
	_maybeSetStatus() {
		if (this.tooltipDisplayLocation == this.TOOLTIP_LOCATION_STATUS) {
			// Check if we have gDot and the status module
			// because browser-tooltip may be loaded in contexts
			// where we don't have gDot services.
			if (gDot && gDot.status) {
				const canShowLabel = this.state !== "closed" && !this.canShow;

				gDot.status.setStatus(
					"tooltip",
					canShowLabel ? this.label : null
				);
			}
		}
	}

	/**
	 * Fired when the tooltip is fully shown
	 * @param {Event} event
	 */
	_onTooltipShown(event) {
		this.toggleAttribute("showing", this.canShow);

		this._maybeSetStatus();
	}

	/**
	 * Fired when the tooltip starts to hide
	 * @param {Event} event
	 */
	_onTooltipHiding(event) {
		this.removeAttribute("showing");
	}

	/**
	 * Fired when the tooltip is fully hidden
	 * @param {Event} event
	 */
	_onTooltipHidden(event) {
		this._maybeSetStatus();
	}

	connectedCallback() {
		this.classList.add("browser-tooltip");

		this.setAttribute("animate", "true");

		this.addEventListener("popupshown", this._onTooltipShown.bind(this));
		this.addEventListener("popuphiding", this._onTooltipHiding.bind(this));
		this.addEventListener("popuphidden", this._onTooltipHidden.bind(this));
	}

	disconnectedCallback() {
		this.removeEventListener("popupshown", this._onTooltipShown.bind(this));
		this.removeEventListener(
			"popuphiding",
			this._onTooltipHiding.bind(this)
		);
		this.removeEventListener(
			"popuphidden",
			this._onTooltipHidden.bind(this)
		);
	}
}

customElements.define("browser-tooltip", BrowserTooltip, {
	extends: "tooltip"
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { TooltipLabelProvider } = ChromeUtils.importESModule(
	"resource://gre/modules/TooltipLabelProvider.sys.mjs"
);

class BrowserButton extends BrowserContextualMixin(HTMLButtonElement) {
	constructor() {
		super();

		this.resizeObserver = new ResizeObserver(
			this._onBrowserButtonResize.bind(this)
		);
	}

	/**
	 * The allowed customizable attributes for the browser button
	 */
	static get customizableAttributes() {
		return {
			mode: "mode",

			label: "string",
			icon: "string",
			labelAuxiliary: "string"
		};
	}

	/**
	 * The anatomy of the button
	 *
	 * @typedef {Object} BrowserButtonElements
	 * @property {HTMLSpanElement} label - The buttons's label
	 * @property {BrowserIcon} icon - The button's icon
	 * @property {BrowserTooltip} tooltip - The button's tooltip
	 *
	 * @returns {BrowserButtonElements}
	 */
	get elements() {
		return {
			label: /** @type {HTMLSpanElement} */ (
				this.querySelector(".browser-button-label") ||
					html(
						"span",
						{ class: "browser-button-label" },
						this.getAttribute("label") || ""
					)
			),
			icon: /** @type {BrowserIcon} */ (
				this.querySelector(".browser-button-icon") ||
					html("browser-icon", {
						class: "browser-button-icon",
						name: this.getAttribute("icon") || ""
					})
			),
			tooltip: /** @type {BrowserTooltip} */ (
				this.querySelector("tooltip") ||
					document.createXULElement("tooltip", {
						is: "browser-tooltip"
					})
			)
		};
	}

	/**
	 * The button container element
	 * @type {HTMLDivElement}
	 */
	get container() {
		return this.querySelector(".browser-button-container");
	}

	/**
	 * The icon of the browser button
	 */
	get icon() {
		try {
			let uri = Services.io.newURI(this.elements.icon.name);

			return uri.spec;
		} catch (e) {}

		return this.elements.icon.name;
	}

	/**
	 * Updates the icon on the browser button
	 * @param {string} newIcon
	 */
	set icon(newIcon) {
		if (newIcon == this.icon) return;

		this.setAttribute("icon", newIcon);

		this.elements.icon.name = newIcon;
	}

	/**
	 * The label of the browser button
	 */
	get label() {
		return this.elements.label.textContent;
	}

	/**
	 * Updates the label of the browser button
	 */
	set label(newLabel) {
		this.setAttribute("label", newLabel);
		this.elements.label.textContent = newLabel;

		this._updateTooltipText();
	}

	/**
	 * The auxiliary label of the browser button
	 */
	get labelAuxiliary() {
		return this.getAttribute("labelauxiliary");
	}

	/**
	 * Updates the auxiliary label of the browser button
	 */
	set labelAuxiliary(newLabelAuxiliary) {
		this.setAttribute("labelauxiliary", newLabelAuxiliary);

		this._updateTooltipText();
	}

	/**
	 * The mode of the browser button
	 */
	get mode() {
		return this.getAttribute("mode");
	}

	/**
	 * Updates the mode of the browser button
	 */
	set mode(newMode) {
		if (!newMode || !newMode.length) {
			this.removeAttribute("mode");
			return;
		}

		this.setAttribute("mode", newMode);
	}

	/**
	 * The computed mode state of the browser button
	 *
	 * Sometimes the mode will differ from what is
	 * actually used by the button:
	 *
	 * An example of this happening is if the area requests
	 * the "icons" mode for all buttons, and a button has
	 * explicitly specified "text" mode.
	 */
	get computedMode() {
		const iconVisible = this.elements.icon.checkVisibility();
		const labelVisible = this.elements.label.checkVisibility();

		if (iconVisible && !labelVisible) {
			return "icons";
		}

		if (labelVisible && !iconVisible) {
			return "text";
		}

		return "icons_text";
	}

	/**
	 * The checked/toggled state of the browser button
	 */
	get checked() {
		return this.hasAttribute("checked");
	}

	/**
	 * Updates the checked/toggled state of the browser button
	 */
	set checked(newChecked) {
		this.toggleAttribute("checked", newChecked);
	}

	/**
	 * The accelerator text of the browser button
	 */
	get accelerator() {
		return this.getAttribute("accelerator");
	}

	/**
	 * Updates the checked/toggled state of the browser button
	 */
	set accelerator(newAccelerator) {
		this.setAttribute("accelerator", newAccelerator);

		this._updateTooltipText();
	}

	/**
	 * Determines whether we should show the tooltip
	 * depending on the conditions of the button.
	 */
	get shouldShowTooltip() {
		const mode = this.computedMode;
		const tooltipText = this.getTooltipText();

		// Always show the tooltip under the icons mode,
		// as the label is never shown to the user.
		if (mode == "icons") {
			return true;
		}

		// If the label text is overflowing on-screen,
		// make sure we always show the tooltip.
		if (this.elements.label.offsetWidth < this.elements.label.scrollWidth) {
			return true;
		}

		// If the label is the same as the tooltip text,
		// skip showing it, as we already have all the
		// information already available on-screen.
		return this.label !== tooltipText;
	}

	/**
	 * Toggles a transitioning psuedo class on the button
	 * @param {string} name
	 */
	_toggleTransitionPsuedoClass(name) {
		this.toggleAttribute(`was-${name}`, true);

		this.addEventListener(
			"transitionend",
			() => {
				this.removeAttribute(`was-${name}`);
			},
			{ once: true }
		);
	}

	/**
	 * Handles internal browser button events
	 * @param {Event} event
	 */
	_handleBrowserButtonEvent(event) {
		switch (event.type) {
			case "mouseleave":
				this._toggleTransitionPsuedoClass("hover");
				break;
			case "focusout":
				this._toggleTransitionPsuedoClass("focus");
				break;
		}
	}

	/**
	 * Fired when the button's physical size is changed
	 */
	_onBrowserButtonResize() {
		const { width, height } = this.container.getBoundingClientRect();

		this.container.style.setProperty(
			"--button-physical-width",
			+width.toFixed(2) + "px"
		);
		this.container.style.setProperty(
			"--button-physical-height",
			+height.toFixed(2) + "px"
		);

		// Recompute the tooltip text as important
		// attributes may have changed
		this._updateTooltipText();
	}

	/**
	 * Computes the tooltip text for this button
	 */
	getTooltipText() {
		const label = this.getAttribute("label");
		const labelAuxiliary = this.getAttribute("labelauxiliary");
		const accelerator = this.getAttribute("accelerator");

		return TooltipLabelProvider.getTooltipText(
			labelAuxiliary || label || "",
			{ shortcut: accelerator }
		);
	}

	/**
	 * Updates the button's tooltip text
	 */
	_updateTooltipText() {
		this.elements.tooltip.hidden = !this.shouldShowTooltip;
		this.elements.tooltip.label = this.getTooltipText();
	}

	/**
	 * Fired when a popup starts showing in the button
	 * @param {Event} event
	 */
	_onPopupShowing(event) {
		if (event.target === this.elements.tooltip) {
			this._updateTooltipText();
		}
	}

	connectedCallback() {
		this.classList.add("browser-button");
		this.classList.toggle(
			/** @type {any} */ (this).buttonId,
			"buttonId" in this
		);

		this.setAttribute("tooltip", "_child");
		this.prepend(this.elements.tooltip);

		this.appendChild(
			html(
				"div",
				{ class: "browser-button-container" },
				this.elements.icon,
				this.elements.label
			)
		);

		this.addEventListener(
			"mouseleave",
			this._handleBrowserButtonEvent.bind(this)
		);
		this.addEventListener(
			"focusout",
			this._handleBrowserButtonEvent.bind(this)
		);

		this.addEventListener("popupshowing", this._onPopupShowing.bind(this));

		this.resizeObserver.observe(this);
	}

	disconnectedCallback() {
		this.removeEventListener(
			"mouseleave",
			this._handleBrowserButtonEvent.bind(this)
		);
		this.removeEventListener(
			"focusout",
			this._handleBrowserButtonEvent.bind(this)
		);
		this.removeEventListener(
			"popupshowing",
			this._onPopupShowing.bind(this)
		);

		this.resizeObserver.disconnect();
	}
}

customElements.define("browser-button", BrowserButton);

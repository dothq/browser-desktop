/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
			icon: "string"
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
		if (newLabel == this.label) return;

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
		if (newLabelAuxiliary == this.labelAuxiliary) return;

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
	}

	/**
	 * Updates the button's tooltip text
	 */
	_updateTooltipText() {
		if (!this.elements.tooltip.visible) return;

		let tooltipText = "";

		if (this.labelAuxiliary) {
			tooltipText = this.labelAuxiliary;
		} else if (this.label) {
			tooltipText = this.label;
		}

		this.elements.tooltip.label = tooltipText;
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

		this.appendChild(
			html(
				"div",
				{ class: "browser-button-container" },
				this.elements.icon,
				this.elements.label
			)
		);

		this.setAttribute("tooltip", "_child");
		this.appendChild(this.elements.tooltip);

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

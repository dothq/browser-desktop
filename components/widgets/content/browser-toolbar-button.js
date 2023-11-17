/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { ModifierKeyManager } = ChromeUtils.importESModule(
	"resource://gre/modules/ModifierKeyManager.sys.mjs"
);

/**
 * @callback Resolvable
 * @param {ReturnType<typeof gDotCommands.createContext>} [data]
 * @returns {any}
 *
 * @typedef StaticOrResolvable
 * @type {(any | (Resolvable))}
 *
 */

class BrowserToolbarButton extends BrowserContextualMixin(HTMLButtonElement) {
	TB_MODIFIER_CHANGE_EVENT = "ToolbarButton::ModifierChange";

	constructor() {
		super();
	}

	/**
	 * The anatomy of the toolbar button
	 *
	 * @typedef {Object} ToolbarButtonElements
	 * @property {HTMLSpanElement} label - The toolbar buttons's label
	 * @property {BrowserIcon} icon - The toolbar button's icon
	 *
	 * @returns {ToolbarButtonElements}
	 */
	get elements() {
		return {
			label:
				this.querySelector(".toolbar-button-label") ||
				/** @type {HTMLSpanElement} */ (
					html("span", { class: "toolbar-button-label" })
				),
			icon:
				this.querySelector(".toolbar-button-icon[active]") ||
				/** @type {BrowserIcon} */ (
					html("browser-icon", {
						class: "toolbar-button-icon",
						active: ""
					})
				)
		};
	}

	/**
	 * The icon of the toolbar button
	 */
	get icon() {
		try {
			let uri = Services.io.newURI(this.elements.icon.name);

			return uri.spec;
		} catch (e) {}

		return this.elements.icon.name;
	}

	/**
	 * Updates the icon on the toolbar button
	 * @param {string} newIcon
	 */
	set icon(newIcon) {
		if (newIcon == this.icon) return;

		this.elements.icon.style.removeProperty("--src");

		try {
			let uri = Services.io.newURI(newIcon);

			if (uri.spec) {
				this.elements.icon.style.setProperty(
					"--src",
					`url(${CSS.escape(newIcon)})`
				);
			}
		} catch (e) {}

		this.elements.icon.name = newIcon;
	}

	/**
	 * The label of the toolbar button
	 */
	get label() {
		return this.elements.label.textContent;
	}

	/**
	 * Updates the label of the toolbar button
	 */
	set label(newLabel) {
		this.elements.label.textContent = newLabel;
		this.title = newLabel;
	}

	/**
	 * The mode of the toolbar button
	 */
	get mode() {
		return this.getAttribute("mode");
	}

	/**
	 * Updates the mode of the toolbar button
	 */
	set mode(newMode) {
		if (!newMode.length) {
			this.removeAttribute("mode");
			return;
		}

		this.setAttribute("mode", newMode);
	}

	_shiftKey = false;
	_ctrlKey = false;
	_altKey = false;

	/**
	 * Determines whether the ctrl key is being held
	 */
	get ctrlKey() {
		return this._ctrlKey;
	}

	set ctrlKey(val) {
		if (val !== this._ctrlKey) {
			this._ctrlKey = val;

			this.dispatchEvent(new CustomEvent(this.TB_MODIFIER_CHANGE_EVENT));
		}
	}

	/**
	 * Determines whether the shift key is being held
	 */
	get shiftKey() {
		return this._shiftKey;
	}

	set shiftKey(val) {
		if (val !== this._shiftKey) {
			this._shiftKey = val;

			this.dispatchEvent(new CustomEvent(this.TB_MODIFIER_CHANGE_EVENT));
		}
	}

	/**
	 * Determines whether the alt key is being held
	 */
	get altKey() {
		return this._altKey;
	}

	set altKey(val) {
		if (val !== this._altKey) {
			this._altKey = val;

			this.dispatchEvent(new CustomEvent(this.TB_MODIFIER_CHANGE_EVENT));
		}
	}

	/**
	 * Handles clicks to the toolbar button
	 * @param {MouseEvent} event
	 */
	_handleTBClick(event) {
		event.stopPropagation();

		if (this.disabled) {
			event.preventDefault();
			return;
		}

		if ("onClick" in this) {
			/** @type {any} */ (this).onClick(event);
		} else if ("handleEvent" in this) {
			/** @type {any} */ (this).handleEvent(event);
		}
	}

	_isHovering = false;

	/**
	 * Handles mouse events for the toolbar button
	 * @param {MouseEvent} event
	 */
	_handleTBMouse(event) {
		this._isHovering = event.type == "mouseover";

		this.shiftKey = event.type == "mouseover" && event.shiftKey;
		this.ctrlKey = event.type == "mouseover" && event.ctrlKey;
		this.altKey = event.type == "mouseover" && event.altKey;

		this.dispatchEvent(new CustomEvent(this.TB_MODIFIER_CHANGE_EVENT));
	}

	_handleTBKeyPress(event) {
		if (!this._isHovering) return;

		this.shiftKey = event.type == "keydown" && event.shiftKey;
		this.ctrlKey = event.type == "keydown" && event.crtlKey;
		this.altKey = event.type == "keydown" && event.altKey;

		this.dispatchEvent(new CustomEvent(this.TB_MODIFIER_CHANGE_EVENT));
	}

	/** @type {IntersectionObserverCallback} */
	_observeIntersections(intersections) {}

	_handleTBModifierChangeEvent(event) {
		if ("handleModifierChangeEvent" in this) {
			/** @type {any} */ (this).handleModifierChangeEvent();
			return;
		}

		if ("handleEvent" in this) {
			/** @type {any} */ (this).handleEvent(event);
			return;
		}
	}

	connectedCallback() {
		this.classList.add("toolbar-button");
		this.classList.toggle(
			/** @type {any} */ (this).buttonId,
			"buttonId" in this
		);

		this.appendChild(this.elements.icon);
		this.appendChild(this.elements.label);

		this.addEventListener("click", this._handleTBClick.bind(this));
		this.addEventListener("mouseover", this._handleTBMouse.bind(this));
		this.addEventListener("mouseout", this._handleTBMouse.bind(this));

		window.addEventListener("keydown", this._handleTBKeyPress.bind(this));
		window.addEventListener("keyup", this._handleTBKeyPress.bind(this));

		this.addEventListener(
			this.TB_MODIFIER_CHANGE_EVENT,
			this._handleTBModifierChangeEvent.bind(this)
		);

		this._intersectionObserver = new IntersectionObserver(
			this._observeIntersections.bind(this),
			{ threshold: 0 }
		);
		this._intersectionObserver.observe(this);
	}

	/**
	 * Handles attribute changes to the component
	 * @param {string} attribute
	 * @param {any} oldValue
	 * @param {any} newValue
	 */
	attributeChangedCallback(attribute, oldValue, newValue) {
		if (oldValue === newValue || !newValue) return;

		switch (attribute) {
			case "routine":
				this.routineId = newValue;

				break;
		}
	}

	disconnectedCallback() {
		this.removeEventListener("click", this._handleTBClick.bind(this));
		this.removeEventListener("mouseover", this._handleTBMouse.bind(this));
		this.removeEventListener("mouseout", this._handleTBMouse.bind(this));
		this.removeEventListener("mousemove", this._handleTBMouse.bind(this));

		window.removeEventListener(
			"keydown",
			this._handleTBKeyPress.bind(this)
		);
		window.removeEventListener("keyup", this._handleTBKeyPress.bind(this));

		this.removeEventListener(
			this.TB_MODIFIER_CHANGE_EVENT,
			this._handleTBModifierChangeEvent.bind(this)
		);
	}
}

customElements.define("browser-toolbar-button", BrowserToolbarButton);

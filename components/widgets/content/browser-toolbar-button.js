/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @callback Resolvable
 * @param {ReturnType<typeof gDotCommands.createContext>} [data]
 * @returns {any}
 *
 * @typedef StaticOrResolvable
 * @type {(any | (Resolvable))}
 *
 */

class BrowserToolbarButton extends HTMLButtonElement {
	constructor() {
		super();

		this._context = gDotCommands.createContext({ win: window });
	}

	static get observedAttributes() {
		return ["routine"];
	}

	/**
	 * Button handler context
	 */
	get context() {
		return this._context;
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
				/** @type {HTMLSpanElement} */ (html("span", { class: "toolbar-button-label" })),
			icon:
				this.querySelector(".toolbar-button-icon") ||
				/** @type {BrowserIcon} */ (html("browser-icon", { class: "toolbar-button-icon" }))
		};
	}

	/**
	 * The icon of the toolbar button
	 */
	get icon() {
		return this.elements.icon.name;
	}

	/**
	 * Updates the icon on the toolbar button
	 * @param {string} newIcon
	 */
	set icon(newIcon) {
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
	 * The browser-toolbar element for this toolbar button
	 * @type {BrowserToolbar | null}
	 */
	get toolbar() {
		return this.closest("browser-toolbar");
	}

	/**
	 * The routine ID for this toolbar button
	 * Used to determine what icon, label and action to use
	 */
	get routineId() {
		return this.getAttribute("routine");
	}

	/**
	 * Updates the routine ID of the toolbar button
	 */
	set routineId(newRoutine) {
		this.setAttribute("routine", newRoutine);
		this.handleRoutineUpdate();
	}

	/**
	 * Gets the routine data using the routine ID attribute
	 */
	get routine() {
		return gDotRoutines.getRoutineById(this.routineId);
	}

	/**
	 * Handles clicks to the toolbar button
	 * @param {MouseEvent} event
	 */
	_handleTBClick(event) {
		if (this.disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		console.log("CLICK", this.routine);

		if (this.routine) {
			this.routine.performRoutine(event);
		}
	}

	handleRoutineUpdate() {
		this.label = this.routine.localizedLabel;
		this.title = this.routine.localizedLabelAndKeybind;
		this.icon = this.routine.icon;
	}

	connectedCallback() {
		this.classList.add("toolbar-button");

		this.appendChild(this.elements.icon);
		this.appendChild(this.elements.label);

		if (this.routine) {
			this.handleRoutineUpdate();
		} else {
			if (this.getAttribute("label")) {
				this.label = this.getAttribute("label");
				this.title = this.label;
				this.removeAttribute("label");
			}

			if (this.getAttribute("icon")) {
				this.icon = this.getAttribute("icon");
				this.removeAttribute("icon");
			}
		}

		this.addEventListener("click", this._handleTBClick);
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
		this.removeEventListener("click", this._handleTBClick);
	}
}

customElements.define("browser-toolbar-button", BrowserToolbarButton);

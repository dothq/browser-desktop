/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableArea extends MozHTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		this.shadowRoot.appendChild(this.customizableContainer);

		this.shadowRoot.append(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/skin/browser.css"
			})
		);
	}

	/**
	 * Determines which attributes should be persisted and stored to preferences
	 */
	static get observedAttributes() {
		return ["mode", "orientation", "accent"];
	}

	/**
	 * The area's name
	 */
	get name() {
		return this.getAttribute("name");
	}

	/**
	 * Update the area's name
	 */
	set name(newName) {
		this.setAttribute("name", newName);
	}

	/**
	 * The area's layout type
	 */
	get layout() {
		return this.getAttribute("layout");
	}

	/**
	 * Update the area's layout type
	 */
	set layout(newLayout) {
		this.setAttribute("layout", newLayout);
	}

	/**
	 * Determines whether keybindings should be shown
	 */
	get showKeybindings() {
		return this.hasAttribute("keybindings");
	}

	/**
	 * Update the area's keybindings visibility
	 */
	set showKeybindings(newValue) {
		this.toggleAttribute("keybindings", newValue);
	}

	/**
	 * Determines the area's display mode
	 *
	 * `icons` - Only show icons in toolbar buttons
	 *
	 * `text` - Only show text in toolbar buttons
	 *
	 * `icons_text` - Show icons beside text in toolbar buttons
	 */
	get mode() {
		return this.getAttribute("mode");
	}

	/**
	 * Update the area's display mode
	 */
	set mode(newMode) {
		this.setAttribute("mode", newMode);
	}

	/**
	 * The configuration preference ID for this area
	 */
	get prefId() {
		return `dot.customizable.areas.${this.name}`;
	}

	/**
	 * Determines whether this area is horizontal
	 */
	get isHorizontal() {
		return this.orientation == "horizontal";
	}

	/**
	 * Determines whether this area is vertical
	 */
	get isVertical() {
		return this.orientation == "vertical";
	}

	/**
	 * The orientation of this area
	 *
	 * @returns {"horizontal" | "vertical"}
	 */
	get orientation() {
		return this.getAttribute("orientation") == "vertical"
			? "vertical"
			: "horizontal";
	}

	/**
	 * Updates the orientation of this area
	 */
	set orientation(newValue) {
		this.setAttribute("orientation", newValue);
	}

	/**
	 * Determines whether this area has an accent color
	 */
	get accent() {
		return this.hasAttribute("accent");
	}

	/**
	 * Updates the orientation of this area
	 */
	set accent(toggled) {
		this.toggleAttribute("accent", toggled);
	}

	get customizableContainer() {
		return (
			this.shadowRoot.querySelector(".customizable-container") ||
			html("div", {
				class: "customizable-container",
				part: "customizable"
			})
		);
	}

	/**
	 * Connect this customizable area to a configuration
	 * @param {object} options
	 * @param {string} options.name - The name of this area - used to identify this area so it must be unique
	 * @param {string} options.layout - The type of layout that this area is
	 * @param {boolean} [options.showKeybindings] - Determines whether keybindings should be shown in widgets
	 */
	connect(options) {
		this.name = options.name;
		this.layout = options.layout;
		this.showKeybindings = options.showKeybindings;

		this.classList.add("customizable-area");
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;
	}
}

customElements.define("browser-customizable-area", BrowserCustomizableArea);

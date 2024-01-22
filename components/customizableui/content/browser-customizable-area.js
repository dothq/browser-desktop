/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableArea extends BrowserCustomizableContextMixin(
	MozHTMLElement
) {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		this.shadowRoot.appendChild(this.customizableContainer);

		this.shadowRoot.prepend(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/skin/browser.css"
			})
		);

		window.addEventListener(
			"DOMContentLoaded",
			this.maybeShowDebug.bind(this),
			{ once: true }
		);
	}

	/**
	 * Determines which attributes should be persisted and stored to preferences
	 */
	static get observedAttributes() {
		return [
			"mode",
			"orientation",
			"accent",
			"width",
			"height",
			"background",
			"text"
		];
	}

	/**
	 * The customizable components to inherit from when used in this area
	 *
	 * @typedef {Record<string, Element | DocumentFragment>} CustomizableAreaComponents
	 * @returns {CustomizableAreaComponents}
	 */
	static get customizableComponents() {
		return {
			button: null
		};
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
	 * Determines whether keybindings should be shown
	 */
	get showKeybindings() {
		return this.hasAttribute("showkeybindings");
	}

	/**
	 * Update the area's keybindings visibility
	 */
	set showKeybindings(newValue) {
		this.toggleAttribute("showkeybindings", newValue);
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

	/**
	 * The styles to use inside this area
	 * @type {string[]}
	 */
	styles = [];

	/**
	 * The container where customizable elements will be rendered to
	 */
	get customizableContainer() {
		return /** @type {HTMLElement} */ (
			this.shadowRoot.querySelector(`[part="customizable"]`) ||
				html("div", {
					class: "customizable-container",
					part: "customizable"
				})
		);
	}

	/**
	 * Determines whether a child can be appended to this customizable area
	 * @param {Element} node
	 * @param {string} part
	 */
	canAppendChild(node, part) {
		return !!this.shadowRoot;
	}

	/**
	 * Renders a registered template
	 * @param {string} templateId
	 * @returns {Element | DocumentFragment}
	 */
	createTemplateFragment(templateId) {
		return gDot.customizable.createTemplateFragment(this, templateId);
	}

	/**
	 * Creates a new customizable component
	 * @param {Parameters<typeof gDot.customizable.internal.createComponent>[0]} type
	 * @param {Parameters<typeof gDot.customizable.internal.createComponent>[1]} [attributes]
	 * @param {Parameters<typeof gDot.customizable.internal.createComponent>[2]} [children]
	 * @returns
	 */
	createCustomizableComponent(type, attributes, children) {
		return gDot.customizable.internal.createComponent(
			type,
			attributes,
			children,
			{
				area: this
			}
		);
	}

	maybeShowDebug() {
		this.shadowRoot
			.querySelector("dev-customizable-area-context")
			?.remove();

		if (
			Services.prefs.getBoolPref(
				"dot.customizable.debug_context.enabled",
				false
			)
		) {
			this.shadowRoot.appendChild(html("dev-customizable-area-context"));
		}
	}

	renderDebugHologram(hologram) {
		const lines = [
			`Type: ${this.name}`,
			`Orientation: ${this.orientation}`,
			`Mode: ${this.mode}`
		];

		return html("div", {}, ...lines.map((t) => html("span", {}, t)));
	}

	/**
	 * Initialises all logic and styling on the customizable area
	 */
	#init() {
		Services.prefs.addObserver(
			"dot.customizable.debug_context.enabled",
			this.maybeShowDebug.bind(this)
		);

		this.maybeShowDebug();

		this.shadowRoot.appendChild(
			BrowserDebugHologram.create(
				{
					id: "area",
					prefId: "dot.customizable.debug_information.enabled"
				},
				/** @type {any} */ (this).renderDebugHologram.bind(this)
			)
		);
	}

	/**
	 * Connect this customizable area to a configuration
	 * @param {string} name - The name of this area - used to identify this area so it must be unique
	 * @param {object} [options]
	 * @param {boolean} [options.showKeybindings] - Determines whether keybindings should be shown in widgets
	 * @param {"horizontal" | "vertical"} [options.orientation] - The default orientation of this area
	 * @param {string} [options.mode] - The default mode to use for this area
	 * @param {string[]} [options.styles] - The styles to use within this area
	 * @param {string} [options.templateId] - The template ID to use for this area
	 */
	connect(name, options) {
		this.name = name;
		this.showKeybindings = options?.showKeybindings;
		this.orientation = options?.orientation || "horizontal";
		if (options?.mode) {
			this.mode = options?.mode;
		}
		this.styles = this.styles.concat(options?.styles || []);

		this.classList.add("customizable-area");

		this.shadowRoot.prepend(
			...(options?.styles || []).map((s) =>
				html("link", {
					rel: "stylesheet",
					href: s
				})
			)
		);

		if (options?.templateId) {
			const fragment = this.createTemplateFragment(options.templateId);

			this.customizableContainer.appendChild(fragment);
		}

		this.#init();
	}

	/**
	 * Fired when an attribute on the area changes
	 * @param {string} attributeName
	 * @param {any} oldValue
	 * @param {any} newValue
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		switch (attributeName) {
			case "width":
				this.style.setProperty("--area-width", newValue);
				break;
			case "height":
				this.style.setProperty("--area-height", newValue);
				break;
			case "background":
				this.style.setProperty("--area-background", newValue);
				break;
			case "text":
				this.style.setProperty("color", newValue);
				break;
		}
	}
}

customElements.define("browser-customizable-area", BrowserCustomizableArea);

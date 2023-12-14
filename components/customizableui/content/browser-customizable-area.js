/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionsReceiver } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsReceiver.sys.mjs"
);

class BrowserCustomizableArea extends MozHTMLElement {
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
	 * The actions receiver instance
	 * @type {typeof ActionsReceiver.prototype}
	 */
	actionsReceiver = null;

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
	 * The container where customizable elements will be rendered to
	 */
	get customizableContainer() {
		return /** @type {HTMLDivElement} */ (
			this.shadowRoot.querySelector(`[part="customizable"]`) ||
				html("div", {
					class: "customizable-container",
					part: "customizable"
				})
		);
	}

	/**
	 * The associated context for this area
	 *
	 * @typedef {object} CustomizableAreaContext
	 * @property {BrowserCustomizableArea} self - The area associated with this context
	 * @property {number} audience - The audience of this area's context
	 * @property {BrowserTab} tab - The tab associated with this area
	 * @property {ChromeBrowser} browser - The browser associated with this area
	 * @property {Window} window - The window associated with this area
	 * @returns {CustomizableAreaContext}
	 */
	get context() {
		const areaHost = /** @type {BrowserCustomizableArea} */ (
			/** @type {ShadowRoot} */ (this.getRootNode()).host
		);

		if (!(areaHost instanceof BrowserCustomizableArea)) {
			throw new Error(
				`BrowserCustomizableArea (${
					this.tagName
				}): Area host is not a customizable area instance, got '${
					/** @type {any} */ (areaHost).constructor.name
				}' instead!`
			);
		}

		if (!areaHost.context) {
			throw new Error(
				`${this.constructor.name} (${this.tagName}): No context available for this area!`
			);
		}

		return areaHost.context;
	}

	/**
	 * Gets a part by its defined name
	 * @param {string} partName
	 * @returns {Element | DocumentFragment}
	 */
	getPartByName(partName) {
		return this.shadowRoot?.querySelector(`[part="${partName}"]`);
	}

	/**
	 * Determines whether a child can be appended to this customizable area
	 * @param {Element} node
	 * @param {string} part
	 */
	canAppendChild(node, part) {
		return true;
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

	/**
	 * Connect this customizable area to a configuration
	 * @param {string} name - The name of this area - used to identify this area so it must be unique
	 * @param {object} [options]
	 * @param {boolean} [options.showKeybindings] - Determines whether keybindings should be shown in widgets
	 * @param {"horizontal" | "vertical"} [options.orientation] - The default orientation of this area
	 * @param {string} [options.mode] - The default mode to use for this area
	 * @param {string[]} [options.styles] - The styles to use within this area
	 */
	connect(name, options) {
		this.name = name;
		this.showKeybindings = options?.showKeybindings;
		this.orientation = options?.orientation || "horizontal";
		if (options?.mode) {
			this.mode = options?.mode;
		}

		this.classList.add("customizable-area");

		this.shadowRoot.prepend(
			...(options?.styles || []).map((s) =>
				html("link", {
					rel: "stylesheet",
					href: s
				})
			)
		);

		Services.prefs.addObserver(
			"dot.customizable.debug_context.enabled",
			this.maybeShowDebug.bind(this)
		);

		this.maybeShowDebug();

		this.actionsReceiver = new ActionsReceiver(this);
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
				this.style.setProperty("background-color", newValue);
				break;
			case "text":
				this.style.setProperty("color", newValue);
				break;
		}
	}
}

customElements.define("browser-customizable-area", BrowserCustomizableArea);

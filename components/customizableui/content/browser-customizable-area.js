/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableArea extends MozHTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		this.shadowRoot.appendChild(this.areaElements.slot);
		this.shadowRoot.appendChild(this.areaElements.container);

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

	/**
	 * The anatomy of the customizable area
	 *
	 * @typedef {Object} CustomizableAreaElements
	 * @property {HTMLDivElement} container - The customizable area's container
	 * @property {HTMLSlotElement} slot - The customizable area's non-customizable slot
	 *
	 * @returns {CustomizableAreaElements}
	 */
	get areaElements() {
		return {
			container: /** @type {HTMLDivElement} */ (
				this.shadowRoot.querySelector(".customizable-container") ||
					html("div", {
						class: "customizable-container",
						part: "customizable"
					})
			),
			slot: /** @type {HTMLSlotElement} */ (
				this.shadowRoot.querySelector("slot") ||
					html("slot", { part: "content" })
			)
		};
	}

	/**
	 * Adds a widget to the customizable area
	 * @param {string} widgetId
	 * @param {object} [options]
	 * @param {number} [options.position] - The position to place the widget, 0 for beginning, null for end
	 * @param {object} [options.widgetArgs] - Arguments to pass to the widget
	 */
	addWidget(widgetId, options) {
		if (!options) options = {};

		let widget = null;

		switch (widgetId) {
			case "custom-button":
			case "back-button":
			case "forward-button":
			case "reload-button":
			case "identity-button":
			case "add-tab-button":
			case "close-tab-button":
				widget = /** @type {BrowserToolbarButton} */ (
					document.createElement("button", { is: widgetId })
				);
				break;
			case "spring":
				widget = document.createElement("browser-spring");
				widget.style.setProperty(
					"--spring-grip",
					options.widgetArgs.grip ?? ""
				);

				break;
			case "tabs-list":
				widget = /** @type {BrowserTabsElement} */ (
					document.createElement("browser-tabs")
				);
				break;
			case "addressbar":
				widget = /** @type {BrowserAddressBar} */ (
					document.createElement("browser-addressbar")
				);
				break;
			case "tab-title":
				widget = /** @type {BrowserTabLabel} */ (
					document.createElement("browser-tab-label")
				);
				break;
			case "tab-icon":
				widget = /** @type {BrowserTabIcon} */ (
					document.createElement("browser-tab-icon")
				);
				break;
		}

		if (!widget) {
			console.warn(
				`Unknown widget with ID '${widgetId}' for area '${this.name}'.`
			);
			return;
		}

		for (const [key, value] of Object.entries(options.widgetArgs || {})) {
			widget.setAttribute(`customizablearg-${key}`, value);
		}

		const position =
			options.position ?? this.areaElements.container.childNodes.length;

		this.areaElements.container.insertBefore(
			widget,
			this.areaElements.container.childNodes[position]
		);
	}

	/**
	 * Handles incoming preference updates
	 * @param {nsIPrefBranch} subject
	 * @param {string} topic
	 * @param {string} data
	 */
	_observePrefs(subject, topic, data) {
		console.log(subject, topic, data);
		if (data == this.prefId) {
			console.log("observe prefs");
			this.render({ partial: true });
		}
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

		Services.prefs.addObserver(this.prefId, this._observePrefs.bind(this));

		this.render();

		this.classList.add("customizable-area");
	}

	/**
	 * The raw stored data for this area
	 * @returns
	 */
	_getData() {
		const data = Services.prefs.getStringPref(this.prefId, "{}");

		let parsed = {
			mode: "icons",
			orientation: "horizontal",
			widgets: []
		};

		return {
			...parsed,
			...JSON.parse(data)
		};
	}

	_createErrorBarrier() {
		const error = document.createElement("div");
		error.classList.add("customizable-area-error");

		const stylesheet = /** @type {HTMLLinkElement} */ (
			document.createElement("link")
		);
		stylesheet.setAttribute("rel", "stylesheet");
		stylesheet.href =
			"chrome://dot/content/widgets/browser-customizable-area-error.css";

		error.attachShadow({ mode: "open" });
		error.shadowRoot.appendChild(stylesheet);

		const errorShadowContainer = document.createElement("div");
		errorShadowContainer.classList.add("customizable-area-error-container");

		const errorMessage = document.createElement("span");
		errorMessage.textContent = "We're unable to display this area.";

		const errorButtonContainer = document.createElement("div");
		errorButtonContainer.classList.add(
			"customizable-area-error-button-container"
		);

		const retryButton = document.createElement("button");
		retryButton.textContent = "Retry";

		const resetButton = document.createElement("button");
		resetButton.textContent = "Reset to default";

		retryButton.addEventListener("click", () => {
			error.hidden = true;

			setTimeout(() => {
				this.render();
			}, 100);
		});

		resetButton.addEventListener("click", () => {
			console.log("todo: reset area");
		});

		errorButtonContainer.appendChild(retryButton);
		errorButtonContainer.appendChild(resetButton);

		errorShadowContainer.appendChild(errorMessage);
		errorShadowContainer.appendChild(errorButtonContainer);

		error.shadowRoot.appendChild(errorShadowContainer);

		return error;
	}

	/**
	 * Renders all registered widgets and gizmos for this area
	 * @param {object} [options]
	 * @param {boolean} [options.partial] - Determines whether to perform a partial render rather than a full render
	 */
	render(options) {
		const { partial } = options || {};

		// If we're not doing a partial render, clear out the container's children
		if (true) {
			this.areaElements.container.replaceChildren("");
		}

		const errorPanel = this.shadowRoot.querySelector(
			".customizable-area-error"
		);
		if (errorPanel) {
			errorPanel.remove();
		}

		let data = {};

		try {
			data = this._getData();
		} catch (e) {
			console.error(`Failed to render area '${this.name}'!`, e);

			try {
				const errorPanel = this.shadowRoot.querySelector(
					".customizable-area-error"
				);
				if (errorPanel) {
					errorPanel.remove();
				}

				this.areaElements.container.replaceChildren("");
				this.shadowRoot.appendChild(this._createErrorBarrier());
			} catch (e) {
				console.error(
					"CATASTROPHIC ERROR! Unable to render error element for failed error!",
					e
				);
				return;
			}

			return;
		}

		this.mode = data.mode;
		this.orientation =
			data.orientation == "vertical" ? "vertical" : "horizontal";
		this.accent = !!data.accent;

		for (let i = 0; i < data.widgets.length; i++) {
			const widget = data.widgets[i];
			let widgetId = null;
			let widgetArgs = {};

			if (Array.isArray(widget)) {
				widgetId = widget[0];
				widgetArgs = { ...(widget[1] || {}) };
			} else {
				widgetId = widget.toString();
			}

			if (!widgetId || !widgetId.length) return;

			this.addWidget(widgetId, { position: i, widgetArgs });
		}
	}

	/**
	 * Saves an attribute's value to the area config preference
	 * @param {string} name
	 */
	storeAttribute(name) {
		const data = this._getData();

		const attributeData = this[name] ?? this.getAttribute(name);

		data[name] = attributeData;

		try {
			const serialized = JSON.stringify(data);

			Services.prefs.setStringPref(this.prefId, serialized);
		} catch (e) {
			console.error(`Failed to store value of attribute '${name}'!`, e);
			return;
		}
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;
	}

	/**
	 * Fired when an attribute is changed on this area
	 * @param {string} name
	 * @param {string} oldValue
	 * @param {string} newValue
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnectedAndReady) return;

		this.storeAttribute(name);
	}
}

customElements.define("browser-customizable-area", BrowserCustomizableArea);

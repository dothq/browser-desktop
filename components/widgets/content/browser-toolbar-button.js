/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { ModifierKeyManager } = ChromeUtils.importESModule(
	"resource://gre/modules/ModifierKeyManager.sys.mjs"
);

const { CommandSubscription } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandSubscription.sys.mjs"
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
	constructor() {
		super();
	}

	/**
	 * The allowed customizable attributes for the toolbar
	 */
	static get customizableAttributes() {
		return {
			mode: "mode",

			is: "string"
		};
	}

	/**
	 * The command ID to use for this toolbar button
	 */
	commandId = null;

	/**
	 * Optional arguments to pass to the command
	 */
	get commandArgs() {
		return {};
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
	 * The tooltip of the toolbar button
	 */
	get tooltip() {
		return this.title;
	}

	/**
	 * Updates the tooltip of the toolbar button
	 */
	set tooltip(newTooltip) {
		this.title = newTooltip;
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
		if (!newMode || !newMode.length) {
			this.removeAttribute("mode");
			return;
		}

		this.setAttribute("mode", newMode);
	}

	/**
	 * Handles incoming mutations to the attached command
	 *
	 * @param {string} audience
	 * @param {any} attributeName
	 * @param {any} value
	 */
	observeCommandMutation(audience, attributeName, value) {
		if (this.hostContext.audience != audience) return;

		switch (attributeName) {
			case "labelAuxiliary":
				this.tooltip = value;
				break;
			case "label":
			case "icon":
			case "disabled":
			case "inert":
			case "mode":
				this[attributeName] = value;
				break;
			default:
				this.setAttribute(attributeName, value);
				break;
		}
	}

	/**
	 * Triggered when a panel is opened onto the toolbar button
	 * @param {CustomEvent<{ id: string }>} event
	 */
	_onTBPanelOpen(event) {
		this.toggleAttribute("active", true);
	}

	/**
	 * Triggered when a panel is opened onto the toolbar button
	 * @param {CustomEvent<{ id: string }>} event
	 */
	_onTBPanelClose(event) {
		this.removeAttribute("active");
	}

	connectedCallback() {
		this.classList.add("toolbar-button");
		this.classList.toggle(
			/** @type {any} */ (this).buttonId,
			"buttonId" in this
		);

		this.appendChild(
			html(
				"div",
				{ class: "toolbar-button-container" },
				this.elements.icon,
				this.elements.label
			)
		);

		if (this.commandId) {
			this.commandSubscription = new CommandSubscription(
				this,
				this.commandId,
				this.observeCommandMutation.bind(this)
			);

			this.addEventListener(
				"click",
				this.commandSubscription.invoke.bind(
					this.commandSubscription,
					this.commandArgs
				)
			);
		}

		this.addEventListener(
			"BrowserPanels::PanelOpen",
			this._onTBPanelOpen.bind(this)
		);

		this.addEventListener(
			"BrowserPanels::PanelClose",
			this._onTBPanelClose.bind(this)
		);
	}

	disconnectedCallback() {
		if (this.commandSubscription) {
			this.commandSubscription.destroy();
			this.commandSubscription = null;
		}

		this.removeEventListener(
			"BrowserPanels::PanelOpen",
			this._onTBPanelOpen.bind(this)
		);

		this.removeEventListener(
			"BrowserPanels::PanelClose",
			this._onTBPanelClose.bind(this)
		);
	}
}

customElements.define("browser-toolbar-button", BrowserToolbarButton);

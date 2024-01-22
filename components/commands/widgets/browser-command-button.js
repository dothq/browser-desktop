/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { CommandSubscription } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandSubscription.sys.mjs"
);

class BrowserCommandButton extends BrowserCommandElementMixin(BrowserButton) {
	constructor() {
		super();
	}

	/**
	 * Handles incoming mutations to the attached command
	 *
	 * @param {string} audience
	 * @param {any} attributeName
	 * @param {any} value
	 */
	_observeCommandMutation(audience, attributeName, value) {
		switch (attributeName) {
			case "labelAuxiliary":
				this.tooltip = value;
				break;
			case "label":
			case "icon":
			case "disabled":
			case "inert":
			case "mode":
			case "checked":
				this[attributeName] = value;
				break;
			default:
				this.setAttribute(attributeName, value);
				break;
		}
	}

	/**
	 * Triggered when a panel is opened onto the command button
	 * @param {CustomEvent<{ id: string }>} event
	 */
	_onButtonPanelOpen(event) {
		this.toggleAttribute("menuactive", true);
	}

	/**
	 * Triggered when a panel is opened onto the command button
	 * @param {CustomEvent<{ id: string }>} event
	 */
	_onButtonPanelClose(event) {
		this.removeAttribute("menuactive");
	}

	/**
	 * Triggered when a mouse event is fired on the command button
	 * @param {Event} event
	 */
	_onButtonMouse(event) {
		const isMousedown = event.type == "mousedown";
		const isMouseup = event.type == "mouseup";

		if (isMousedown || isMouseup) {
			// Only allow left click and middle clicks
			const isAllowedInput =
				/** @type {MouseEvent} */ (event).button <= 1;

			if (!isAllowedInput) return;
		}

		if (isMousedown) {
			event.preventDefault();
			event.stopPropagation();
		}

		if (event.type == "mouseleave") {
			window.addEventListener(
				"mouseup",
				() => this.toggleAttribute("mouseactive", false),
				{ once: true }
			);
		} else {
			const isKeydown =
				event.type == "keydown" &&
				["Enter", "Space"].includes(
					/** @type {KeyboardEvent} */ (event).code
				);

			const canCommand =
				(this.hasAttribute("mouseactive") && isMouseup) || isKeydown;

			this.toggleAttribute("mouseactive", isMousedown || isKeydown);

			if (canCommand) {
				this._doCommand.call(this, event);
			}
		}
	}

	/**
	 * Triggered when the command button is right clicked to open a context menu
	 * @param {MouseEvent} event
	 */
	_onButtonContextMenu(event) {
		// todo: add context menu for command buttons
	}

	connectedCallback() {
		super.connectedCallback();

		this.addEventListener("mousedown", this._onButtonMouse.bind(this));
		this.addEventListener("mouseup", this._onButtonMouse.bind(this));
		this.addEventListener("mouseleave", this._onButtonMouse.bind(this));
		this.addEventListener("keydown", this._onButtonMouse.bind(this));
		this.addEventListener("keyup", this._onButtonMouse.bind(this));

		this.addEventListener(
			"contextmenu",
			this._onButtonContextMenu.bind(this)
		);

		this.addEventListener(
			"BrowserPanels::PanelOpen",
			this._onButtonPanelOpen.bind(this)
		);

		this.addEventListener(
			"BrowserPanels::PanelClose",
			this._onButtonPanelClose.bind(this)
		);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener("mousedown", this._onButtonMouse.bind(this));
		this.removeEventListener("mouseenter", this._onButtonMouse.bind(this));
		this.removeEventListener("mouseleave", this._onButtonMouse.bind(this));
		this.removeEventListener("keydown", this._onButtonMouse.bind(this));
		this.removeEventListener("keyup", this._onButtonMouse.bind(this));

		this.removeEventListener(
			"contextmenu",
			this._onButtonContextMenu.bind(this)
		);

		this.removeEventListener(
			"BrowserPanels::PanelOpen",
			this._onButtonPanelOpen.bind(this)
		);

		this.removeEventListener(
			"BrowserPanels::PanelClose",
			this._onButtonPanelClose.bind(this)
		);
	}
}

customElements.define("browser-command-button", BrowserCommandButton);

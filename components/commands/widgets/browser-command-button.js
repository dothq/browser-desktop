/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { CommandSubscription } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandSubscription.sys.mjs"
);

class BrowserCommandButton extends BrowserButton {
	constructor() {
		super();
	}

	/**
	 * The allowed customizable attributes for the command button
	 */
	static get customizableAttributes() {
		return {
			...BrowserButton.customizableAttributes,
			command: "string",
			commandArgs: "object"
		};
	}

	static get observedAttributes() {
		return ["command"];
	}

	/**
	 * The command ID to use for this command button
	 */
	get commandId() {
		return this.getAttribute("command");
	}

	set commandId(newValue) {
		this.setAttribute("command", newValue);
	}

	/**
	 * The command arguments to use for this command button
	 */
	get commandArgs() {
		try {
			return JSON.parse(this.getAttribute("commandargs"));
		} catch (e) {
			return {};
		}
	}

	/**
	 * Handles incoming mutations to the attached command
	 *
	 * @param {number} audience
	 * @param {any} attributeName
	 * @param {any} value
	 */
	_observeCommandMutation(audience, attributeName, value) {
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

		if (isMousedown) event.preventDefault();

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

			this.toggleAttribute("mouseactive", isMousedown || isKeydown);

			const canCommand = isMouseup || isKeydown;

			if (canCommand) {
				this._doCommand.call(this, event);
			}
		}
	}

	/**
	 * Performs the command attached to the command button
	 * @param {Event} [originalEvent]
	 */
	_doCommand(originalEvent) {
		const evt = new CustomEvent("command", {
			detail: {
				originalEvent
			}
		});

		this.dispatchEvent(evt);
	}

	/**
	 * Triggered when the command button is right clicked to open a context menu
	 * @param {MouseEvent} event
	 */
	_onButtonContextMenu(event) {
		// todo: add context menu for command buttons
	}

	/**
	 * Initialises the command subscription on this button
	 */
	_initCommandSubscription() {
		// This is needed so we don't initialise the subscription too early
		if (!this.isConnected) return;

		this.commandSubscription = new CommandSubscription(
			this,
			this.commandId,
			this._observeCommandMutation.bind(this)
		);
	}

	/**
	 * Tear down the command subscription if attached
	 */
	_destroyCommandSubscription() {
		if (this.commandSubscription) {
			this.commandSubscription.destroy();
			this.commandSubscription = null;
		}
	}

	/**
	 * Dispatches an attribute update to the target
	 * @param {string} attributeName
	 * @param {any} oldValue
	 * @param {any} newValue
	 */
	_dispatchAttributeUpdate(attributeName, oldValue, newValue) {
		const evt = new CustomEvent("attributeupdate", {
			detail: {
				name: attributeName,
				oldValue,
				newValue
			}
		});

		this.dispatchEvent(evt);
	}

	connectedCallback() {
		super.connectedCallback();

		if (this.commandId) {
			this._initCommandSubscription();
		}

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

	attributeChangedCallback(attribute, oldValue, newValue) {
		if (!this.isConnected) return;

		switch (attribute) {
			case "command":
				this._destroyCommandSubscription();
				this._initCommandSubscription();
				break;
			default:
				this._dispatchAttributeUpdate(attribute, oldValue, newValue);
				break;
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._destroyCommandSubscription();

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

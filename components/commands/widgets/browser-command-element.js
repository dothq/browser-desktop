/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Creates a BrowserCommandElement
 *
 * @template {Constructor<Element>} T - The base class constructor.
 * @param {T} Base - The base class to extend.
 */
var BrowserCommandElementMixin = (Base) => {
	const BrowserCommandElement = class extends BrowserContextualMixin(Base) {
		/**
		 * The allowed customizable attributes for the command element
		 */
		static get customizableAttributes() {
			const inheritedCustomizableAttributes = /** @type {any} */ (Base)
				.customizableAttributes;

			return {
				...(inheritedCustomizableAttributes || {}),
				commandId: "string",
				commandArgs: "object"
			};
		}

		/**
		 * The tooltip element for this command element
		 */
		get tooltipEl() {
			return /** @type {BrowserTooltip} */ (
				this.querySelector("tooltip") ||
					document.createXULElement("tooltip", {
						is: "browser-tooltip"
					})
			);
		}

		static get observedAttributes() {
			// prettier-ignore
			return (/** @type {any} */ (Base).observedAttributes || []).concat(["commandid"]);
		}

		/**
		 * The command ID to use for this element
		 */
		get commandId() {
			return this.getAttribute("commandid");
		}

		set commandId(newValue) {
			this.setAttribute("commandid", newValue);
		}

		/**
		 * The command arguments to use for this element
		 */
		get commandArgs() {
			try {
				return JSON.parse(this.getAttribute("commandargs"));
			} catch (e) {
				return {};
			}
		}

		/**
		 * Performs the command attached to the element
		 * @param {Event} [originalEvent]
		 */
		_doCommand(originalEvent) {
			const evt = document.createEvent("xulcommandevent");
			evt.initCommandEvent(
				"command",
				true,
				true,
				window,
				0,
				!!(/** @type {MouseEvent} */ (originalEvent).ctrlKey),
				!!(/** @type {MouseEvent} */ (originalEvent).altKey),
				!!(/** @type {MouseEvent} */ (originalEvent).shiftKey),
				!!(/** @type {MouseEvent} */ (originalEvent).metaKey),
				0,
				null,
				/** @type {any} */ (originalEvent).inputSource || 0
			);

			this.dispatchEvent(evt);
		}

		/**
		 * Handles incoming mutations to the attached command
		 *
		 * @param {string} audience
		 * @param {any} attributeName
		 * @param {any} value
		 */
		_observeCommandMutation(audience, attributeName, value) {
			this.setAttribute(attributeName, value);
		}

		/**
		 * Handles incoming mutations to the attached command
		 *
		 * @param {string} audience
		 * @param {any} attributeName
		 * @param {any} value
		 */
		_internalObserveCommandMutation(audience, attributeName, value) {
			// Ignore any mutations when it's not for our audience
			if (this.hostContext.audience != audience) return;

			// If the attribute changed was one of the attributes
			// manually changed by the user, ignore it.
			if (this.customizableAttributes.includes(attributeName)) return;

			if ("_observeCommandMutation" in this) {
				this._observeCommandMutation(audience, attributeName, value);
			} else {
				throw new Error(
					`Method '${
						/** @type {any} */ (this).constructor.name
					}._observeCommandMutation' was not found.`
				);
			}
		}

		/**
		 * Initialises the command subscription on this element
		 */
		_initCommandSubscription() {
			// This is needed so we don't initialise the subscription too early
			if (!this.isConnected) return;

			try {
				this.commandSubscription = new CommandSubscription(
					this,
					this.commandId,
					this._internalObserveCommandMutation.bind(this)
				);
			} catch (e) {
				throw new Error(
					`${this.constructor.name} (${this.tagName}): Failure initializing CommandSubscription for '${this.commandId}'.:\n` +
						e.toString().replace(/^Error: /, "") +
						"\n\n" +
						e.stack || ""
				);
			}
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
			if (super.connectedCallback) {
				super.connectedCallback();
			}

			if (this.commandId) {
				this._initCommandSubscription();
			}
		}

		attributeChangedCallback(attribute, oldValue, newValue) {
			if (!this.isConnected) return;

			switch (attribute) {
				case "commandid":
					this._destroyCommandSubscription();
					this._initCommandSubscription();
					break;
				default:
					super.attributeChangedCallback(
						attribute,
						oldValue,
						newValue
					);
					break;
			}
		}

		disconnectedCallback() {
			if (super.disconnectedCallback) {
				super.disconnectedCallback();
			}

			this._destroyCommandSubscription();
		}
	};

	return BrowserCommandElement;
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionsDispatcher } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsDispatcher.sys.mjs"
);

export class Command {
	/** @type {typeof CommandSubscription.prototype} */
	#subscription = null;

	/** @type {BrowserCustomizableArea} */
	#area = null;

	/** @type {AbortController} */
	abortController = null;

	/**
	 * Flag to abort any processes that persist after tearing down the command
	 *
	 * Must be attached to event listeners so they can be
	 * destroyed after the command is no longer in use!
	 */
	get abortSignal() {
		return this.abortController.signal;
	}

	/**
	 * Creates an empty map for command attributes
	 * @returns {Map<string, any>}
	 */
	createEmptyMap() {
		return new Map(
			Object.entries({ root: null, [this.#area.context.audience]: null })
		);
	}

	/**
	 * Determines whether we can show logs for command dispatches
	 * @returns {boolean}
	 */
	canLog() {
		return Services.prefs.getBoolPref("dot.commands.log.enabled", false);
	}

	/**
	 * @param {typeof CommandSubscription.prototype} subscription
	 * @param {BrowserCustomizableArea} area
	 */
	constructor(subscription, area) {
		this.#subscription = subscription;
		this.#area = area;

		this.abortController = new AbortController();

		this._label = this.createEmptyMap();
		this._labelAuxiliary = this.createEmptyMap();
		this._icon = this.createEmptyMap();
		this._disabled = this.createEmptyMap();
	}

	/**
	 * Destroys this command
	 */
	_destroy() {
		if ("destroy" in this) {
			/** @type {any} */ (this).destroy();
		}

		this.abortController.abort();
	}

	/**
	 * Perform this command
	 *
	 * @param {Record<string, any>} [args]
	 */
	run(args = {}) {}

	/** @type {Map<string, string>} */
	_label = null;

	/** @type {Map<string, string>} */
	_labelAuxiliary = null;

	/** @type {Map<string, string>} */
	_icon = null;

	/** @type {Map<string, boolean>} */
	_disabled = null;

	/**
	 * Updates an attribute on the command
	 *
	 * @param {string} attribute - The attribute to change
	 * @param {any | Record<string, any>} value - The data to set the attribute to
	 */
	setAttribute(attribute, value) {
		if (!(`_${attribute}` in this)) {
			throw new Error(`Unknown attribute with name '${attribute}'!`);
		}

		/** @type {Map<string, string>} */
		const attributeMap = this[`_${attribute}`];

		if (
			!(
				typeof value == "object" &&
				!Array.isArray(value) &&
				value !== null
			)
		) {
			const allValue = value;
			value = {};

			for (const audience of attributeMap.keys()) {
				value[audience] = allValue;
			}
		}

		for (const [audience, audienceValue] of Object.entries(value)) {
			const oldValue = attributeMap.get(audience);
			attributeMap.set(audience, audienceValue);

			if (this.canLog()) {
				console.log(
					`Command: Dispatching mutation of '${attribute}' to '${audienceValue}' on audience '${audience}'.`
				);
			}

			this.#subscription.dispatchMutation(
				audience,
				attribute,
				oldValue,
				audienceValue
			);
		}
	}

	/**
	 * The label for this command
	 * @returns {any}
	 */
	get label() {
		return this._label.get("root");
	}

	/**
	 * Updates the label for this command
	 */
	set label(newValue) {
		this.setAttribute("label", newValue);
	}

	/**
	 * The auxiliary label for this command
	 * @returns {any}
	 */
	get labelAuxiliary() {
		return this._labelAuxiliary.get("root");
	}

	/**
	 * Updates the auxiliary label for this command
	 */
	set labelAuxiliary(newValue) {
		this.setAttribute("labelAuxiliary", newValue);
	}

	/**
	 * The icon for this command
	 * @returns {any}
	 */
	get icon() {
		return this._icon.get("root");
	}

	/**
	 * Updates the icon for this command
	 */
	set icon(newValue) {
		this.setAttribute("icon", newValue);
	}

	/**
	 * Determines the disabled state of this command
	 * @returns {any}
	 */
	get disabled() {
		return !!this._disabled.get("root");
	}

	/**
	 * Updates the disabled state of this command
	 */
	set disabled(newValue) {
		this.setAttribute("disabled", newValue);
	}

	/**
	 * The context for this command
	 */
	get context() {
		return this.#area.context;
	}

	/**
	 * The window assocated with this command
	 */
	get window() {
		return this.context.window;
	}

	/**
	 * The actions dispatcher for this command
	 */
	get actions() {
		return new ActionsDispatcher(this.#area);
	}
}

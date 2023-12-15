/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionsDispatcher } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsDispatcher.sys.mjs"
);

const { CommandAudiences } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandAudiences.sys.mjs"
);

const { DOMUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/DOMUtils.sys.mjs"
);

/**
 * @typedef {ReturnType<typeof BrowserContextualMixin<typeof Element>>["prototype"] & { commandArgs: T }} CommandSubscriber
 * @template [T=Record<string, any>]
 */

/**
 * @typedef {CustomEvent<{}> & { detail: { originalEvent: E }, target: CommandSubscriber<T> }} CommandEvent
 * @template [T=Record<string, any>]
 * @template [E=Event]
 */

export class Command {
	/** @type {typeof CommandSubscription.prototype} */
	#subscription = null;

	/**
	 * The audiences for each context area
	 */
	audiences = CommandAudiences;

	/** @type {CommandSubscriber} */
	subscriber = null;

	/** @type {BrowserCustomizableArea} */
	area = null;

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
			Object.entries({
				[CommandAudiences.DEFAULT]: null,
				[this.area.context.audience]: null
			})
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
	 * @param {CommandSubscriber} subscriber
	 * @param {BrowserCustomizableArea} area
	 */
	constructor(subscription, subscriber, area) {
		this.#subscription = subscription;
		this.subscriber = subscriber;
		this.area = area;

		this.abortController = new AbortController();

		this._label = this.createEmptyMap();
		this._labelAuxiliary = this.createEmptyMap();
		this._icon = this.createEmptyMap();
		this._disabled = this.createEmptyMap();
		this._inert = this.createEmptyMap();
		this._mode = this.createEmptyMap();

		this._setupEventListeners();
	}

	/**
	 * An array of event on_* methods on the Command
	 */
	get _onMethods() {
		const classProps = DOMUtils.getPropertiesOnObject(this);

		return classProps
			.map((m) => m.toString())
			.filter((m) => m.startsWith("on_"))
			.map((m) => m.replace("on_", ""));
	}

	/**
	 * Initialises the event listeners on the command subscriber
	 */
	_setupEventListeners() {
		for (const event of this._onMethods) {
			this.subscriber.addEventListener(
				event,
				this._handleSubscriberEvent.bind(this)
			);
		}
	}

	/**
	 * Destroys this command
	 */
	_destroy() {
		if ("destroy" in this) {
			/** @type {any} */ (this).destroy();
		}

		this.abortController.abort();

		for (const event of this._onMethods) {
			this.subscriber.removeEventListener(
				event,
				this._handleSubscriberEvent.bind(this)
			);
		}
	}

	/**
	 * Handles incoming events to the subscriber
	 * @param {Event} event
	 */
	_handleSubscriberEvent(event) {
		if (this.canLog()) {
			console.log(
				`BrowserCommands: Triggering subscriber event '${event.type}' on ${this.constructor.name}.`
			);
		}

		if (`on_${event.type}` in this) {
			const method = this[`on_${event.type}`];

			method.call(this, event);
		}
	}

	/**
	 * Perform this command
	 *
	 * @param {CommandEvent<{}>} [event]
	 */
	run(event) {
		if ("on_command" in this) {
			/** @type {any} */ (this).on_command(event);
		}
	}

	/** @type {Map<string, string>} */
	_label = null;

	/** @type {Map<string, string>} */
	_labelAuxiliary = null;

	/** @type {Map<string, string>} */
	_icon = null;

	/** @type {Map<string, boolean>} */
	_disabled = null;

	/** @type {Map<string, boolean>} */
	_inert = null;

	/** @type {Map<string, boolean>} */
	_mode = null;

	/**
	 * Updates an attribute on the command
	 *
	 * @param {string} attribute - The attribute to change
	 * @param {any | Record<string, any>} value - The data to set the attribute to
	 */
	setAttribute(attribute, value) {
		if (!(`_${attribute}` in this)) {
			this[`_${attribute}`] = this.createEmptyMap();
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

		for (const audience of Object.values(this.audiences)) {
			const audienceValue =
				value[audience] || value[CommandAudiences.DEFAULT];

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
		return this._label.get(CommandAudiences.DEFAULT);
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
		return this._labelAuxiliary.get(CommandAudiences.DEFAULT);
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
		return this._icon.get(CommandAudiences.DEFAULT);
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
		return !!this._disabled.get(CommandAudiences.DEFAULT);
	}

	/**
	 * Updates the disabled state of this command
	 */
	set disabled(newValue) {
		this.setAttribute("disabled", newValue);
	}

	/**
	 * Determines the inert state of this command
	 * @returns {any}
	 */
	get inert() {
		return !!this._inert.get(CommandAudiences.DEFAULT);
	}

	/**
	 * Updates the inert state of this command
	 */
	set inert(newValue) {
		this.setAttribute("inert", newValue);
	}

	/**
	 * The icon mode for this command
	 * @returns {any}
	 */
	get mode() {
		return this._mode.get(CommandAudiences.DEFAULT);
	}

	/**
	 * Updates the icon mode of this command
	 */
	set mode(newValue) {
		this.setAttribute("mode", newValue);
	}

	/**
	 * The context for this command
	 */
	get context() {
		return this.area.context;
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
		return new ActionsDispatcher(this.area);
	}
}

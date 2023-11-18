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
	 * @param {typeof CommandSubscription.prototype} subscription
	 * @param {BrowserCustomizableArea} area
	 */
	constructor(subscription, area) {
		this.#subscription = subscription;
		this.#area = area;

		this.abortController = new AbortController();
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

	/** @type {string} */
	#label = null;

	/** @type {string} */
	#label_auxiliary = null;

	/** @type {string} */
	#icon = null;

	/** @type {boolean} */
	#disabled = null;

	/**
	 * The label for this command
	 */
	get label() {
		return this.#label;
	}

	/**
	 * Updates the label for this command
	 */
	set label(newValue) {
		this.#subscription.dispatchMutation("label", this.#label, newValue);
		this.#label = newValue;
	}

	/**
	 * The auxiliary label for this command
	 */
	get label_auxiliary() {
		return this.#label_auxiliary;
	}

	/**
	 * Updates the auxiliary label for this command
	 */
	set label_auxiliary(newValue) {
		this.#subscription.dispatchMutation(
			"label_auxiliary",
			this.#label_auxiliary,
			newValue
		);
		this.#label_auxiliary = newValue;
	}

	/**
	 * The icon for this command
	 */
	get icon() {
		return this.#icon;
	}

	/**
	 * Updates the icon for this command
	 */
	set icon(newValue) {
		this.#subscription.dispatchMutation("icon", this.#icon, newValue);
		this.#icon = newValue;
	}

	/**
	 * Determines the disabled state of this command
	 */
	get disabled() {
		return !!this.#disabled;
	}

	/**
	 * Updates the disabled state of this command
	 */
	set disabled(newValue) {
		this.#subscription.dispatchMutation(
			"disabled",
			this.#disabled,
			newValue
		);
		this.#disabled = newValue;
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

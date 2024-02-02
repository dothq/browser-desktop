/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

const { ConsoleAPI } = ChromeUtils.importESModule(
	"resource://gre/modules/Console.sys.mjs"
);

export class CommandSubscription {
	/** @type {ReturnType<typeof BrowserContextualMixin<typeof Element>>["prototype"]} */
	#subscriber = null;

	#commandId = "";

	/** @type {typeof Command.prototype} */
	command = null;

	/** @type {Function} */
	#callback = null;

	/**
	 * The logger singleton for the command subscription
	 * @type {Console}
	 */
	get logger() {
		if (this._logger) return this._logger;

		return (this._logger = new ConsoleAPI({
			maxLogLevel: "warn",
			maxLogLevelPref: "dot.commands.loglevel",
			prefix: `${this.constructor.name} (${this.#commandId})`
		}));
	}

	/**
	 * Dispatches a mutation event to the observer
	 * @param {string} audience
	 * @param {string} attributeName
	 * @param {any} oldValue
	 * @param {any} newValue
	 */
	dispatchMutation(audience, attributeName, oldValue, newValue) {
		this.logger.debug(
			`Dispatching command mutation '${attributeName} = ${JSON.stringify(
				newValue
			)}'`
		);

		if (this.#callback && this.#subscriber.isConnected) {
			this.#callback.call(null, audience, attributeName, newValue);
		}
	}

	/**
	 * Invokes the command attached to this subscription
	 *
	 * @param {XULCommandEvent} event
	 */
	invoke(event) {
		this.logger.debug("Invoking command");

		this.command.run.call(this.command, event);
	}

	/**
	 * @param {import("./Command.sys.mjs").CommandSubscriber} subscriber
	 * @param {string} commandId
	 * @param {Function} observer
	 */
	constructor(subscriber, commandId, observer) {
		this.#callback = observer;
		this.#subscriber = subscriber;
		this.#commandId = commandId;

		const win = this.#subscriber.ownerGlobal;
		const gDot = win.gDot;

		this.command = gDot.commands.registerSubscription(
			this,
			subscriber,
			commandId
		);
	}

	/**
	 * Destroys this subscription
	 */
	destroy() {
		this.command._destroy();

		this.command = null;
		this.#subscriber = null;
		this.#callback = null;
	}
}

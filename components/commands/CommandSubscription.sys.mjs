/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
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
	 * Determines whether we can show logs for command dispatches
	 * @returns {boolean}
	 */
	canLog() {
		return Services.prefs.getBoolPref("dot.commands.log.enabled", false);
	}

	/**
	 * Dispatches a mutation event to the observer
	 * @param {string} audience
	 * @param {string} attributeName
	 * @param {any} oldValue
	 * @param {any} newValue
	 */
	dispatchMutation(audience, attributeName, oldValue, newValue) {
		if (this.canLog()) {
			console.log(
				`${this.constructor.name} (${
					this.#commandId
				}): Dispatching command mutation '${attributeName} = ${JSON.stringify(
					newValue
				)}'`
			);
		}

		this.#callback.call(null, audience, attributeName, newValue);
	}

	/**
	 * Dispatches a invocation event to the subscription area
	 *
	 * @param {Record<string, any>} [args]
	 */
	dispatchInvocation(args) {
		const evt = new CustomEvent("Commands::Invoke", {
			detail: {
				id: this.#commandId,
				args: args || {}
			}
		});

		this.#subscriber.host.dispatchEvent(evt);
	}

	/**
	 * Invokes the command attached to this subscription
	 *
	 * @param {Record<string, any>} [args]
	 */
	invoke(args = {}) {
		if (this.canLog()) {
			console.log(
				`${this.constructor.name} (${
					this.#commandId
				}): Invoking command`
			);
		}

		this.command.run.call(this.command, args);
		this.dispatchInvocation(args);
	}

	/**
	 * @param {ReturnType<typeof BrowserContextualMixin<typeof Element>>["prototype"]} subscriber
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

const { CommandSubscription } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandSubscription.sys.mjs"
);

export class BrowserCommands {
	/** @type {Window} */
	#win = null;

	/** @type {Map<string, typeof Command>} */
	#commands = new Map();

	/**
	 * Fetches a command by its ID
	 * @param {string} id
	 * @returns {Command}
	 */
	getCommandByID(id) {
		return this.#commands.get(id);
	}

	/**
	 * Registers a new command subscription
	 * @param {typeof CommandSubscription.prototype} subscription
	 * @param {ReturnType<typeof BrowserContextualMixin<typeof Element>>["prototype"]} subscriber
	 * @param {string} commandId
	 */
	registerSubscription(subscription, subscriber, commandId) {
		const area = subscriber.host;

		const cmd = this.getCommandByID(commandId);

		if (!cmd) {
			throw new Error(
				`${subscriber.tagName}: Command with ID '${commandId}' does not exist.`
			);
		}

		const commandInstance = new cmd(subscription, area);

		return commandInstance;
	}

	/**
	 * Ensures a command is loaded and initialised
	 * @param {string} name
	 */
	registerCommand(name) {
		const mod = ChromeUtils.importESModule(
			`chrome://dot/content/commands/${name}.js`
		);

		const initialExport = Object.values(mod)[0];

		this.#commands.set(name, initialExport);
	}

	/**
	 * @param {Window} win
	 */
	constructor(win) {
		this.#win = win;

		this.registerCommand("reload-tab");
	}
}

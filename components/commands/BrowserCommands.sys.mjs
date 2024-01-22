/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Command } = ChromeUtils.importESModule(
	"resource://gre/modules/Command.sys.mjs"
);

const { CommandSubscription } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandSubscription.sys.mjs"
);

const ALL_COMMANDS = [
	// Internal
	"internal/copy",
	"internal/cut",
	"internal/paste",
	"internal/select-all",

	// Internal / Customizable UI
	"internal/customizableui/area-show-overflowing",

	// Common
	"add-tab",
	"close-tab",
	"go-back",
	"go-forward",
	"inspect",
	"reload-tab",
	"save-page-as",
	"tab-identity",

	// Utilities
	"toggle-colorpicker"
];

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
	 * @param {import("./Command.sys.mjs").CommandSubscriber} subscriber
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

		const commandInstance = new cmd(subscription, subscriber, area);

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

		for (const command of ALL_COMMANDS) {
			this.registerCommand(command);
		}
	}
}

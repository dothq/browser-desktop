/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionRegistry } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionRegistry.sys.mjs"
);

const { ActionsDispatcher } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsDispatcher.sys.mjs"
);

const { ActionsMessenger } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsMessenger.sys.mjs"
);

const { Action } = ChromeUtils.importESModule(
	"resource://gre/modules/Action.sys.mjs"
);

export class BrowserActions extends ActionsMessenger {
	/** @type {Window} */
	#win = null;

	/** @type {typeof ActionsDispatcher.prototype} */
	#dispatcher = null;

	/** @type {typeof ActionRegistry.prototype} */
	#registry = null;

	/**
	 * Fetches an action by its ID
	 * @param {string} id
	 * @returns {Action}
	 */
	getActionByID(id) {
		if (!this.#registry.get(id)) {
			throw new Error(
				`${this.constructor.name}: No action registered with ID '${id}'.`
			);
		}

		return this.#registry.get(id);
	}

	/**
	 * Performs an action with optional arguments
	 * @param {string} actionId - The action ID to perform
	 * @param {Record<string, any>} [actionArgs] - Optional arguments to be passed to the action
	 */
	run(actionId, actionArgs) {
		return this.#dispatcher.run(actionId, actionArgs);
	}

	/**
	 * Registers a new action using its relative path
	 * @param {string} path
	 */
	registerAction(path) {
		return this.#registry.registerAction(path);
	}

	/**
	 * @param {BrowserApplication} root
	 */
	constructor(root) {
		super();

		this.#win = root.ownerGlobal;
		this.#registry = new ActionRegistry(this.#win);
		this.#dispatcher = new ActionsDispatcher(this, root);
	}
}

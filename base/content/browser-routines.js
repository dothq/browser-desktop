/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let gRoutinesLocalization = new Localization(
	["dot/browser.ftl", "dot/routines.ftl"],
	true
);

/**
 * @typedef {ConstructorParameters<typeof BrowserRoutine>[0]} BrowserRoutineConstructorArguments
 */

class BrowserRoutine {
	/**
	 * @param {object} data
	 * @param {string} data.id
	 * @param {string} data.icon
	 * @param {(string | [string, Record<string, any>])[]} data.command
	 * @param {string[]} data.keybindings
	 * @param {boolean} [data.disabled]
	 */
	constructor(data) {
		this.validate(data);

		this.id = data.id;
		this.icon = data.icon;
		this.command = data.command;
		this.keybindings = data.keybindings || [];
		this._disabled = data.disabled ?? false;
	}

	/**
	 *
	 * @param {BrowserRoutineConstructorArguments} data
	 */
	validate(data) {
		if (!data) {
			throw new Error(
				`Required properties not passed to routine constructor.`
			);
		}

		if (!data.id) {
			throw new Error(`Required property 'id' needed to create routine.`);
		}

		if (!data.icon) {
			throw new Error(
				`Required property 'icon' needed to create routine.`
			);
		}

		if (!data.command) {
			throw new Error(
				`Required property 'command' needed to create routine.`
			);
		}

		if (!Array.isArray(data.command)) {
			throw new Error(`Property 'command' must be an array.`);
		} else {
			const map = this._getCommandMap(data.command);

			for (let i = 0; i < map.length; i++) {
				const { id, cmd } = map[i];

				if (!cmd) {
					throw new Error(
						`Property 'command[${i}]' uses an unknown command ID ${id}.`
					);
				}
			}
		}

		if (data.keybindings && !Array.isArray(data.keybindings)) {
			throw new Error(`Property 'keybindings' must be an array.`);
		}

		if (data.disabled && typeof data.disabled !== "boolean") {
			throw new Error(
				`Property 'disabled' must be a boolean true/false.`
			);
		}
	}

	/**
	 * Determines whether this routine is built-in
	 */
	get isBuiltin() {
		return gDotRoutines._defaultBindings.find((b) => b.id == this.id);
	}

	/**
	 * Determines whether this routine is disabled
	 *
	 * Built-in routines cannot be disabled.
	 */
	get isDisabled() {
		return !this.isBuiltin && this._disabled;
	}

	/**
	 * The routine's action data
	 * @param {object} options
	 * @param {boolean} [options.keybindings]
	 */
	getActionData({ keybindings }) {
		return {
			label: this.localizedLabel,
			tooltip: keybindings
				? this.getLabelAndKeybinds(this.localizedTooltip)
				: this.localizedTooltip,
			icon: this.icon,
			keybindings: this.keybindings,
			disabled: this.isDisabled
		};
	}

	/**
	 * Fetches localized data for this routine
	 * @returns {Record<string, string>}
	 */
	getLocalized() {
		const [msg] = gRoutinesLocalization.formatMessagesSync([
			{ id: `routine-${this.id}` }
		]);

		if (msg) {
			let data = {
				label: msg.value,
				tooltip: msg.value
			};

			if (msg.attributes) {
				for (const attr of msg.attributes) {
					data[attr.name] = attr.value;
				}
			}

			return data;
		} else {
			return null;
		}
	}

	/**
	 * The localized label for this routine
	 */
	get localizedLabel() {
		const data = this.getLocalized();

		return data?.label;
	}

	/**
	 * The localized tooltip for this routine
	 *
	 * If not specified, it will be the same value as localizedLabel
	 */
	get localizedTooltip() {
		const data = this.getLocalized();

		if (data?.tooltip) {
			return data.tooltip;
		}

		return data?.label;
	}

	/**
	 * A localized label and keybind combination
	 * @param {string} [label]
	 */
	getLabelAndKeybinds(label) {
		if (!label || !this.keybindings.length) label = this.localizedLabel;

		return gRoutinesLocalization.formatValueSync("browser-keybind-label", {
			label,
			keybind: this.listedKeybindings
		});
	}

	/**
	 * The associated keybindings in a localized list
	 */
	get listedKeybindings() {
		const formatter = new Intl.ListFormat(undefined, {
			style: "short",
			type: "disjunction"
		});

		const prettifiedKeybindings = this.keybindings.map((keys) => {
			const data = gDot.shortcuts.parseKeybind(keys);

			return gDot.shortcuts.prettifyShortcut(data);
		});

		return formatter.format(prettifiedKeybindings);
	}

	/**
	 * An array of commands and their arguments to be executed
	 */
	_getCommandMap(cmds = this.command) {
		const commands = [];

		for (const block of cmds) {
			const blockId = Array.isArray(block) ? block[0] : block;
			const blockArgs = Array.isArray(block) ? block[1] || {} : {};

			const command = gDotCommands.getCommandById(blockId);

			commands.push({
				id: blockId,
				args: blockArgs,
				cmd: command || null
			});
		}

		return commands;
	}

	/**
	 * Performs the routine
	 * @param {Partial<ReturnType<typeof gDotCommands.createContext>>} ctx
	 * @returns
	 */
	async performRoutine(ctx) {
		for await (const { id, args, cmd } of this._getCommandMap()) {
			if (cmd) {
				try {
					await Promise.resolve(
						gDotCommands.execCommand(cmd.name, {
							...args,
							...(ctx || {})
						})
					);
				} catch (e) {
					console.error(
						`Error running command '${cmd.name}' in routine '${this.id}'!`,
						e
					);
					return;
				}
			} else {
				console.warn(
					`Unknown block type with ID '${id}' in routine '${this.id}'!`
				);
			}
		}
	}
}

var gDotRoutines = {
	ROUTINES_PREF_ID: "dot.customizable.routines",

	/**
	 * The browser's default, built-in routine bindings
	 * @type {BrowserRoutineConstructorArguments[]}
	 */
	get _defaultBindings() {
		let routines = [];

		routines = routines.concat([
			{
				id: "new-window",
				icon: "add",

				command: ["application.new_window"],
				keybindings: ["CmdOrCtrl+N"]
			},
			{
				id: "new-private-browsing-window",
				icon: "add",

				command: ["application.new_private_browsing_window"],
				keybindings: ["CmdOrCtrl+Shift+P"]
			},
			{
				id: "close-window",
				icon: "close",

				command: ["application.close"],
				keybindings: ["CmdOrCtrl+Q"]
			},
			{
				id: "new-tab",
				icon: "add",

				command: ["application.new_tab"],
				keybindings: ["CmdOrCtrl+T"]
			},
			{
				id: "close-tab",
				icon: "close",

				command: ["application.close_tab"],
				keybindings: ["CmdOrCtrl+W"]
			}
		]);

		routines = routines.concat([
			{
				id: "navigate-back",
				icon: "arrow-left",

				command: ["browsing.navigate_back"],
				keybindings: ["Alt+LeftArrow"]
			},
			{
				id: "navigate-forward",
				icon: "arrow-right",

				command: ["browsing.navigate_forward"],
				keybindings: ["Alt+RightArrow"]
			},
			{
				id: "reload-page",
				icon: "reload",

				command: ["browsing.reload_page"],
				keybindings: ["CmdOrCtrl+R"]
			},
			{
				id: "reload-page-bypass-cache",
				icon: "sync",

				command: [["browsing.reload_page", { bypassCache: true }]],
				keybindings: ["CmdOrCtrl+Shift+R"]
			},
			{
				id: "stop-page",
				icon: "close",

				command: ["browsing.stop_page"],
				keybindings: ["Esc"]
			}
		]);

		routines = routines.concat([
			{
				id: "select-all",
				icon: "info",

				command: ["browser.select_all"],
				keybindings: ["CmdOrCtrl+A"]
			},
			{
				id: "toggle-menubar",
				icon: "toggle",

				command: [["browser.toolbar.toggle", { name: "menubar" }]],
				keybindings: ["+Alt"]
			},
			{
				id: "toggle-identity-popout",
				icon: "info",

				command: [
					["browser.popouts.toggle", { name: "page-identity" }]
				],
				keybindings: ["CmdOrCtrl+I"]
			}
		]);

		return routines;
	},

	/**
	 * Gets a routine by its ID
	 * @param {string} id
	 * @returns {BrowserRoutine | null}
	 */
	getRoutineById(id) {
		const data = this.routines.find((r) => r.id == id);

		return data ? this._wrapRoutine(data) : null;
	},

	/**
	 * Wraps the raw routine data in a BrowserRoutine instance
	 * @param {BrowserRoutineConstructorArguments} data
	 * @returns {BrowserRoutine}
	 */
	_wrapRoutine(data) {
		return new BrowserRoutine(data);
	},

	/**
	 * The current user routine configuration
	 * @returns {BrowserRoutineConstructorArguments[]}
	 */
	get routines() {
		return this._defaultBindings.concat(
			this._routines || this.update() || []
		);
	},

	/**
	 * Stores registered keybindings for routines
	 */
	_keybindings: [],

	/**
	 * Updates the local copy of the routines
	 * @returns {BrowserRoutineConstructorArguments[]}
	 */
	updateRoutines() {
		let data = Services.prefs.getStringPref(this.ROUTINES_PREF_ID, null);

		if (!data) {
			data = JSON.stringify([]);

			Services.prefs.setStringPref(this.ROUTINES_PREF_ID, data);
		}

		let json;

		try {
			json = JSON.parse(data);

			console.assert(
				Array.isArray(json),
				"Parsed user routines is not an array."
			);

			for (let i = 0; i < json.length; i++) {
				const item = json[i];

				console.assert(
					typeof item === "object" &&
						item !== null &&
						!Array.isArray(item),
					`User routine with index ${i} is not an object.`
				);

				try {
					this._wrapRoutine(item);
				} catch (e) {
					console.warn(
						`Failed to parse user routine with ${
							"id" in item ? `id '${item.id}'` : `index ${i}`
						}!`,
						e
					);

					json[i] = null;
				}
			}
		} catch (e) {
			console.warn(
				`Failed to parse user routines, falling back to default!`,
				e
			);

			return [];
		}

		const bindings = (json || []).filter(Boolean);

		const bindingMap = new Map(bindings.map((o) => [o.id, o]));
		const bindingsArr = Object.values(Object.fromEntries(bindingMap));

		this._routines = bindingsArr;

		return bindingsArr;
	},

	/**
	 * Updates the keybindings for each routine
	 */
	updateKeybindings() {
		this._keybindings = [];

		for (const routine of this.routines) {
			if (routine.keybindings) {
				for (const keybind of routine.keybindings) {
					const parsed = gDot.shortcuts.parseKeybind(keybind);

					this._keybindings.push([parsed, routine.id]);
				}
			}
		}
	},

	/**
	 * Updates any routine logic
	 */
	update() {
		this.updateRoutines();

		if (typeof gDot !== "undefined") {
			this.updateKeybindings();
		}

		return this.routines;
	},

	/**
	 * Creates a new custom routine
	 * @param {BrowserRoutineConstructorArguments} data
	 */
	registerRoutine(data) {
		if (this._routines.find((r) => r.id == data.id)) {
			throw new Error(`Routine with id ${data.id} already exists.`);
		}

		this._wrapRoutine(data);

		Services.prefs.setStringPref(
			this.ROUTINES_PREF_ID,
			JSON.stringify(this._routines.concat([data]))
		);

		return this.getRoutineById(data.id);
	},

	/**
	 * Handles incoming shortcut call events
	 * @param {CustomEvent} event
	 */
	onShortcut(event) {
		if (event.type == "BrowserShortcuts::ShortcutCalled") {
			const key = event.detail.key;
			const keyData =
				/** @type {ReturnType<typeof gDot.shortcuts.parseKeybind>} */ (
					event.detail.keyData
				);
			const keyEvent = /** @type {KeyboardEvent} */ (
				event.detail.keyEvent
			);
			const keyPressed = /** @type {boolean} */ (event.detail.keyPressed);

			const keybinding = /** @type {string} */ (
				this._keybindings.find(
					(k) =>
						k[0].altKey === keyData.altKey &&
						k[0].shiftKey === keyData.shiftKey &&
						k[0].controlKey === keyData.controlKey &&
						k[0].metaKey === keyData.metaKey &&
						k[0].cmdOrCtrl === keyData.cmdOrCtrl &&
						k[0].toggleKey === keyData.toggleKey &&
						JSON.stringify(k[0].keys) ===
							JSON.stringify(keyData.keys)
				)
			);

			if (keybinding) {
				const routine = this.getRoutineById(keybinding[1]);

				if (routine) {
					if (
						(keyEvent.type == "keyup" && !keyData.keys.length) ||
						(keyEvent.type == "keydown" && keyData.keys.length)
					) {
						keyEvent.preventDefault();
						keyEvent.stopPropagation();
						keyEvent.stopImmediatePropagation();

						routine.performRoutine({});
					}
				}
			}
		}
	},

	init() {
		this.update();

		Services.prefs.addObserver(
			this.ROUTINES_PREF_ID,
			this.update.bind(this)
		);

		gDot.shortcuts.on("*", this.onShortcut.bind(this));
	},

	destroy() {}
};

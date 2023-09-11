/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let gRoutinesLocalization = new Localization(
	["dot/browser.ftl", "dot/routines.ftl"],
	true
);

class BrowserRoutine {
	/**
	 * @param {object} data
	 * @param {string} data.id
	 * @param {string} data.icon
	 * @param {(string | [string, Record<string, any>])[]} data.routine
	 * @param {string[]} data.keybindings
	 */
	constructor({ id, icon, routine, keybindings }) {
		this.id = id;
		this.icon = icon;
		this.routine = routine;
		this.keybindings = keybindings;
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
			keybindings: this.keybindings
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
		if (!label) label = this.localizedLabel;

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

		return formatter.format(this.keybindings);
	}

	/**
	 * Performs the routine
	 * @param {Partial<ReturnType<typeof gDotCommands.createContext>>} ctx
	 * @returns
	 */
	async performRoutine(ctx) {
		for await (const block of this.routine) {
			const blockId = Array.isArray(block) ? block[0] : block;
			const blockArgs = Array.isArray(block) ? block[1] || {} : {};

			const command = gDotCommands.getCommandById(blockId);

			if (command) {
				try {
					await Promise.resolve(
						gDotCommands.execCommand(command.name, {
							...blockArgs,
							...(ctx || {})
						})
					);
				} catch (e) {
					console.error(
						`Error running command '${command.name}' in routine '${this.id}'!`,
						e
					);
					return;
				}
			} else {
				console.warn(
					`Unknown block type with ID '${blockId}' in routine '${this.id}'!`
				);
			}
		}
	}
}

/**
 * @typedef {ConstructorParameters<typeof BrowserRoutine>[0]} BrowserRoutineConstructorArguments
 */

var gDotRoutines = {
	/**
	 * Gets a routine by its ID
	 * @param {string} id
	 * @returns {BrowserRoutine | null}
	 */
	getRoutineById(id) {
		const data = this._bindings.find((r) => r.id == id);

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

	/** @type {BrowserRoutineConstructorArguments[]} */
	get _bindings() {
		return [
			{
				id: "new-window",
				icon: "add",

				routine: ["application.new_window"],
				keybindings: ["Ctrl+N"]
			},
			{
				id: "new-private-browsing-window",
				icon: "add",

				routine: ["application.new_private_browsing_window"],
				keybindings: ["Ctrl+Shift+P"]
			},
			{
				id: "close-window",
				icon: "close",

				routine: ["application.close"],
				keybindings: ["Ctrl+Q"]
			},
			{
				id: "new-tab",
				icon: "add",

				routine: ["application.new_tab"],
				keybindings: ["Ctrl+T"]
			},
			{
				id: "close-tab",
				icon: "close",

				routine: ["application.close_tab"],
				keybindings: ["Ctrl+W"]
			},
			{
				id: "navigate-back",
				icon: "arrow-left",

				routine: ["browsing.navigate_back"],
				keybindings: ["Alt+LeftArrow"]
			},
			{
				id: "navigate-forward",
				icon: "arrow-right",

				routine: ["browsing.navigate_forward"],
				keybindings: ["Alt+RightArrow"]
			},
			{
				id: "reload-page",
				icon: "reload",

				routine: ["browsing.reload_page"],
				keybindings: ["Ctrl+R"]
			},
			{
				id: "reload-page-bypass-cache",
				icon: "sync",

				routine: [["browsing.reload_page", { bypassCache: true }]],
				keybindings: ["Ctrl+Shift+R"]
			},
			{
				id: "stop-page",
				icon: "close",

				routine: ["browsing.stop_page"],
				keybindings: ["Esc"]
			},
			{
				id: "toggle-menubar",
				icon: "toggle",

				routine: [["browser.toolbar.toggle", { name: "menubar" }]],
				keybindings: ["Alt"]
			},
			{
				id: "toggle-identity-popout",
				icon: "info",

				routine: [
					["browser.popouts.toggle", { name: "page-identity" }]
				],
				keybindings: ["Ctrl+I"]
			}
		];
	},

	/**
	 * Handles key down events
	 * @param {KeyboardEvent} event
	 */
	onKeyDown(event) {},

	/**
	 * Handles incoming events
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "keydown":
				this.onKeyDown(/** @type {KeyboardEvent} */ (event));
				break;
		}
	},

	init() {
		window.addEventListener("keydown", this);

		for (const bind of this._bindings) {
			const [msg] = gRoutinesLocalization.formatMessagesSync([
				{ id: `routine-${bind.id.split(".")[0]}` }
			]);

			if (!msg) {
				console.warn(
					`No localization found for routine with ID '${bind.id}'!`
				);
			}
		}
	},

	deinit() {
		window.removeEventListener("keydown", this);
	}
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { DotShortcutUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/DotShortcutUtils.sys.mjs"
);

const { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

export class BrowserShortcuts {
	/** @param {Window} win  */
	constructor(win) {
		this._win = win;

		this.init();
	}

	/** @type {Window} */
	_win = null;

	_initted = false;

	/** @type {Record<string, Function[]>} */
	_listeners = {};

	/**
	 * The current key modifier state
	 */
	modState = 0;

	/**
	 * The current key state
	 * @type {Set<string>}
	 */
	keyState = new Set();

	/**
	 * Determines whether the altKey is currently being pressed
	 */
	get altKey() {
		return Boolean(this.modState & DotShortcutUtils.KEY_ALT);
	}

	/**
	 * Determines whether the shiftKey is currently being pressed
	 */
	get shiftKey() {
		return Boolean(this.modState & DotShortcutUtils.KEY_SHIFT);
	}

	/**
	 * Determines whether the controlKey is currently being pressed
	 *
	 * @deprecated For better cross-platform compatibility, use cmdOrCtrl.
	 */
	get controlKey() {
		return Boolean(this.modState & DotShortcutUtils.KEY_CONTROL);
	}

	/**
	 * Determines whether the metaKey is currently being pressed
	 */
	get metaKey() {
		return Boolean(this.modState & DotShortcutUtils.KEY_META);
	}

	/**
	 * Determines whether the Control or Cmd key is being pressed
	 *
	 * On macOS, this will use the Cmd key, rather than Ctrl as Control is its own separate key.
	 */
	get cmdOrCtrl() {
		return AppConstants.platform == "macosx"
			? this.metaKey
			: this.controlKey;
	}

	/**
	 * Listens for key combination presses
	 * @param {string} keybind
	 * @param {Function} callback
	 */
	on(keybind, callback) {
		keybind = keybind.toLowerCase();

		if (!(keybind in this._listeners)) {
			this._listeners[keybind] = [];
		}

		this._listeners[keybind].push(callback);
	}

	/**
	 * Listens for key combination presses
	 * @param {string} keybind
	 * @param {Function} callback
	 */
	off(keybind, callback) {
		keybind = keybind.toLowerCase();

		this._listeners[keybind] = this._listeners[keybind].filter(
			(c) => c !== callback
		);
	}

	/**
	 * Parases a keybind to a keybind object
	 * @param {string} keybind
	 */
	parseKeybind(keybind) {
		const split = keybind.toLowerCase().split("+");

		const data = {
			altKey: false,
			shiftKey: false,
			controlKey: false,
			metaKey: false,
			cmdOrCtrl: false,
			toggleKey: keybind.charAt(0) === "+",
			keys: []
		};

		console.log(data, split, keybind);

		const modifiers = split
			.filter(
				(s) =>
					s == "Alt".toLowerCase() ||
					s == "Shift".toLowerCase() ||
					s == "Ctrl".toLowerCase() ||
					s == "Control".toLowerCase() ||
					s == "Meta".toLowerCase() ||
					s == "Super".toLowerCase() ||
					s == "Win".toLowerCase() ||
					s == "Windows".toLowerCase() ||
					s == "CmdOrCtrl".toLowerCase()
			)
			.map((s) => s.toLowerCase());

		data.altKey = modifiers.includes("alt");
		data.shiftKey = modifiers.includes("shift");
		data.controlKey =
			modifiers.includes("ctrl") || modifiers.includes("control");
		data.metaKey = ["meta", "super", "win", "windows"].some((m) =>
			modifiers.includes(m)
		);
		data.cmdOrCtrl = modifiers.includes("cmdorctrl");

		data.keys = split.filter((s) => !modifiers.includes(s));

		return data;
	}

	/**
	 * Converts keybind data to a prettified shortcut string
	 * @param {ReturnType<typeof BrowserShortcuts.prototype.parseKeybind>} data
	 */
	prettifyShortcut(data) {
		let parts = [];

		if (data.metaKey) {
			if (AppConstants.platform == "macosx") {
				parts.push("Command");
			} else if (AppConstants.platform == "win") {
				parts.push("Windows");
			} else {
				parts.push("Super");
			}
		}

		if (data.cmdOrCtrl) {
			parts.push(AppConstants.platform == "macosx" ? "Command" : "Ctrl");
		}

		if (data.controlKey) {
			parts.push(AppConstants.platform == "macosx" ? "Control" : "Ctrl");
		}

		if (data.altKey) {
			parts.push(AppConstants.platform == "macosx" ? "Option" : "Alt");
		}

		if (data.shiftKey) {
			parts.push("Shift");
		}

		parts = parts.concat(
			data.keys.map((k) => (k.length <= 1 ? k.toUpperCase() : k))
		);

		return parts.join("+");
	}

	/**
	 * Gets the current keyState as a string
	 * @returns {string}
	 */
	_getKeyStateString() {
		const keys = [];

		if (this.cmdOrCtrl) {
			keys.push("CmdOrCtrl");
		}

		if (!this.cmdOrCtrl && this.controlKey) {
			keys.push("Ctrl");
		}

		if (this.altKey) {
			keys.push("Alt");
		}

		if (this.shiftKey) {
			keys.push("Shift");
		}

		for (const key of this.keyState) {
			keys.push(key);
		}

		return keys.join("+");
	}

	/**
	 * Emits the appropriate key events if possible
	 * @param {KeyboardEvent} event
	 */
	_maybeEmitEvents(event) {
		// If the event isn't trusted or has been prevented, return
		if (
			!event.isTrusted ||
			event.defaultCancelled ||
			event.defaultPreventedByChrome
		) {
			return;
		}

		const key = this._getKeyStateString();
		const keyData = this.parseKeybind(key);

		const listeners = this._listeners[key.toLowerCase()] || [];

		const evt = new CustomEvent("BrowserShortcuts::ShortcutCalled", {
			detail: {
				key: key,
				keyData,
				keyEvent: event,
				keyPressed: event.type == "keydown"
			}
		});

		if (listeners && listeners.length) {
			console.log("Emitting", key, keyData);

			for (const listener of listeners) {
				if (listener) {
					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();

					listener.call(listener, evt);
				}
			}
		}

		// Emit to wildcard listeners
		for (const listener of this._listeners["*"] || []) {
			if (listener) {
				listener.call(listener, evt);
			}
		}
	}

	/**
	 * Handles keyboard keydown events
	 * @param {KeyboardEvent} event
	 */
	_onKeyDown(event) {
		if (event.altKey) this.modState |= DotShortcutUtils.KEY_ALT;
		if (event.shiftKey) this.modState |= DotShortcutUtils.KEY_SHIFT;
		if (event.ctrlKey) this.modState |= DotShortcutUtils.KEY_CONTROL;
		if (event.metaKey) this.modState |= DotShortcutUtils.KEY_META;

		if (event.location == event.DOM_KEY_LOCATION_STANDARD) {
			this.keyState.add(event.key.toLowerCase());
		}

		this._maybeEmitEvents(event);
	}

	/**
	 * Handles keyboard keyup events
	 * @param {KeyboardEvent} event
	 */
	_onKeyUp(event) {
		// this._maybeEmitEvents(event);

		if (!event.altKey) this.modState &= ~DotShortcutUtils.KEY_ALT;
		if (!event.shiftKey) this.modState &= ~DotShortcutUtils.KEY_SHIFT;
		if (!event.ctrlKey) this.modState &= ~DotShortcutUtils.KEY_CONTROL;
		if (!event.metaKey) this.modState &= ~DotShortcutUtils.KEY_META;

		if (event.location == event.DOM_KEY_LOCATION_STANDARD) {
			this.keyState.delete(event.key.toLowerCase());
		}
	}

	init() {
		if (this._initted) return;

		this._win.addEventListener("keydown", this._onKeyDown.bind(this));
		this._win.addEventListener("keyup", this._onKeyUp.bind(this));

		this._initted = true;
	}
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { require: devtoolsRequire } = ChromeUtils.importESModule(
	"resource://devtools/shared/loader/Loader.sys.mjs"
);

const { CommandsFactory } = devtoolsRequire(
	"resource://devtools/shared/commands/commands-factory.js"
);

export class TabDevTools {
	/**
	 * The associated tab for devtools
	 * @type {BrowserTab}
	 */
	#tab = null;

	get #browser() {
		return this.#tab.linkedBrowser;
	}

	/**
	 * Helper to use the commands factory safely
	 * @param {(commands: any) => any} callback
	 */
	async #wrapCommandsFactory(callback) {
		const commands = await CommandsFactory.forTab(this.#tab);
		await commands.targetCommand.startListening();

		const returnValue = await Promise.resolve(
			callback.call(this, commands)
		);

		if (commands) {
			commands.destroy();
		}

		return returnValue;
	}

	_isColorPickerEnabled = false;

	/**
	 * Determines whether the color picker is enabled or not
	 */
	get isColorPickerEnabled() {
		return this._isColorPickerEnabled;
	}

	/**
	 * Toggles the color picker DevTools highlight on the tab
	 */
	async toggleColorPickerHighlight() {
		// If we already have an inspector front defined for the color picker
		// emit the canceled event for the color picker.
		if (this.isColorPickerEnabled && this._colorPickerInspectorFront) {
			this._colorPickerInspectorFront.emit("color-pick-canceled");
			return;
		}

		await this.#wrapCommandsFactory(async (commands) => {
			const { targetFront } = commands.targetCommand;
			this._colorPickerInspectorFront =
				await targetFront.getFront("inspector");

			this._colorPickerInspectorFront.pickColorFromPage({
				copyOnSelect: true,
				fromMenu: true
			});

			this._isColorPickerEnabled = true;

			return await new Promise((r) => {
				this._colorPickerInspectorFront.once("color-picked", r);
				this._colorPickerInspectorFront.once("color-pick-canceled", r);
			});
		});

		this._isColorPickerEnabled = false;
	}

	/**
	 * Initialises the devtools manager for this tab
	 */
	async #init() {}

	/**
	 * @param {BrowserTab} tab
	 */
	constructor(tab) {
		this.#tab = tab;

		this.#init();
	}
}

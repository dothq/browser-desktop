/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TabCommand } = ChromeUtils.importESModule(
	"resource://gre/modules/TabCommand.sys.mjs"
);

export class ToggleColorpickerCommand extends TabCommand {
	constructor(subscription, subscriber, area) {
		super(subscription, subscriber, area);

		this.label = "Color Picker";
		this.icon = "eyedropper";
	}

	/**
	 * Updates the checked state of this command
	 */
	_update() {
		const { isColorPickerEnabled } = this.context.tab.devTools;

		this.checked = !!isColorPickerEnabled;
	}

	onContextualTabSelected() {
		this._update();
	}

	onContextualBrowserStateChanged({ browser }) {
		this._update();
	}

	/**
	 * Fired when the command is performed
	 * @param {import("../Command.sys.mjs").CommandEvent} event
	 */
	async on_command(event) {
		this.checked = !this.checked;

		await this.actions.run("browser.content.pick_color", {
			tab: this.context.tab
		});

		this._update();
	}
}

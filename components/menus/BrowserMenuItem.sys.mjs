/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class BrowserMenuItem {
	/**
	 * The ID of this menu item
	 * @type {string}
	 */
	id = null;

	/**
	 * The type of this menu item
	 * @type {"item" | "checkbox" | "radio" | "separator" | "group"}
	 */
	type = null;

	/**
	 * The label for this menu item
	 * @type {string}
	 */
	label = null;

	/**
	 * The image/icon used for this menu item
	 * @type {string}
	 */
	image = null;

	/**
	 * The localization string ID for this menu item
	 * @type {string}
	 */
	l10nId = null;

	/**
	 * Determines whether the menu item is hidden or not
	 * @type {boolean}
	 */
	hidden = null;

	/**
	 * Determines whether the menu item is disabled or not
	 * @type {boolean}
	 */
	disabled = null;

	/**
	 * Determines whether the menu item is checked or not
	 * @type {boolean}
	 */
	checked = null;

	/**
	 * The key binding accelerator for this menu item
	 * @type {string}
	 */
	accelerator = null;

	/**
	 * The access key for this menu item
	 * @type {string}
	 */
	accessKey = null;

	/**
	 * The submenu for this menu item
	 * @type {typeof BrowserMenuItem["prototype"][]}
	 */
	submenu = [];

	/**
	 * The click handler for this menu item
	 */
	click = null;

	/**
	 * The hover handler for this menu item
	 */
	hover = null;

	/**
	 * The command ID for this menu item
	 */
	commandId = null;

	/**
	 * Create a new browser menu item
	 * @param {object} data
	 * @param {string} [data.id]
	 * @param {"item" | "checkbox" | "radio" | "separator"} [data.type]
	 * @param {string} [data.label]
	 * @param {string} [data.image]
	 * @param {string} [data.l10nId]
	 * @param {string} [data.commandId]
	 * @param {boolean} [data.hidden]
	 * @param {boolean} [data.disabled]
	 * @param {boolean} [data.checked]
	 * @param {string} [data.accelerator]
	 * @param {string} [data.accessKey]
	 * @param {typeof BrowserMenuItem["prototype"][]} [data.submenu]
	 * @param {Function} [data.click]
	 * @param {Function} [data.hover]
	 */
	constructor({
		id,
		type,
		label,
		image,
		l10nId,
		commandId,
		hidden,
		disabled,
		checked,
		accelerator,
		accessKey,
		submenu,
		click,
		hover
	}) {
		this.id = id;
		this.type = type;
		this.hidden = !!hidden;

		// Stop here, we don't need any more information for separators
		if (this.type == "separator") return;

		// Only allow checked for checkbox and radio types
		if (this.type == "checkbox" || this.type == "radio") {
			this.checked = checked;
		}

		this.label = label;
		this.image = image;
		this.l10nId = l10nId;
		this.commandId = commandId;

		this.disabled = !!disabled;

		this.accelerator = accelerator;
		this.accessKey = accessKey;

		this.submenu = submenu;

		this.click = click;
		this.hover = hover;
	}
}

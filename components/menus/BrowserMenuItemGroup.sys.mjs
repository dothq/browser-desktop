/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserMenuItem } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserMenuItem.sys.mjs"
);

export class BrowserMenuItemGroup extends BrowserMenuItem {
	/**
	 * Creates a new menu item group
	 * @param {(typeof BrowserMenuItem)["prototype"][]} items
	 */
	constructor(...items) {
		super({});

		this.type = /** @type {any} */ ("group");
		this.submenu = items;
	}
}

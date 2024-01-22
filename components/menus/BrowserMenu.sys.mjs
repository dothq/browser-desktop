/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserMenuItem } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserMenuItem.sys.mjs"
);

const { BrowserMenuItemGroup } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserMenuItemGroup.sys.mjs"
);

export class BrowserMenu {
	static MenuItem = BrowserMenuItem;
	static MenuItemGroup = BrowserMenuItemGroup;

	/** @type {Window} */
	#win = null;

	get #doc() {
		return this.#win.document;
	}

	/**
	 * The ID of the browser menu
	 * @type {string}
	 */
	id = null;

	/** @type {typeof BrowserMenuItem["prototype"][]} */
	#menuitems = [];

	/**
	 * The list of items on this browser menu
	 */
	get items() {
		return Array.from(this.#menuitems);
	}

	/**
	 * Creates the menu popup element
	 */
	#createMenupopup(items = this.#menuitems) {
		const popup = /** @type {MozMenuPopup} */ (
			this.#doc.createXULElement("menupopup")
		);

		this.#renderMenuItems(popup, items);

		return popup;
	}

	/**
	 * Applies any menu item attributes to the underlying menu item element
	 * @param {typeof BrowserMenuItem["prototype"]} item
	 * @param {Element} menuitem
	 */
	#setMenuItemAttributes(item, menuitem) {
		if (item.l10nId) {
			menuitem.ownerDocument.l10n.setAttributes(menuitem, item.l10nId);
		} else {
			menuitem.setAttribute("label", item.label || "");

			if (item.accelerator) {
				menuitem.setAttribute("acceltext", item.accelerator);
			}

			if (item.accessKey) {
				menuitem.setAttribute("accesskey", item.accessKey);
			}
		}

		if (item.type === "checkbox") {
			menuitem.setAttribute("type", "checkbox");
		}

		if (item.type === "radio") {
			menuitem.setAttribute("type", "radio");
		}

		if (item.disabled) {
			menuitem.setAttribute("disabled", "true");
		}

		if (item.checked) {
			menuitem.setAttribute("checked", "true");
		}

		if (item.image) {
			menuitem.setAttribute("image", item.image);
		}

		if (item.commandId) {
			menuitem.setAttribute("commandid", item.commandId);
		}

		if (item.id) {
			menuitem.id = item.id;
		}
	}

	/**
	 * Updates the checked state for a child
	 * @param {Element} child
	 */
	#toggleCheckedState(child) {
		child.toggleAttribute("checked");

		if (child.getAttribute("type") == "radio") {
			let sibling = child.previousElementSibling;

			while (
				sibling &&
				sibling.tagName == "menuitem" &&
				sibling.getAttribute("type") == "radio"
			) {
				sibling.removeAttribute("checked");
				sibling = sibling.previousElementSibling;
			}

			sibling = child.nextElementSibling;

			while (
				sibling &&
				sibling.tagName == "menuitem" &&
				sibling.getAttribute("type") == "radio"
			) {
				sibling.removeAttribute("checked");
				sibling = sibling.nextElementSibling;
			}

			child.setAttribute("checked", "");
		}
	}

	/**
	 * Creates a child element from a menu item instance
	 * @param {typeof BrowserMenuItem["prototype"]} item
	 */
	#createChildFromMenuItem(item) {
		if (item.type == "separator") {
			return this.#doc.createXULElement("menuseparator");
		}

		if (item.type == "group") {
			const group = this.#doc.createXULElement("menugroup");

			for (const menuitem of item.submenu) {
				group.appendChild(this.#createChildFromMenuItem(menuitem));
			}

			return group;
		}

		/** @type {Element} */
		const child = this.#doc.createXULElement(
			item.submenu ? "menu" : "menuitem"
		);

		if (item.submenu) {
			const submenu = this.#createMenupopup(item.submenu);

			child.appendChild(submenu);
		}

		this.#setMenuItemAttributes(item, child);

		child.addEventListener("command", (event) => {
			if (item.click) {
				item.click.call(null, child);
			}
		});

		child.addEventListener("mouseup", (event) => {
			if (item.type == "checkbox" || item.type == "radio") {
				event.preventDefault();
				this.#toggleCheckedState(child);
			}
		});

		child.addEventListener("DOMMenuItemActive", () => {
			if (item.hover) {
				item.hover.call(null, child);
			}
		});

		return child;
	}

	/**
	 * Renders all registered menu items to the popup
	 * @param {MozMenuPopup} popup
	 * @param {typeof BrowserMenuItem["prototype"][]} items
	 */
	#renderMenuItems(popup, items) {
		for (const item of items) {
			if (item.hidden) continue;

			const child = this.#createChildFromMenuItem(item);
			popup.appendChild(child);
		}
	}

	/**
	 * Appends a menu item
	 * @param {typeof BrowserMenuItem["prototype"][]} items
	 */
	append(...items) {
		this.#menuitems = this.#menuitems.concat(...items);
	}

	/**
	 * Opens the menu at the specified screen XY coordinates
	 * @param {number} screenX
	 * @param {number} screenY
	 */
	open(screenX, screenY) {
		let popupset = this.#doc.querySelector("popupset");
		if (!popupset) {
			popupset = this.#doc.createXULElement("popupset");
			this.#doc.documentElement.appendChild(popupset);
		}

		const popup = this.#createMenupopup();

		popupset.appendChild(popup);

		popup.openPopupAtScreen(screenX, screenY, true);

		// Remove the popup once it's fully hidden
		popup.addEventListener(
			"popuphidden",
			(e) => {
				if (e.target === popup) {
					popup.remove();
				}
			},
			{ capture: true }
		);

		return popup;
	}

	/**
	 * Closes our browser menu
	 * @param {MozMenuPopup} popup
	 */
	close(popup) {
		popup.hidePopup();
	}

	/**
	 * @param {Window} win
	 * @param {string} [id]
	 */
	constructor(win, id) {
		this.#win = win;
		this.id = id;
	}
}

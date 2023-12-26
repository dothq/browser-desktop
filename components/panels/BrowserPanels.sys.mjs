/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {object} PanelOpenOptions
 * @property {"local" | "screen"} [coordMode]
 * @property {number} [x]
 * @property {number} [y]
 * @property {Element} [element]
 * @property {`${"before" | "after"} ${"before" | "after"}`} [anchor]
 * @property {Element} [root]
 * @property {boolean} [autopurge]
 * @property {Record<string, any>} [args]
 */

export class BrowserPanels {
	/** @type {Window} */
	#win = null;

	/** @type {Set<string>} */
	#visiblePanelIds = new Set();

	/**
	 * The currently visible panels in the browser window
	 */
	get visiblePanels() {
		return Array.from(this.#visiblePanelIds.values());
	}

	/**
	 * The root element to render all panels to
	 */
	get root() {
		return this.#win.document.documentElement;
	}

	/**
	 * Obtains a panel element from its panel ID
	 * @param {string} panel
	 */
	getPanel(panel) {
		return this.#win.customElements.get(panel);
	}

	/**
	 * Obtains the open panel element in the DOM from its panel ID
	 * @param {string} openPanelId
	 * @returns {BrowserPanel}
	 */
	getPanelElement(openPanelId) {
		return this.#win.document.querySelector(`panel#${openPanelId}`);
	}

	/**
	 * Creates a new menu from an array of menu items
	 * @param {string} id
	 * @param {any[]} menuitems
	 * @returns {BrowserPanel}
	 */
	createMenu(id, menuitems) {
		const doc = this.#win.document;

		const menuArea = /** @type {BrowserPanelMenu} */ (
			doc.createElement("browser-panel-menu")
		);
		menuArea.customizableContainer.appendChild(
			doc.createTextNode("hello world")
		);

		const panelEl = this._setupPanel(id, menuArea);

		return panelEl;
	}

	/**
	 * Initialises a panel
	 * @param {string} panelName
	 * @param {CustomElementConstructor | Element} panelElement
	 */
	_setupPanel(panelName, panelElement) {
		try {
			const panelId = `panel-${panelName}-${Date.now()}`;

			const panelEl = /** @type {BrowserPanel} */ (
				this.#win.document.createXULElement("panel", {
					is: "browser-panel"
				})
			);

			panelEl.id = panelId;

			if (this.#win.customElements.get(panelName)) {
				const panelAreaEl = this.#win.document.createElement(panelName);

				panelEl.appendChild(panelAreaEl);
			} else {
				panelEl.appendChild(/** @type {Element} */ (panelElement));
			}

			panelEl.addEventListener("popupshowing", () => {
				this.#visiblePanelIds.add(panelId);
			});

			panelEl.addEventListener("popuphiding", () => {
				this.#visiblePanelIds.delete(panelId);
			});

			return panelEl;
		} catch (e) {
			throw new Error(
				`${this.constructor.name}: Failure opening panel with ID '${panelName}'.\n` +
					e +
					"\n" +
					e.stack || ""
			);
		}
	}

	/**
	 * Obtains a panel using its panel ID
	 *
	 * Returns the panel element
	 * @param {string} panelId
	 */
	getPanelById(panelId) {
		const panelInstance = this.getPanel(panelId);

		if (!panelInstance) {
			throw new Error(
				`${this.constructor.name}: No panel found with name '${panelId}'.`
			);
		}

		const panelEl = this._setupPanel(panelId, panelInstance);

		return panelEl;
	}

	/**
	 * Opens a browser panel
	 *
	 * Returns the open panel ID
	 * @param {BrowserPanel} panelEl
	 * @param {PanelOpenOptions} openOptions
	 */
	open(panelEl, openOptions = {}) {
		panelEl.openPanel(openOptions);
	}

	/**
	 * Closes a currently visible panel using its open panel ID
	 * @param {string} openPanelId
	 */
	close(openPanelId) {
		if (this.#visiblePanelIds.has(openPanelId)) {
			const panelEl = this.getPanelElement(openPanelId);

			panelEl.hidePopup(true);
		}
	}

	/**
	 * Fired when a key is pressed on the window
	 * @param {KeyboardEvent} event
	 */
	_onWinKeyPress(event) {
		if (event.code == "Escape") {
			for (const panelId of this.visiblePanels) {
				const panelEl = this.getPanelElement(panelId);

				panelEl.hidePopup(true, true);
			}
		}
	}

	constructor(win) {
		this.#win = win;

		this.#win.addEventListener("keydown", this._onWinKeyPress.bind(this));
	}
}

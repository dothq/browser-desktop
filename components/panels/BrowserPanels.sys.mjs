/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {object} PanelOpenOptions
 * @property {number} [x]
 * @property {number} [y]
 * @property {Element} [element]
 * @property {`${"before" | "after"} ${"before" | "after"}`} [anchor]
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
		const els = [];

		for (const panelId of this.#visiblePanelIds.values()) {
			const panelEl = this.getPanelElement(panelId);

			if (panelEl) {
				els.push(panelEl);
			} else {
				this.#visiblePanelIds.delete(panelId);
			}
		}

		return els;
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
	 * Dispatches a panels event to an element
	 * @param {Element} element
	 * @param {string} name
	 * @param {Record<string, any>} data
	 */
	_dispatchEvent(element, name, data) {
		const evt = new CustomEvent(`BrowserPanels::${name}`, {
			detail: data
		});

		element.dispatchEvent(evt);
	}

	/**
	 * Opens a browser panel
	 *
	 * Returns the open panel ID
	 * @param {string} panel
	 * @param {PanelOpenOptions} openOptions
	 */
	open(panel, openOptions = {}) {
		const panelInstance = this.getPanel(panel);

		if (!panelInstance) {
			throw new Error(
				`${this.constructor.name}: No panel found with name '${panel}'.`
			);
		}

		try {
			const panelId = `panel-${panel}-${Date.now()}`;

			const noCoords =
				!("x" in openOptions) ||
				!("y" in openOptions) ||
				typeof openOptions.x == "undefined" ||
				typeof openOptions.y == "undefined";

			if (noCoords && !openOptions.element) {
				throw new Error(
					"Properties 'x' and 'y' or 'element' are required."
				);
			}

			if (!noCoords && openOptions.element) {
				throw new Error(
					"Properties 'x' and 'y' cannot be used with 'element'."
				);
			}

			if (openOptions.element && !openOptions.anchor) {
				openOptions.anchor = "before before";
			}

			const panelEl = /** @type {BrowserPanel} */ (
				this.#win.document.createXULElement("panel", {
					is: "browser-panel"
				})
			);

			const panelAreaEl = this.#win.document.createElement(panel);

			if (openOptions.element) {
				const [anchorX, anchorY] = openOptions.anchor.split(" ");

				const bounds = openOptions.element.getBoundingClientRect();

				const width = anchorX == "before" ? 0 : bounds.width;
				const height = anchorY == "before" ? 0 : bounds.height;

				openOptions.x = bounds.x + width;
				openOptions.y = bounds.y + height;

				this._dispatchEvent(openOptions.element, "PanelOpen", {
					id: panelId
				});

				panelEl.addEventListener(
					"popuphidden",
					() => {
						this._dispatchEvent(openOptions.element, "PanelClose", {
							id: panelId
						});
					},
					{ once: true }
				);
			}

			panelEl.id = panelId;
			this.#visiblePanelIds.add(panelId);

			panelEl.openArgs = openOptions.args || {};

			const root = this.#win.document.documentElement;
			root.appendChild(panelEl);

			panelEl.appendChild(panelAreaEl);
			panelEl.openPopup(null, "", openOptions.x, openOptions.y);

			return panelId;
		} catch (e) {
			throw new Error(
				`${this.constructor.name}: Failure opening panel with ID '${panel}'.\n` +
					e +
					"\n" +
					e.stack || ""
			);
		}
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

	constructor(win) {
		this.#win = win;
	}
}

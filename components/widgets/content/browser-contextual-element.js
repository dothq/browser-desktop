/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @template T
 * @typedef {new(...args: any[]) => T} Constructor
 **/

/**
 * Creates a BrowserContextualElement
 *
 * @template {Constructor<Element>} T - The base class constructor.
 * @param {T} BaseClass - The base class to extend.
 */
function BrowserContextualMixin(BaseClass) {
	const BrowserContextualElement = class extends BaseClass {
		/**
		 * Button handler context
		 */
		get context() {
			const area = this.associatedArea
				? { [this.associatedArea]: this.associatedAreaElement }
				: {};

			return gDotCommands.createContext({
				...area,
				...(this.contextOverrides || {}),
				win: window
			});
		}

		/**
		 * The associated area ID for this toolbar button
		 */
		get associatedArea() {
			return this.associatedAreaElement?.getAttribute("name");
		}

		/**
		 * The associated area element for this toolbar button
		 * @returns {BrowserCustomizableArea}
		 */
		get associatedAreaElement() {
			return /** @type {ShadowRoot} */ (this.getRootNode()).host?.closest(
				".customizable-area"
			);
		}

		/**
		 * Overrides to be passed to the routine on command
		 * @type {Partial<ReturnType<typeof gDotCommands.createContext>>}
		 */
		get contextOverrides() {
			return null;
		}

		/**
		 * Returns an object of all set arguments
		 * @returns {Record<string, any>}
		 */
		getArguments() {
			const args = {};

			for (const attr of this.attributes) {
				if (attr.name.startsWith("customizablearg")) {
					args[attr.name] = attr.value;
				}
			}

			return args;
		}

		/**
		 * Gets a single argument from the widget's element
		 * @param {string} name
		 */
		getArgument(name) {
			return this.getAttribute(`customizablearg-${name}`);
		}

		/**
		 * Sets an argument to the widget's element
		 * @param {string} name
		 * @param {any} value
		 */
		setArgument(name, value) {
			this.setAttribute(`customizablearg-${name}`, value);
		}
	};

	return BrowserContextualElement;
}

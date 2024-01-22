/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { ActionsReceiver } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsReceiver.sys.mjs"
);

/** @typedef {ReturnType<typeof BrowserCustomizableContextMixin<typeof Element>>["prototype"]} BrowserCustomizableContext */

/**
 * Creates a BrowserCustomizableContext element
 *
 * @template {Constructor<Element>} T - The base class constructor.
 * @param {T} Base - The base class to extend.
 */
var BrowserCustomizableContextMixin = (Base) => {
	const BrowserCustomizableContext = class extends Base {
		/**
		 * The actions receiver instance
		 * @type {typeof ActionsReceiver.prototype}
		 */
		actionsReceiver = null;

		/**
		 * The associated context for this area
		 *
		 * @typedef {object} CustomizableAreaContext
		 * @property {BrowserCustomizableContext} self - The area associated with this context
		 * @property {string} audience - The audience of this area's context
		 * @property {BrowserTab} tab - The tab associated with this area
		 * @property {ChromeBrowser} browser - The browser associated with this area
		 * @property {Window} window - The window associated with this area
		 * @returns {CustomizableAreaContext}
		 */
		get context() {
			const areaHost = /** @type {BrowserCustomizableContext} */ (
				/** @type {ShadowRoot} */ (this.getRootNode()).host
			);

			if (!(areaHost instanceof BrowserCustomizableContext)) {
				throw new Error(
					`BrowserCustomizableArea (${
						this.tagName
					}): Area host is not a customizable context instance, got '${
						/** @type {any} */ (areaHost).constructor.name
					}' instead!`
				);
			}

			if (!areaHost.context) {
				throw new Error(
					`${this.constructor.name} (${this.tagName}): No context available for this area!`
				);
			}

			return areaHost.context;
		}

		/**
		 * @param {any} args
		 */
		constructor(...args) {
			super(...args);

			this.actionsReceiver = new ActionsReceiver(this);
		}
	};

	return BrowserCustomizableContext;
};

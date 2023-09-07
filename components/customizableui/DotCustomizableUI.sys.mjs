/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class _CustomizableAreaElement extends Element {
	/** @type {CustomizableController} */
	customizable = null;
}

class CustomizableController {
	/**
	 * @param {string} areaName
	 */
	constructor(areaName) {
		this.areaName = areaName;
	}

	/**
	 * Adds a new widget to the customizable area using a widget's ID
	 * @param {string} widgetId
	 */
	addWidget(widgetId) {
		console.log("addWidget", widgetId);
	}
}

export const DotCustomizableUI = {
	CustomizableAreaElement: _CustomizableAreaElement,

	/** @type {Window} */
	win: null,

	/**
	 * Initialises the singleton
	 * @param {Window} win
	 */
	init(win) {
		console.time("DotCustomizableUI: init");

		this.win = win;

		console.timeEnd("DotCustomizableUI: init");
	},

	/**
	 * Obtains the customizable controls for an area by name
	 * @param {string} name
	 */
	getCustomizableControls(name) {
		return new CustomizableController(name);
	},

	/**
	 * Initialises an Element as a customizable area
	 * @param {Element} area
	 * @param {string} name
	 * @param {object} [options]
	 * @param {boolean} [options.many] - Marks this area as one of many areas with the same name
	 * @param {boolean} [options.showKeybindings] - Determines whether to show keybindings on tooltips
	 */
	initCustomizableArea(area, name, options) {
		area.classList.add("customizable-area");

		area.setAttribute("customizablename", name);
		area.toggleAttribute("customizablemany", options && !!options.many);
		area.toggleAttribute(
			"customizableshowkeybindings",
			options && !!options.showKeybindings
		);

		Object.defineProperty(area, "customizable", {
			get: () => {
				return DotCustomizableUI.getCustomizableControls(
					area.getAttribute("customizablename")
				);
			}
		});
	}
};

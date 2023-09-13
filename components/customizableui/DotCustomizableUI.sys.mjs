/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const kCustomizableAreasPrefId = "dot.customizable.area.";

class _CustomizableAreaElement extends Element {
	/** @type {CustomizableController} */
	customizable = null;
}

class CustomizableController {
	/**
	 * Internal data for this area
	 * @type {object}
	 */
	_internal = {};

	/**
	 * The name of this customizable area
	 */
	get name() {
		return this.areaEl.getAttribute("customizablename");
	}

	/**
	 * The display mode for this area
	 */
	get mode() {
		const mode = this.areaEl.getAttribute("mode");

		return mode == "icons"
			? "icons"
			: mode == "text"
			? "text"
			: "icons_text";
	}

	set mode(newMode) {
		this.areaEl.setAttribute("mode", newMode);
	}

	/**
	 * @param {Element} areaEl
	 */
	constructor(areaEl) {
		this.areaEl = areaEl;

		this.update();

		if (!this.areaEl.hasAttribute("mode")) {
			this.mode = this._internal.mode || "icons";
		}
	}

	update() {
		const json = Services.prefs.getStringPref(
			`${kCustomizableAreasPrefId}${this.name}`,
			"{}"
		);

		let parsed = {};

		try {
			parsed = { ...(JSON.parse(json) || {}) };
		} catch (e) {
			console.error(
				`Failed to parse JSON data for area '${this.name}'.`,
				e
			);
			return;
		}

		this._internal = parsed;
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

		Services.prefs.addObserver(kCustomizableAreasPrefId, this.observePrefs);

		console.timeEnd("DotCustomizableUI: init");
	},

	observePrefs(subject, topic, data) {
		if (data.startsWith(kCustomizableAreasPrefId)) {
			const areaId = data.split(kCustomizableAreasPrefId)[1];

			if (this.areas.has(areaId)) {
				const area = this.areas.get(areaId);

				area.update();
			} else {
				console.warn(`Area for preference '${data}' does not exist!`);
			}
		}
	},

	/**
	 * Updates the mode attribute for an area's descendants
	 * @param {Element} areaEl
	 */
	_setModeForDescendants(areaEl) {
		// const areaController = this.areas.get(
		// 	areaEl.getAttribute("customizablename")
		// );
		// const modeDependentEls = [
		// 	...Array.from(areaEl.querySelectorAll(".toolbar-button"))
		// ];
		// for (const dep of modeDependentEls) {
		// 	dep.setAttribute("mode", areaController.mode);
		// }
	},

	/** @type {MutationCallback} */
	observeAreaMutations(mutations) {
		for (const mut of mutations) {
			const area = /** @type {Element} */ (mut.target);

			if (mut.attributeName == "mode") {
				this._setModeForDescendants(area);
			}
		}
	},

	/**
	 * A map of area IDs to their respective customizable area controller
	 * @type {Map<string, CustomizableController>}
	 */
	areas: new Map(),

	/**
	 * A map of area IDs to their mutation observers
	 * @type {Map<string, MutationObserver>}
	 */
	areaMutationObservers: new Map(),

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

		area.attachShadow({ mode: "open" });

		if (
			options &&
			"showKeybindings" in options &&
			options.showKeybindings == false
		) {
			area.toggleAttribute("customizablenokeybindings", true);
		}

		this.areas.set(name, new CustomizableController(area));
	}
};

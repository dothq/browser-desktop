/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserCustomizableShared: Shared } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserCustomizableShared.sys.mjs"
);

export const BrowserCustomizableComponents = {
	/**
	 * A list of all elements that can have children
	 */
	get childCapableElements() {
		return ["browser-customizable-area", "browser-panel-menuitem"];
	},

	/**
	 * Creates a new area using its area ID and optional arguments
	 * @param {Document} doc
	 * @param {string} areaId
	 * @param {Record<string, any>} [args]
	 */
	createArea(doc, areaId, args) {
		const win = doc.ownerGlobal;
		const { html } = win;

		const elementMapping = {
			toolbar: () => html("browser-toolbar"),
			addressbar: () => html("browser-addressbar"),
			tabs: () => html("browser-tabs")
		};

		return areaId in elementMapping ? elementMapping[areaId]() : null;
	},

	/**
	 * Creates a new widget using the area's own component suite
	 * @param {BrowserCustomizableArea} area
	 * @param {string} widgetId
	 */
	createWidgetFromAreaComponents(area, widgetId) {
		Shared.logger.debug(
			`Creating widget '${widgetId}' from components on '${area.tagName}'.`
		);

		const areaComponents = /** @type {typeof BrowserCustomizableArea} */ (
			area.constructor
		).customizableComponents;

		if (areaComponents[widgetId]) {
			const component = areaComponents[widgetId];

			return component;
		} else {
			return null;
		}
	},

	/**
	 * Creates a new widget using its widget ID and optional arguments
	 * @param {Document} doc
	 * @param {string} widgetId
	 * @param {Record<string, any>} [args]
	 * @param {object} [options]
	 * @param {boolean} [options.allowInternal]
	 * @param {BrowserCustomizableArea} [options.area]
	 */
	createWidget(doc, widgetId, args, options) {
		const win = doc.ownerGlobal;
		const { html } = win;

		switch (widgetId) {
			case "web-contents":
				return html("browser-web-contents");
			case "tab-status":
				return html("browser-status");
			case "tab-icon":
				return html("browser-tab-icon");
			case "tab-label":
			case "tab-title":
				return html("browser-tab-label");
			case "spacer":
			case "spring":
				return html("browser-spring");
			case "menuitem":
				return html("browser-panel-menuitem");
			case "":
				return doc.createDocumentFragment();
			default:
				if (options && options.area) {
					const areaComponent = this.createWidgetFromAreaComponents(
						options.area,
						widgetId
					);

					if (areaComponent) return areaComponent;
				}

				return null;
		}
	}
};

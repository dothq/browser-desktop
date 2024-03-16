/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserCustomizableShared: Shared } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserCustomizableShared.sys.mjs"
);

const { BrowserCustomizableComponent: Component } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserCustomizableComponent.sys.mjs"
);

export class BrowserCustomizableComponents {
	/** @type {Map<symbol, Map<string, typeof Component["prototype"]>>} */
	components = new Map();

	/**
	 * A list of all elements that can have children
	 */
	get childCapableElements() {
		return ["browser-customizable-area", "menupopup"];
	}

	/**
	 * Creates a new area using its area ID and optional arguments
	 * @param {Document} doc
	 * @param {string} areaId
	 * @param {Record<string, any>} [attributes]
	 */
	createArea(doc, areaId, attributes) {
		const component = this.getComponentInstance(
			Component.TYPE_AREA,
			areaId
		);

		if (component) {
			const element = component.render(doc, attributes);

			return element;
		} else {
			return null;
		}
	}

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
	}

	/**
	 * Registers a new component to the registry
	 * @param {symbol} componentType
	 * @param {string} componentId
	 * @param {({
	 *      doc,
	 *      attributes,
	 *      html
	 * }: {
	 *      doc: Document,
	 *      attributes?: Record<string, any>,
	 *      html: typeof globalThis["html"]
	 * }) => Element | HTMLElement | DocumentFragment} componentRender
	 */
	registerComponent(componentType, componentId, componentRender) {
		if (!this.components.get(componentType)) {
			this.components.set(componentType, new Map());
		}

		if (this.components.get(componentType).has(componentId)) {
			throw new Error(
				`Component with ID '${componentId}' already exists!`
			);
		}

		try {
			const component = new Component(
				componentType,
				componentId,
				componentRender
			);

			this.components.get(componentType).set(componentId, component);
		} catch (e) {
			throw new Error(
				`Failed to register component with ID '${componentId}':\n` +
					e.toString().replace(/^Error: /, "") +
					"\n" +
					e.stack || ""
			);
		}
	}

	/**
	 * Obtains a component instance by its type and ID
	 * @param {symbol} componentType
	 * @param {string} componentId
	 */
	getComponentInstance(componentType, componentId) {
		if (!Shared.customizableComponentTagRegex.test(componentId)) {
			throw new Error(
				`Disallowed characters in component ID '${componentId}'.`
			);
		}

		if (this.components.get(componentType).has(componentId)) {
			const component = this.components
				.get(componentType)
				.get(componentId);

			return component;
		} else {
			return null;
		}
	}

	/**
	 * Creates a new widget using its widget ID and optional arguments
	 * @param {Document} doc
	 * @param {string} widgetId
	 * @param {Record<string, any>} [attributes]
	 * @param {object} [options]
	 * @param {boolean} [options.allowInternal]
	 * @param {BrowserCustomizableArea} [options.area]
	 */
	createWidget(doc, widgetId, attributes, options) {
		const component = this.getComponentInstance(
			Component.TYPE_WIDGET,
			widgetId
		);

		if (component) {
			return component.render(doc, attributes);
		}

		if (options && options.area) {
			const areaComponent = this.createWidgetFromAreaComponents(
				options.area,
				widgetId
			);

			if (areaComponent) return areaComponent;
		}

		return null;
	}

	/**
	 * Registers a custom component
	 * @param {object} componentDeclaration
	 */
	registerCustomComponent(componentDeclaration) {}

	/**
	 * Registers all built-in browser areas
	 */
	#registerAreas() {
		this.registerComponent(Component.TYPE_AREA, "toolbar", ({ html }) =>
			html("browser-toolbar")
		);

		this.registerComponent(Component.TYPE_AREA, "tabs", ({ html }) =>
			html("browser-tabs")
		);

		this.registerComponent(Component.TYPE_AREA, "urlbar", ({ html }) =>
			html("browser-urlbar")
		);

		this.registerComponent(Component.TYPE_AREA, "menu", ({ doc }) =>
			doc.createXULElement("menupopup")
		);
	}

	/**
	 * Registers all built-in browser widgets
	 */
	#registerWidgets() {
		this.registerComponent(
			Component.TYPE_WIDGET,
			"web-contents",
			({ html }) => html("browser-web-contents")
		);

		this.registerComponent(
			Component.TYPE_WIDGET,
			"tab-status",
			({ html }) => html("browser-status")
		);

		this.registerComponent(Component.TYPE_WIDGET, "tab-icon", ({ html }) =>
			html("browser-tab-icon")
		);

		this.registerComponent(Component.TYPE_WIDGET, "tab-label", ({ html }) =>
			html("browser-tab-label")
		);

		this.registerComponent(Component.TYPE_WIDGET, "spring", ({ html }) =>
			html("browser-spring")
		);

		this.registerComponent(Component.TYPE_WIDGET, "separator", ({ html }) =>
			html("browser-separator")
		);
	}

	constructor() {
		/** Areas */
		this.#registerAreas();

		/** Widgets */
		this.#registerWidgets();
	}
}

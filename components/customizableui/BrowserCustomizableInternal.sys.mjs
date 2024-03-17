/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserCustomizableShared: Shared } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserCustomizableShared.sys.mjs"
);

const { BrowserCustomizableComponents: Components } =
	ChromeUtils.importESModule(
		"resource://gre/modules/BrowserCustomizableComponents.sys.mjs"
	);

const { BrowserCustomizableAttributes: Attributes } =
	ChromeUtils.importESModule(
		"resource://gre/modules/BrowserCustomizableAttributes.sys.mjs"
	);

const { BrowserCustomizableComponent: Component } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserCustomizableComponent.sys.mjs"
);

const { JsonSchema } = ChromeUtils.importESModule(
	"resource://gre/modules/JsonSchema.sys.mjs"
);

/**
 * @typedef {[string, Record<string, string | number | boolean>, CustomizableComponentDefinition[] | Record<string, CustomizableComponentDefinition[]>]} CustomizableComponentDefinition
 */

/**
 * @param {Window} win
 */
export function BrowserCustomizableInternal(win) {
	this.win = win;
}

BrowserCustomizableInternal.prototype = {
	/**
	 * The current customizable state
	 */
	state: null,

	/**
	 * The customizable schema objects
	 * @type {Record<string, object>}
	 */
	schemas: null,

	/**
	 * THe customizable components instance
	 * @type {typeof Components["prototype"]}
	 */
	components: null,

	/**
	 * Fetches the customizable schema
	 */
	async ensureSchemas() {
		if (this.schemas) return;

		this.schemas = /** @type {any} */ ({});

		for await (const [name, uri] of Object.entries(
			Shared.customizableSchemas
		)) {
			this.schemas[name] = await fetch(uri).then((r) => r.json());
		}
	},

	/**
	 * Validates some data using a JSON Schema
	 * @param {object} schema
	 * @param {any} data
	 */
	async _validate(schema, data) {
		const validator = new JsonSchema.Validator(schema);

		validator.addSchema(this.schemas.defs);

		const { valid, errors } = validator.validate(data);

		if (valid) {
			return data;
		} else {
			throw new Error(
				"Failed to validate data using schema:\n" +
					errors
						.map((e) => `    ${e.keywordLocation}: ${e.error}`)
						.join("\n")
			);
		}
	},

	/**
	 * Parses the current customizable state preference
	 * @returns {Promise<object>}
	 */
	async parseConfig(config) {
		return this.ensureSchemas().then((_) => {
			return this._validate(this.schemas.state, config);
		});
	},

	/**
	 * Resets the customizable state preference to default
	 */
	async resetConfig() {
		Shared.logger.warn("Resetting customizable state to default!");

		Shared.customizablePrefs.setStringPref("state", "{}");
	},

	/**
	 * Connects attributes up to a customizable component
	 * @param {Element} element
	 * @param {CustomizableComponentDefinition[1]} attributes
	 */
	connectComponentWith(element, attributes) {
		const processor = Attributes.createProcessor(
			/** @type {any} */ (element.constructor).customizableAttributes ||
				{}
		);

		const processedAttributes = processor.processAttributes(
			Object.entries(attributes).map((a) => ({ name: a[0], value: a[1] }))
		);

		const processedAttributesKeys = Object.keys(processedAttributes);

		if (processedAttributesKeys.length) {
			element.setAttribute(
				"customizable-attrs",
				processedAttributesKeys.join(" ")
			);
		}

		for (const [key, value] of Object.entries(processedAttributes)) {
			const attributeValue = (value ?? "").toString();

			if (key in element) {
				try {
					element[key] = attributeValue;
				} catch (e) {
					element.setAttribute(key, attributeValue);
				}
			} else {
				element.setAttribute(key, attributeValue);
			}
		}

		return element;
	},

	/**
	 * Obtains a component using its type
	 * @param {string} type
	 * @param {object} [attributes]
	 * @param {object} [options]
	 * @param {boolean} [options.allowInternal]
	 * @param {BrowserCustomizableArea} [options.area]
	 * @returns {Element}
	 */
	getComponentByType(type, attributes, options) {
		const doc = this.win.document;

		let element;

		element = this.components.createWidget(doc, type, attributes, options);

		// If we couldn't make a widget, try making this as an area instead
		if (!element) {
			element = this.components.createArea(doc, type, attributes);
		}

		// Otherwise, this is an unknown type, we can stop here
		if (!element) {
			throw new Error(`Unknown component type '${type}'.`);
		}

		Shared.logger.debug(`Created new component '${type}'.`, element);

		return /** @type {Element} */ (element);
	},

	/**
	 * Determines whether a component is allowed children components
	 * @param {Element} parentElement
	 */
	isChildCapable(parentElement) {
		return !!this.components.childCapableElements
			.map((tag) => parentElement.ownerGlobal.customElements.get(tag))
			.filter(Boolean)
			.find((i) => parentElement instanceof i);
	},

	/**
	 * Obtains the nearest area from a supplied parent
	 *
	 * This is needed when we want to have children in a component,
	 * but need to retain area context and components.
	 * @param {Element} parentElement
	 * @param {BrowserCustomizableArea} areaForParent
	 * @returns {BrowserCustomizableArea}
	 */
	getNearestArea(parentElement, areaForParent) {
		const CustomizableArea = this.win.customElements.get(
			"browser-customizable-area"
		);

		if (parentElement instanceof CustomizableArea) {
			return /** @type {BrowserCustomizableArea} */ (parentElement);
		}

		// Edge case for when a parent somewhat implements the area
		// without actually extending the customizable area class.
		// prettier-ignore
		const implementsContext = 
			"CUSTOMIZABLE_AREA_IMPL" in /** @type {BrowserCustomizableContext} */ (parentElement);

		if (implementsContext) {
			return /** @type {BrowserCustomizableArea} */ (parentElement);
		}

		return areaForParent;
	},

	/**
	 * Gets a part by its defined name
	 * @param {Element} element
	 * @param {string} partName
	 * @returns {Element | DocumentFragment}
	 */
	getPartByName(element, partName) {
		return element.shadowRoot?.querySelector(`[part="${partName}"]`);
	},

	/**
	 * Determines whether we can append a child to a component
	 * @param {Element} parentElement
	 * @param {Element} child
	 * @param {string} part
	 */
	canAppendChildTo(parentElement, child, part) {
		if ("canAppendChild" in parentElement && parentElement.canAppendChild) {
			const rules = /** @type {BrowserCustomizableArea} */ (
				parentElement
			).canAppendChild();

			return rules[part] ? rules[part](child) : false;
		} else {
			return true;
		}
	},

	/**
	 * Appends children to a component
	 * @param {Element} parentElement
	 * @param {CustomizableComponentDefinition[2]} children
	 * @param {object} [options]
	 * @param {string} [options.part]
	 * @param {BrowserCustomizableArea} [options.areaForParent]
	 */
	appendChildrenTo(parentElement, children, options) {
		if (!parentElement) {
			throw new Error(`No parent element to append children to.`);
		}

		const part = options?.part || "content";

		// We use content as the user-facing part name, but customizable is the internal part name
		const internalPart = part == "content" ? "customizable" : part;

		if (Array.isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				if (!this.isChildCapable(parentElement)) {
					throw new Error(
						`Children are not allowed on the '${parentElement.tagName}' component.`
					);
				}

				const child = children[i];
				let childComponent = null;

				try {
					Shared.logger.debug(
						`Creating child '${child[0]}' using '${parentElement.tagName}' as the area.`
					);

					childComponent = this.createComponentFromDefinition(child, {
						area: /** @type {BrowserCustomizableArea} */ (
							parentElement
						)
					});
				} catch (e) {
					throw new Error(
						`Failed to create component '${child[0]}${
							part === "content" ? "" : `[${part}]`
						}[${i}]':\n` +
							e.toString().replace(/^Error: /, "") +
							"\n\n" +
							e.stack || ""
					);
				}

				if (childComponent.tagName === parentElement.tagName) {
					throw new Error(
						`Cannot have a '${child[0]}' inside another '${child[0]}'.`
					);
				}

				if (
					this.canAppendChildTo(parentElement, childComponent, part)
				) {
					let renderContainer = parentElement.shadowRoot
						? this.getPartByName(parentElement, internalPart)
						: parentElement;

					if (
						parentElement.shadowRoot &&
						!parentElement.shadowRoot.contains(renderContainer)
					) {
						throw new Error(
							`No '${part}' part available to render children to in '${parentElement.tagName}'.`
						);
					}

					// Handle customizable template based render containers
					// differently, as we append children to a "fake DOM".
					if (
						renderContainer instanceof
						this.win.customElements.get(
							"browser-customizable-template"
						)
					) {
						renderContainer =
							/** @type {BrowserCustomizableTemplate} */ (
								renderContainer
							).content;
					}

					renderContainer.appendChild(childComponent);

					this.dispatchEvent(
						childComponent,
						Shared.customizableDidMountEvent
					);
				} else {
					throw new Error(
						internalPart == "customizable"
							? `Child '${childComponent.tagName}' is not allowed in '${parentElement.tagName}'.`
							: `Child '${childComponent.tagName}' is not allowed in '${part}' for '${parentElement.tagName}'.`
					);
				}
			}
		} else {
			for (const [part, slottedChildren] of Object.entries(children)) {
				this.appendChildrenTo(parentElement, slottedChildren, {
					...(options || {}),
					part
				});
			}
		}
	},

	/**
	 * Creates a new customizable component
	 * @param {CustomizableComponentDefinition[0]} type
	 * @param {CustomizableComponentDefinition[1]} [attributes]
	 * @param {CustomizableComponentDefinition[2]} [children]
	 * @param {object} [creationOptions]
	 * @param {BrowserCustomizableArea} [creationOptions.area]
	 * @param {boolean} [creationOptions.allowInternal]
	 */
	createComponent(type, attributes, children, creationOptions) {
		if (!attributes) attributes = {};
		if (!children) children = [];

		const baseElement = this.getComponentByType(
			type,
			attributes,
			creationOptions
		);

		if (baseElement) {
			const component = this.connectComponentWith(
				baseElement,
				attributes
			);

			this.appendChildrenTo(component, children, {
				areaForParent: creationOptions?.area
			});

			return component;
		} else {
			throw new Error(`Failed to create element with type '${type}'.`);
		}
	},

	/**
	 * Creates a new customizable component from a component definition
	 * @param {CustomizableComponentDefinition} definition
	 * @param {Parameters<typeof this.createComponent>[3]} [options]
	 */
	createComponentFromDefinition(definition, options) {
		return this.createComponent(
			definition[0],
			definition[1] || {},
			definition[2] || [],
			options
		);
	},

	/**
	 * Creates a new fragment element with the supplied children
	 * @param {CustomizableComponentDefinition[]} children
	 * @param {Parameters<typeof this.createComponent>[3]} [options]
	 */
	createComponentFragment(children, options) {
		const root = this.win.document.createDocumentFragment();

		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			try {
				const component = this.createComponentFromDefinition(
					child,
					options
				);

				root.appendChild(component);
			} catch (e) {
				throw new Error(
					`Failed to create component '${child[0]}[${children
						.filter((c) => c[0] == child[0])
						.findIndex((c) => c === child)}]':\n` +
						e.toString().replace(/^Error: /, "") +
						"\n\n" +
						e.stack || ""
				);
			}
		}

		return root;
	},

	/**
	 * Registers all registered custom components
	 */
	async registerCustomComponents() {
		const componentPrefIds =
			Shared.customizablePrefs.getChildList("components.");

		for (const prefId of componentPrefIds) {
			const componentId = prefId.split("components.")[1];

			// Skip the registration of any components with disallowed characters
			if (!Shared.customizableComponentTagRegex.test(componentId)) {
				continue;
			}

			Shared.logger.debug(
				`Registering custom component with ID '${componentId}'.`
			);

			try {
				const serializedComponent =
					Shared.customizablePrefs.getStringPref(prefId, "{}");

				let component = {};

				try {
					component = JSON.parse(serializedComponent);
				} catch (e) {
					throw new Error("Failed to parse custom component.");
				}

				component = await this._validate(
					this.schemas.custom_component,
					component
				);

				if (!component) {
					throw new Error("Failed to parse custom component.");
				}

				this.components.registerCustomComponent(component);
			} catch (e) {
				throw new Error(
					`Failure registering custom component with ID '${componentId}':\n` +
						e.toString().replace(/^Error: /, "") +
						"\n\n" +
						e.stack || ""
				);
			}
		}
	},

	/**
	 * Dispatches a customizable UI event to an element
	 * @param {Element} component
	 * @param {string} event
	 */
	dispatchEvent(component, event) {
		const evt = new CustomEvent(`CustomizableUI::${event}`);

		component.dispatchEvent(evt);
	},

	/**
	 * Initialises the customizable components singleton
	 */
	async initComponents() {
		this.components = new Components();

		await this.registerCustomComponents();
	}
};

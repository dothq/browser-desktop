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
	 * The customizable state JSON schema object
	 */
	stateSchema: null,

	/**
	 * A map of reusable templates
	 * @type {Map<string, Element>}
	 */
	templates: new Map(),

	/**
	 * The base schema for validating component attributes
	 */
	attributesSchema: {
		$schema: "https://json-schema.org/draft/2020-12/schema",
		type: "object",
		properties: {},
		$defs: {
			length: {
				oneOf: [
					{
						type: "integer",
						minimum: 0
					},
					{
						enum: ["fill", "hug"]
					}
				]
			},
			color: {
				type: "string"
			},
			mode: {
				enum: ["icons", "text", "icons_text"]
			},
			orientation: {
				enum: ["horizontal", "vertical"]
			}
		}
	},

	/**
	 * Fetches the customizable state schema
	 */
	async ensureStateSchema() {
		if (this.stateSchema) return;

		this.stateSchema = await fetch(Shared.customizableStateSchemaURI).then(
			(r) => r.json()
		);
	},

	/**
	 * Validates some data using a JSON Schema
	 * @param {object} schema
	 * @param {any} data
	 */
	_validate(schema, data) {
		const validator = new JsonSchema.Validator(schema);

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
	async parseConfig() {
		const serialized = Services.prefs.getStringPref(
			Shared.customizableStatePref,
			"{}"
		);

		let data = {};

		try {
			data = JSON.parse(serialized);
		} catch (e) {
			throw e;
		}

		return this.ensureStateSchema().then((_) => {
			return this._validate(this.stateSchema, data);
		});
	},

	/**
	 * Resets the customizable state preference to default
	 */
	async resetConfig() {
		Shared.logger.warn("Resetting customizable state to default!");

		Services.prefs.setStringPref(Shared.customizableStatePref, "{}");
	},

	/**
	 * Stylesheets for the customizable root
	 */
	get customizableStylesheets() {
		return ["chrome://dot/skin/browser.css"].map((sheet) => {
			const stylesheet = this.win.document.createElement("link");
			stylesheet.setAttribute("rel", "stylesheet");
			stylesheet.setAttribute("href", sheet);

			return stylesheet;
		});
	},

	/**
	 * Connects attributes up to a customizable component
	 * @param {Element} element
	 * @param {CustomizableComponentDefinition[1]} attributes
	 */
	connectComponentWith(element, attributes) {
		const validated = this._validate(
			// prettier-ignore
			{
				...this.attributesSchema,
				...(/** @type {any} */ (element).attributesSchema || {}),
				additionalProperties: !/** @type {any} */ (element).attributesSchema
			},
			attributes
		);

		for (const [key, value] of Object.entries(validated)) {
			element.setAttribute(key, (value ?? "").toString());
		}

		return element;
	},

	/**
	 * Obtains a component using its type
	 * @param {string} type
	 * @param {object} [attributes]
	 * @param {object} [options]
	 * @param {boolean} [options.allowInternal]
	 * @returns {Element}
	 */
	getComponentByType(type, attributes, options) {
		const doc = this.win.document;

		let element;

		if (type.charAt(0) == "@") {
			const templatedComponent = this.templates
				.get(type.substring(1))
				.cloneNode(true);

			return /** @type {Element} */ (templatedComponent);
		}

		element = Components.createWidget(doc, type, attributes);

		// If we couldn't make a widget, try making this as an area instead
		if (!element) {
			element = Components.createArea(doc, type, attributes);
		}

		Shared.logger.debug(`Created new component '${type}'.`, element);

		// Otherwise, this is an unknown type, we can stop here
		if (!element) {
			throw new Error(`Unknown component type '${type}'.`);
		}

		return /** @type {Element} */ (element);
	},

	/**
	 * Appends children to a component
	 * @param {Element} parentElement
	 * @param {string} slot
	 * @param {CustomizableComponentDefinition[2]} children
	 */
	appendChildrenTo(parentElement, children, slot = "content") {
		if (!parentElement) return;

		if (Array.isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				if (
					!parentElement.shadowRoot ||
					!(
						parentElement instanceof
						this.win.customElements.get("browser-customizable-area")
					)
				) {
					throw new Error(
						`Children are not allowed on this component.`
					);
				}

				const child = children[i];

				const childComponent =
					this.createComponentFromDefinition(child);

				if (childComponent.tagName === parentElement.tagName) {
					throw new Error(
						`Cannot have a '${child[0]}' inside another '${child[0]}'.`
					);
				}

				if (
					"canAppendChild" &&
					parentElement &&
					/** @type {any} */ (parentElement).canAppendChild(
						childComponent
					)
				) {
					const { shadowRoot } = parentElement;

					const whereToAppend =
						shadowRoot.querySelector(`[part="customizable"]`) ||
						shadowRoot;

					whereToAppend.appendChild(childComponent);
				}
			}
		} else {
			for (const [slot, slottedChildren] of Object.entries(children)) {
				this.appendChildrenTo(parentElement, slottedChildren, slot);
			}
		}
	},

	/**
	 * Creates a new customizable component
	 * @param {CustomizableComponentDefinition[0]} type
	 * @param {CustomizableComponentDefinition[1]} [attributes]
	 * @param {CustomizableComponentDefinition[2]} [children]
	 * @param {object} [creationOptions]
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

			this.appendChildrenTo(
				/** @type {BrowserCustomizableArea} */ (component),
				children
			);

			return component;
		} else {
			return null;
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
	 */
	createComponentFragment(children) {
		const root = this.win.document.createDocumentFragment();

		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			try {
				const component = this.createComponentFromDefinition(child);

				root.appendChild(component);
			} catch (e) {
				throw new Error(
					`Failed to create component '${child[0]}[${i}]':\n` + e
				);
			}
		}

		return root;
	},

	/**
	 * Registers a new reusable template
	 * @param {string} name
	 * @param {CustomizableComponentDefinition} template
	 */
	registerTemplate(name, template) {
		if (this.templates.has(name)) {
			throw new Error(`Template with name '${name}' already exists!`);
		}

		const component = this.createComponentFromDefinition(template);

		this.templates.set(name, component);
	},

	/**
	 * Registers templates using a KV map
	 * @param {Record<string, CustomizableComponentDefinition>} templates
	 */
	registerNamedTemplates(templates) {
		this.templates.clear();

		for (const [name, template] of Object.entries(templates)) {
			this.registerTemplate(name, template);
		}
	},

	/**
	 * Creates a slot element with a name
	 * @param {string} name
	 */
	createSlot(name) {
		const slot = this.win.document.createElement("slot");
		slot.setAttribute("name", name);

		return slot;
	},

	/**
	 * Loads a customizable component into the window
	 * @param {string} name
	 */
	_loadCustomizableComponent(name) {
		if (this.win.customElements.get(name)) return;

		Services.scriptloader.loadSubScript(
			`chrome://dot/content/customizableui/components/${name}.js`,
			this.win
		);
	},

	/**
	 * Ensures the customizable components are loaded
	 */
	ensureCustomizableComponents() {
		["customizable-root", "customizable-web-contents"].forEach(
			(component) => {
				if (this.win.customElements.get(component)) return;

				this.win.customElements.setElementCreationCallback(
					component,
					() => {
						this._loadCustomizableComponent(component);
					}
				);
			}
		);
	}
};

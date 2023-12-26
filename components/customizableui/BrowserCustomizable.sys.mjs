/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { BrowserCustomizableInternal } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserCustomizableInternal.sys.mjs"
);

const { BrowserCustomizableShared: Shared } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserCustomizableShared.sys.mjs"
);

/**
 * @param {BrowserCustomizableArea} renderRoot
 */
export function BrowserCustomizable(renderRoot) {
	this.init(renderRoot);
}

BrowserCustomizable.prototype = {
	/** @type {Window} */
	win: null,

	/** @type {typeof BrowserCustomizableInternal.prototype} */
	internal: null,

	/**
	 * The current stored customizable state
	 * @type {object}
	 */
	state: null,

	/**
	 * The element to render the customizable interface to
	 * @type {BrowserCustomizableArea}
	 */
	renderRoot: null,

	/** @type {DocumentFragment} */
	_root: null,

	/**
	 * The main root parent of all modules
	 */
	get root() {
		return this._root;
	},

	/**
	 * Updates the customizable UI state
	 * @param {object} data
	 * @param {boolean} [permanent]
	 */
	async setState(data, permanent = false) {
		const newState = await this.internal.parseConfig(data);

		if (!newState) {
			throw new Error("Failed to parse customizable state.");
		}

		this.state = data;

		if (permanent) {
			Services.prefs.setStringPref(
				Shared.customizableStatePref,
				JSON.stringify(data)
			);
		}

		return this.state;
	},

	/**
	 * Refetches and validates the customizable state
	 */
	async _updateState() {
		const serialized = Services.prefs.getStringPref(
			Shared.customizableStatePref,
			"{}"
		);

		try {
			this.state = JSON.parse(serialized);
		} catch (e) {
			throw new Error("Failed to parse customizable state.");
		}

		const newState = await this.internal.parseConfig(this.state);

		if (!newState) {
			throw new Error("Failed to parse customizable state.");
		}

		this.state = newState;
	},

	/**
	 * Repaints the whole browser interface
	 */
	async _paint() {
		const templates = this.state.templates || {};

		Shared.logger.log(
			`Registering ${Object.keys(templates).length} templates...`
		);
		try {
			this.internal.registerNamedTemplates(this.renderRoot, templates);
		} catch (e) {
			throw new Error(
				"Failure registering template components:\n" +
					e.toString().replace(/^Error: /, "") +
					"\n" +
					e.stack || ""
			);
		}

		Shared.logger.log("Registering root component...");
		try {
			const rootElement = this.internal.createComponentFragment(
				this.state.state,
				{ area: this.renderRoot }
			);

			this.renderRoot.shadowRoot
				.querySelector(`[part="customizable"]`)
				.replaceChildren();

			this._root = rootElement;

			this.renderRoot.shadowRoot
				.querySelector(`[part="customizable"]`)
				.append(this._root);

			this.internal.dispatchMountEvent(this.renderRoot);
		} catch (e) {
			throw new Error(
				"Failure registering root component:\n" +
					e.toString().replace(/^Error: /, "") +
					"\n" +
					e.stack || ""
			);
		}
	},

	/**
	 * Updates the entire customizable interface
	 */
	async _update(boot = false, reset = false) {
		try {
			if (!this.state) await this._updateState();

			await this._paint();
		} catch (e) {
			Shared.logger.error("Failure reading customizable state:", e);

			if (boot || !reset) {
				Services.prompt.alert(
					this.win,
					"Dot Browser",
					"Failure reading customizable state:\n\n" +
						e.toString().replace(/^Error: /, "")
				);
			}
		}
	},

	/**
	 * Initialises any observers needed for BrowserCustomizable
	 */
	_initObservers() {
		Services.prefs.addObserver(
			Shared.customizableStatePref,
			(() => this._update()).bind(this)
		);
	},

	/**
	 * Renders a template with customizable area context
	 * @param {BrowserCustomizableArea} area
	 * @param {string} templateId
	 */
	createTemplateFragment(area, templateId) {
		return this.internal.createTemplateFragment(area, templateId);
	},

	/**
	 * Initialises the BrowserCustomizable class
	 * @param {BrowserCustomizableArea} renderRoot
	 */
	async init(renderRoot) {
		if (this.renderRoot)
			throw new Error(
				"BrowserCustomizable cannot be initialised more than once!"
			);
		this.renderRoot = renderRoot;
		this.win = this.renderRoot.ownerGlobal;

		this.internal = new BrowserCustomizableInternal(this.win);
		this.internal.ensureCustomizableComponents();

		this._initObservers();

		await this._update(true);
	}
};

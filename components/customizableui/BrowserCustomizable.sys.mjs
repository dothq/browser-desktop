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
 * @param {Element} renderRoot
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
	 */
	state: {},

	/**
	 * The element to render the customizable interface to
	 * @type {Element}
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
	 * Refetches and validates the customizable state
	 */
	async _updateState() {
		const newState = await this.internal.parseConfig();

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
			this.internal.registerNamedTemplates(templates);
		} catch (e) {
			throw new Error("Failure registering template components:\n" + e);
		}

		Shared.logger.log("Registering root component...");
		try {
			const rootElement = this.internal.createComponentFragment(
				this.state.state
			);

			this.renderRoot.shadowRoot.replaceChildren();

			this._root = rootElement;

			this.renderRoot.shadowRoot.append(
				...this.internal.customizableStylesheets,
				this._root
			);
		} catch (e) {
			throw new Error("Failure registering root component:\n" + e);
		}
	},

	/**
	 * Updates the entire customizable interface
	 */
	async _update(boot = false) {
		try {
			await this._updateState();
			await this._paint();
		} catch (e) {
			Shared.logger.error("Failure reading customizable state:", e);

			if (boot) {
				await this.internal.resetConfig();
				await this._update();
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
	 * Initialises the BrowserCustomizable class
	 * @param {Element} renderRoot
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

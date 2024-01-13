/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserUrlbar extends BrowserUrlbarRoot {
	URLBAR_RENDERABLE_SLOT = "urlbar-renderable";

	/** @type {MutationObserver} */
	#slotMutationObserver = null;

	constructor() {
		super();

		this.#slotMutationObserver = new MutationObserver(
			this.#onUrlbarSlotMutated.bind(this)
		);
	}

	static get observedAttributes() {
		return ["focused", "expanded"];
	}

	/**
	 * Determines whether the customizable contents are initted
	 */
	_customizableReady = false;

	/**
	 * The template that houses the urlbar's contents
	 */
	get _urlbarTemplate() {
		return /** @type {BrowserCustomizableTemplate} */ (
			this.shadowRoot.querySelector(
				"browser-customizable-template[part=customizable]"
			) || html("browser-customizable-template", { part: "customizable" })
		);
	}

	/**
	 * The container that will house the urlbar's contents from the template
	 */
	get _urlbarContainer() {
		return /** @type {BrowserUrlbarContainer} */ (
			this.querySelector("browser-urlbar-container") ||
				html("browser-urlbar-container", {
					slot: this.URLBAR_RENDERABLE_SLOT
				})
		);
	}

	/**
	 * The urlbar's panel element that is displayed in the "expanded" state
	 */
	get urlbarShadowPanel() {
		return /** @type {BrowserUrlbarPanel} */ (
			this.shadowRoot.querySelector("panel[is=browser-urlbar-panel]") ||
				document.createXULElement("panel", {
					is: "browser-urlbar-panel"
				})
		);
	}

	/**
	 * The slot that stores the urlbar's contents
	 */
	get urlbarShadowSlot() {
		return /** @type {HTMLSlotElement} */ (
			this.shadowRoot.querySelector(
				`slot[name=${this.URLBAR_RENDERABLE_SLOT}]`
			) || html("slot", { name: this.URLBAR_RENDERABLE_SLOT })
		);
	}

	/**
	 * The customizable container associated with the urlbar
	 */
	get customizableContainer() {
		return this._customizableReady
			? this._urlbarContainer.customizableContainer
			: this._urlbarTemplate;
	}

	/**
	 * Determines whether the urlbar is expanded
	 */
	get expanded() {
		return this.hasAttribute("expanded");
	}

	/**
	 * Updates the urlbar expanded state
	 * @param {boolean} newValue
	 * @param {boolean} [force]
	 */
	setExpanded(newValue, force = false) {
		// Prevent us from toggling off expanded mode if we don't want to autohide popups
		if (
			!force &&
			!newValue &&
			Services.prefs.getBoolPref("ui.popup.disable_autohide", false)
		) {
			return;
		}

		this.toggleAttribute("expanded", newValue);
	}

	/**
	 * Determines whether the urlbar is focused
	 */
	get focused() {
		return this.hasAttribute("focused");
	}

	set focused(newValue) {
		this.toggleAttribute("focused", newValue);
	}

	/**
	 * @param {BrowserDebugHologram} hologram
	 */
	renderDebugHologram(hologram) {
		return html(
			"div",
			{},
			...[`URL: about:blank`, `Typed: null`].map((c) =>
				html("span", {}, c)
			)
		);
	}

	/**
	 * Changes the slots parent element
	 * @param {Element | DocumentFragment} parent
	 */
	#setSlotParent(parent) {
		parent.prepend(this.urlbarShadowSlot);

		this.#slotMutationObserver.observe(parent, {
			childList: true,
			subtree: true
		});
	}

	/**
	 * Fired when the urlbar's slot is mutated
	 * @type {MutationCallback}
	 */
	#onUrlbarSlotMutated(mutations) {
		if (!this.shadowRoot.contains(this.urlbarShadowSlot)) {
			this.setExpanded(false, true);

			this.#setSlotParent(this.shadowRoot);
		}
	}

	/**
	 * Fired when the urlbar's "expanded" state is changed
	 * @param {boolean} expanded
	 */
	#onUrlbarExpandChanged(expanded) {
		console.log("Urlbar expand", expanded);

		if (expanded) {
			this.shadowRoot.appendChild(this.urlbarShadowPanel);
			this.urlbarShadowPanel.show();
		} else {
			this.urlbarShadowPanel.remove();
		}

		this.#setSlotParent(
			expanded ? this.urlbarShadowPanel.container : this.shadowRoot
		);
	}

	/**
	 * Initialises the customizable container from the template
	 */
	#initCustomizable() {
		if (this._customizableReady) return;

		const clonedContents = this._urlbarTemplate.content.cloneNode(true);

		this.appendChild(this._urlbarContainer);
		this._urlbarContainer.customizableContainer.appendChild(clonedContents);

		this._urlbarTemplate.remove();

		this._customizableReady = true;
	}

	/**
	 * Initialises the debug hologram
	 */
	#initDebugHologram() {
		this.shadowRoot.appendChild(
			BrowserDebugHologram.create(
				{
					id: "urlbar",
					prefId: "dot.urlbar.debug_information.visible"
				},
				this.renderDebugHologram.bind(this)
			)
		);
	}

	/**
	 * Initialises the urlbar component
	 */
	#init() {
		this.#initCustomizable();
		this.#initDebugHologram();
	}

	connectedCallback() {
		super.connect("urlbar", {
			orientation: "horizontal",
			styles: ["chrome://dot/content/widgets/browser-urlbar.css"]
		});

		this.#init();

		this.#setSlotParent(this.shadowRoot);
	}

	attributeChangedCallback(attribute, oldValue, newValue) {
		switch (attribute) {
			case "expanded":
				this.#onUrlbarExpandChanged(this.hasAttribute("expanded"));
				break;
		}
	}
}

customElements.define("browser-urlbar", BrowserUrlbar);

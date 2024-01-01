/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserUrlbar extends BrowserUrlbarRoot {
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
				html("browser-urlbar-container", { slot: "urlbar-container" })
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

		this.shadowRoot.appendChild(html("slot", { name: "urlbar-container" }));
	}
}

customElements.define("browser-urlbar", BrowserUrlbar);

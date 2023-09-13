/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserAddressBarIdentityBox extends BrowserContextualMixin(
	MozHTMLElement
) {
	constructor() {
		super();
	}

	/**
	 * Handles incoming events
	 * @param {Event} event
	 */
	handleEvent(event) {
		const target = /** @type {HTMLElement} */ (event.target);

		switch (event.type) {
			case "mouseover":
			case "mouseout": {
				const closestToolbarButton = target.closest(".toolbar-button");

				if (closestToolbarButton?.previousElementSibling) {
					if (
						closestToolbarButton?.hasAttribute("precedes-hover") &&
						event.type == "mouseover"
					) {
						return;
					}

					closestToolbarButton?.previousElementSibling.toggleAttribute(
						"precedes-hover",
						event.type == "mouseover" &&
							!closestToolbarButton?.hasAttribute("disabled")
					);
				}

				break;
			}
		}
	}

	/** @type {MutationCallback} */
	_observeMutations(mutations) {
		this.toggleAttribute(
			"onlychild",
			this.children.length <= 1 ||
				(this.children.length <= 1 &&
					this.children[0]?.getAttribute("mode") == "icons")
		);
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.classList.add("addressbar-identity-box");

		const identityButton = document.createElement("button", {
			is: "identity-button"
		});
		identityButton.classList.add("addressbar-identity-button");

		this.append(
			document.createElement("button", {
				is: "reload-button"
			})
		);
		this.appendChild(identityButton);

		this.addEventListener("mouseover", this);
		this.addEventListener("mouseout", this);

		this._mutationObserver = new MutationObserver(
			this._observeMutations.bind(this)
		);
		this._mutationObserver.observe(this, {
			childList: true,
			subtree: true
		});
	}

	disconnectedCallback() {
		this.removeEventListener("mouseover", this);
		this.removeEventListener("mouseout", this);
	}
}

customElements.define(
	"browser-addressbar-identity-box",
	BrowserAddressBarIdentityBox
);

class BrowserAddressBarInput extends HTMLInputElement {
	/**
	 * Handles incoming events
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "focusin": {
				this.parentElement.toggleAttribute("focuswithin", true);

				this.addEventListener(
					"mouseup",
					() => {
						let start = this.selectionStart;
						let end = this.selectionEnd;

						if (start == end) {
							start = 0;
							end = this.value.length;
						}

						this.setSelectionRange(start, end);
					},
					{ once: true }
				);
				break;
			}
			case "focusout": {
				this.parentElement.toggleAttribute("focuswithin", false);

				this.setSelectionRange(-1, -1);

				break;
			}
		}
	}

	async connectedCallback() {
		this.type = "text";
		this.classList.add("addressbar-input");

		document.l10n.setAttributes(this, "addressbar-input-field");
		this.setAttribute("data-l10n-attrs", "placeholder");

		this.addEventListener("focusin", this);
		this.addEventListener("focusout", this);
	}
}

customElements.define("browser-addressbar-input", BrowserAddressBarInput, {
	extends: "input"
});

class BrowserAddressBar extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	/**
	 * The browser window's selectedTab
	 */
	get tab() {
		return gDot.tabs.selectedTab;
	}

	/**
	 * The selected browser element
	 * @returns {ChromeBrowser | null}
	 */
	get browser() {
		if (!gDot?.tabs?._isWebContentsBrowserElement(this.tab.webContents)) {
			return null;
		}
		return /** @type {ChromeBrowser} */ (this.tab.webContents);
	}

	/**
	 * The anatomy of the address bar
	 *
	 * @typedef {Object} AddressBarElements
	 * @property {BrowserAddressBarIdentityBox} identityBox - The addressbar's identity box
	 * @property {BrowserAddressBarInput} input - The addressbar's input element
	 *
	 * @returns {AddressBarElements}
	 */
	get elements() {
		return {
			identityBox: /** @type {BrowserAddressBarIdentityBox} */ (
				this.querySelector(".addressbar-identity-box") ||
					html("browser-addressbar-identity-box")
			),
			input: /** @type {BrowserAddressBarInput} */ (
				this.querySelector(".addressbar-input") ||
					document.createElement("input", {
						is: "browser-addressbar-input"
					})
			)
		};
	}

	/**
	 * Updates the input field of the addressbar
	 */
	async updateInput() {
		const { hasInvalidPageProxyState, isInternalPage } =
			this.tab.siteIdentity;

		this.elements.input.value =
			hasInvalidPageProxyState || isInternalPage
				? ""
				: this.browser.currentURI.spec;

		document.l10n.setAttributes(
			this.elements.input,
			"addressbar-input-field-with-engine",
			{
				engine: (await gDot.search.defaultEngine).name
			}
		);
	}

	/**
	 * Handles incoming events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::TabSelect": {
				if (!gDot?.tabs || event.detail !== this.tab) return;

				this.updateInput();
				break;
			}
			case "BrowserTabs::BrowserLocationChange": {
				if (event.detail.browser !== this.browser) return;

				this.updateInput();
				break;
			}
			case "BrowserTabs::TabIdentityChanged": {
				if (event.detail.tab !== this.tab) return;

				this.updateInput();
				break;
			}
		}
	}

	connectedCallback() {
		super.connect({
			name: "addressbar",

			layout: "addressbar"
		});

		window.addEventListener("BrowserTabs::BrowserLocationChange", this);
		window.addEventListener("BrowserTabs::TabSelect", this);
	}

	disconnectedCallback() {
		window.removeEventListener("BrowserTabs::BrowserLocationChange", this);
		window.removeEventListener("BrowserTabs::TabSelect", this);
	}
}

customElements.define("browser-addressbar", BrowserAddressBar);

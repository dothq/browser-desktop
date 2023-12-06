/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabBox extends MozHTMLElement {
	static get observedAttributes() {
		return ["selected"];
	}

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	/**
	 * The shadow elements needed for the tab box
	 */
	get shadowElements() {
		return {
			tabsList:
				this.shadowRoot.querySelector(".tab-box-tabslist") ||
				html(
					"div",
					{ class: "tab-box-tabslist" },
					html("slot", { name: "tab" })
				),
			tabsPanel:
				this.shadowRoot.querySelector(".tab-box-tabspanel") ||
				html(
					"div",
					{ class: "tab-box-tabspanel" },
					html("slot", { name: "panel" })
				)
		};
	}

	/**
	 * Obtains a tab by its name
	 * @param {string} name
	 * @returns {HTMLElement}
	 */
	getTabByName(name) {
		return this.querySelector(`[slot=tab][name="${name}"]`);
	}

	/**
	 * Obtains a panel by its name
	 * @param {string} name
	 * @returns {HTMLElement}
	 */
	getPanelByName(name) {
		return this.querySelector(`[slot=panel][name="${name}"]`);
	}

	/**
	 * Handles incoming events to the tab box
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "click":
				if (
					event.target instanceof Element &&
					event.target.slot == "tab"
				) {
					this.setAttribute(
						"selected",
						event.target.getAttribute("name")
					);
				}

				break;
		}
	}

	connectedCallback() {
		this.shadowRoot.prepend(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/content/widgets/browser-tab-box.css"
			})
		);

		this.shadowRoot.appendChild(this.shadowElements.tabsList);
		this.shadowRoot.appendChild(this.shadowElements.tabsPanel);

		this.shadowElements.tabsList.addEventListener("click", this);

		this.attributeChangedCallback(
			"selected",
			null,
			this.getAttribute("selected")
		);
	}

	disconnectedCallback() {
		this.shadowElements.tabsList.removeEventListener("click", this);
	}

	attributeChangedCallback(attribute, oldValue, newValue) {
		if (attribute != "selected") return;

		const oldTab = oldValue && this.getTabByName(oldValue);
		const oldPanel = oldValue && this.getPanelByName(oldValue);

		oldTab?.removeAttribute("selected");
		oldPanel?.removeAttribute("selected");

		const newTab = this.getTabByName(newValue);
		const newPanel = this.getPanelByName(newValue);

		newTab?.toggleAttribute("selected", true);
		newPanel?.toggleAttribute("selected", true);
	}
}

customElements.define("browser-tab-box", BrowserTabBox);

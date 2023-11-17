/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class DeveloperCustomizableAreaContext extends MozHTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	/**
	 * The associated area for this element
	 */
	get area() {
		return /** @type {BrowserCustomizableArea} */ (
			/** @type {ShadowRoot} */ (this.getRootNode()).host
		);
	}

	/**
	 * The context menu that appears on click
	 */
	get menu() {
		return /** @type {import("third_party/dothq/gecko-types/lib").XULPopupElement} */ (
			this.querySelector("menupopup.area-context-menu")
		);
	}

	_intervals = [];

	cleanup() {
		for (const i of this._intervals) {
			clearInterval(i);
			clearTimeout(i);
		}
	}

	get menuContents() {
		const root = html("div", { class: "area-context-menu-content" });

		const tagName = html("strong", {}, this.area.tagName);
		const detail = html("span", {}, "n/a");

		root.append(tagName, detail);

		return root;
	}

	/**
	 * The inspect button element
	 */
	get inspectButton() {
		return /** @type {BrowserToolbarButton} */ (
			this.querySelector("button.toolbar-button") ||
				html(
					"button",
					{
						class: "toolbar-button",
						mode: "icons",
						title: "Inspect area"
					},
					html("browser-icon", {
						name: "inspect",
						class: "toolbar-button-icon"
					})
				)
		);
	}

	/**
	 * Triggered when the inspect button is clicked
	 * @param {MouseEvent} event
	 */
	onInspectClick(event) {
		this.menu.replaceChildren(this.menuContents);
		this.menu.openPopup(this, "bottomleft topleft", 0, 0);
	}

	/**
	 * Creates a new menu
	 */
	createMenu() {
		const menupopup = document.createXULElement("menupopup");
		menupopup.classList.add("area-context-menu");
		menupopup.append(this.menuContents);

		return menupopup;
	}

	connectedCallback() {
		this.append(
			html("link", {
				id: "dev-customizable-area-context-sheet",
				rel: "stylesheet",
				href: "chrome://dot/content/widgets/dev-customizable-area-context.css"
			})
		);

		this.shadowRoot.appendChild(html("slot"));

		this.appendChild(this.inspectButton);
		this.appendChild(this.createMenu());

		this.menu.addEventListener("popupshowing", () => {
			this.inspectButton.toggleAttribute("active", true);
		});

		this.menu.addEventListener("popuphiding", () => {
			this.inspectButton.toggleAttribute("active", false);
			this.cleanup();
		});

		this.inspectButton.addEventListener(
			"click",
			this.onInspectClick.bind(this)
		);
	}
}

customElements.define(
	"dev-customizable-area-context",
	DeveloperCustomizableAreaContext
);

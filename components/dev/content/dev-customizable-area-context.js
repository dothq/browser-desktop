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
		const detail = html("span", { class: "detail" }, "n/a");

		root.append(tagName, detail);

		return root;
	}

	/**
	 * The inspect button element
	 */
	get inspectButton() {
		return /** @type {BrowserToolbarButton} */ (
			this.querySelector("button.browser-button") ||
				html(
					"button",
					{
						class: "browser-button",
						mode: "icons",
						title: "Inspect area"
					},
					html("browser-icon", {
						name: "inspect",
						class: "browser-button-icon"
					})
				)
		);
	}

	/**
	 * Casts an element to a string type
	 * @param {Element} element
	 */
	elementAsString(element) {
		let str = ``;

		if (element.tagName) {
			let tagName = element.tagName;

			if (tagName.includes(":")) {
				tagName = tagName.split(":")[1];
			}

			str += tagName;
		}

		if (element.id) {
			str += `#${element.id}`;
		}

		if (element instanceof BrowserRenderedTab) {
			element = element.linkedTab;
		}

		if (element instanceof BrowserTab) {
			str += ` (${element.linkedBrowser.contentTitle.substring(0, 20)})`;
		}

		if (element instanceof customElements.get("browser")) {
			str += ` (${this.elementAsString(
				element.closest("browser-web-panel")
			)})`;
		}

		if (
			element.tagName === "html" &&
			element.ownerGlobal === this.ownerGlobal
		) {
			str += " (this window)";
		} else if (!element || !element.parentElement) {
			str += `(unknown/detached element)`;
			return str;
		}

		return str;
	}

	/**
	 * Triggered when the inspect button is clicked
	 * @param {MouseEvent} event
	 */
	onInspectClick(event) {
		this.menu.replaceChildren(this.menuContents);
		this.menu.openPopup(this, "bottomleft topleft", 0, 0);

		const render = () => {
			const area = /** @type {BrowserCustomizableArea} */ (
				/** @type {ShadowRoot} */ (this.getRootNode()).host
			);

			const lines = [
				`Audience: ${area.context.audience} (${this.elementAsString(
					area.context.self
				)})`,
				`Window: ${this.elementAsString(
					area.context.window.document.documentElement
				)}`,
				`Tab: ${this.elementAsString(area.context.tab)}`,
				`Browser: ${this.elementAsString(area.context.browser)}`
			].map((ln) => html("span", {}, ln));

			this.menu.querySelector(".detail").replaceChildren(...lines);
		};

		this._intervals.push(setInterval(render, 1000));
		render();
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

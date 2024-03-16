/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserWebContents extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	/**
	 * The allowed customizable attributes for the web contents
	 */
	static get customizableAttributes() {
		return {
			menu: "component"
		};
	}

	get elements() {
		return {
			topLine: html("div", {
				class: "wc-border-line top"
			}),
			leftLine: html("div", {
				class: "wc-border-line left"
			}),
			rightLine: html("div", {
				class: "wc-border-line right"
			}),
			bottomLine: html("div", {
				class: "wc-border-line bottom"
			})
		};
	}

	get bordersElement() {
		return /** @type {HTMLDivElement} */ (
			this.querySelector(".wc-borders") ||
				html(
					"div",
					{ class: "wc-borders" },
					this.elements.topLine,
					this.elements.leftLine,
					this.elements.rightLine,
					this.elements.bottomLine
				)
		);
	}

	get slotContainerElement() {
		return /** @type {HTMLDivElement} */ (
			this.querySelector(".wc-slot") ||
				html(
					"div",
					{ class: "wc-slot" },
					html("slot", { name: "web-contents" })
				)
		);
	}

	/**
	 * Determines if a node can be appended to this element
	 */
	canAppendChild() {
		return {
			content: (node) => node instanceof BrowserStatusPanel
		};
	}

	/**
	 * Determines which borders need to be shown on the web contents
	 */
	updateBorders() {
		const borders = [];

		const bounds = this.getBoundingClientRect();

		if (bounds.x > 0) {
			borders.push("left");
		}

		if (bounds.x + bounds.width < window.outerWidth) {
			borders.push("right");
		}

		if (bounds.y > 0) {
			borders.push("top");
		}

		if (bounds.y + bounds.height < window.outerHeight) {
			borders.push("bottom");
		}

		this.setAttribute("borders", borders.join(" "));
	}

	/**
	 * The tabpanel connected to this web contents element
	 */
	get tabpanel() {
		return this.slotContainerElement
			.querySelector("slot")
			.assignedElements()[0];
	}

	/**
	 * Handles incoming events to the web contents
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "resize":
				this.updateBorders();
				break;
		}
	}

	connectedCallback() {
		super.connect("web-contents", {});

		this.updateBorders();

		this.appendChild(
			html(
				"div",
				{ class: "wc-container" },
				this.bordersElement,
				this.slotContainerElement
			)
		);

		this.shadowRoot.appendChild(html("slot"));

		this.tabpanel.toggleAttribute("status", this.hasAttribute("status"));

		window.addEventListener("resize", this);
	}

	disconnectedCallback() {
		window.removeEventListener("resize", this);
	}
}

customElements.define("browser-web-contents", BrowserWebContents);

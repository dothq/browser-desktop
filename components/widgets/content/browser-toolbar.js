/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { DotCustomizableUI } = ChromeUtils.importESModule(
	"resource://gre/modules/DotCustomizableUI.sys.mjs"
);

class BrowserToolbar extends MozHTMLElement {
	constructor() {
		super();
	}

	/**
	 * The anatomy of the toolbar's shadow DOM
	 */
	get shadowElements() {
		return {
			slot: /** @type {HTMLSlotElement} */ (
				this.shadowRoot.querySelector("slot") ||
					html("slot", { part: "content" })
			),
			csd: /** @type {BrowserWindowControls} */ (
				this.shadowRoot.querySelector("browser-window-controls") ||
					html("browser-window-controls", { part: "csd" })
			)
		};
	}

	/**
	 * Determines the toolbar's display mode
	 *
	 * `icons` - Only show icons in toolbar buttons
	 *
	 * `text` - Only show text in toolbar buttons
	 *
	 * `icons_text` - Show icons beside text in toolbar buttons
	 */
	get mode() {
		return this.getAttribute("mode");
	}

	/**
	 * Update the toolbar's display mode
	 */
	set mode(newMode) {
		this.setAttribute("mode", newMode);
	}

	/**
	 * The name of this toolbar
	 */
	get name() {
		return this.getAttribute("name");
	}

	/**
	 * Update the toolbar's name
	 */
	set name(newName) {
		this.setAttribute("name", newName);
	}

	/**
	 * Determines whether this toolbar is horizontal
	 */
	get isHorizontal() {
		return this.orientation == "horizontal";
	}

	/**
	 * Determines whether this toolbar is vertical
	 */
	get isVertical() {
		return this.orientation == "vertical";
	}

	/**
	 * The orientation of this toolbar
	 *
	 * @returns {"horizontal" | "vertical"}
	 */
	get orientation() {
		return this.getAttribute("orientation") == "vertical"
			? "vertical"
			: "horizontal";
	}

	/**
	 * Determine whether this toolbar is the initial toolbar in the browser
	 *
	 * We need a way of working out which toolbar is the first in the DOM
	 * so we can display the CSD in the correct location.
	 */
	maybePromoteToolbar() {
		const bounds = this.getBoundingClientRect();

		const isInitial =
			bounds.width > 0 &&
			bounds.height > 0 &&
			!Array.from(document.querySelectorAll("browser-toolbar")).find(
				(tb) => tb.hasAttribute("initial")
			);

		this.toggleAttribute("initial", isInitial);
	}

	/**
	 * Toggles the collapsed state of this toolbar
	 */
	toggleCollapsed() {
		this.toggleAttribute("collapse");
	}

	/**
	 * Handles incoming events
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "change":
				this.onCSDPositionChange(
					/** @type {MediaQueryListEvent} */ (event)
				);
				break;
		}
	}

	/**
	 * Handles changes to the CSD's position
	 * @param {MediaQueryListEvent | MediaQueryList} event
	 */
	onCSDPositionChange(event) {
		const reversed = event.matches;

		if (reversed) {
			this.shadowRoot.prepend(this.shadowElements.csd);
		} else {
			this.shadowRoot.append(this.shadowElements.csd);
		}
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		DotCustomizableUI.initCustomizableArea(this, "toolbar");

		this.attachShadow({ mode: "open" });

		this.shadowRoot.appendChild(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/content/widgets/browser-window-controls.css"
			})
		);

		this.shadowRoot.appendChild(this.shadowElements.slot);
		this.shadowRoot.appendChild(this.shadowElements.csd);

		const { csdReversedMediaQuery } = this.shadowElements.csd;

		csdReversedMediaQuery.addEventListener("change", this);
		this.onCSDPositionChange(csdReversedMediaQuery);

		this.mode = "icons";

		this.addEventListener("contextmenu", (e) => {
			console.log(e);
			/** @type {any} */ (
				document.getElementById("browser-toolbar-menu")
			).openPopupAtScreen(e.screenX, e.screenY);
			/** @type {any} */ (
				document.getElementById("browser-toolbar-menu")
			).target = this;
		});

		this.maybePromoteToolbar();

		const { width, height } = this.getBoundingClientRect();

		// Sets the initial orientation
		this.setAttribute(
			"orientation",
			width > height ? "horizontal" : "vertical"
		);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;
	}
}

customElements.define("browser-toolbar", BrowserToolbar);

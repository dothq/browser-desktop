/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { CommandAudiences } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandAudiences.sys.mjs"
);

class BrowserAddressbar extends BrowserCustomizableArea {
	constructor() {
		super();

		this.resizeObserver = new ResizeObserver(
			this._onResizeMutation.bind(this)
		);
	}

	/**
	 * The customizable components to inherit from when used in this area
	 */
	static get customizableComponents() {
		return {
			button: html("button", { is: "browser-addressbar-button" }),
			input: html("input", { is: "browser-addressbar-input" })
		};
	}

	/**
	 * The context for this addressbar
	 */
	get context() {
		const self = this;

		return {
			self,
			audience: CommandAudiences.ADDRESSBAR,

			get window() {
				return self.ownerGlobal;
			},

			get tab() {
				return self.ownerGlobal.gDot.tabs.selectedTab;
			},

			get browser() {
				return this.tab.linkedBrowser;
			}
		};
	}

	/**
	 * The container where customizable elements will be rendered to
	 */
	get customizableContainer() {
		return /** @type {BrowserCustomizableTemplate} */ (
			this.shadowRoot.querySelector(
				"browser-customizable-template[part=customizable]"
			) || html("browser-customizable-template", { part: "customizable" })
		);
	}

	/**
	 * The main container for the addressbar items
	 */
	get addressbarContainer() {
		return /** @type {HTMLDivElement} */ (
			this.querySelector("browser-addressbar-container") ||
				html("browser-addressbar-container")
		);
	}

	/**
	 * The panel element for this addressbar
	 * @type {BrowserAddressbarPanel}
	 */
	get panel() {
		const existingPanel = this.shadowRoot.querySelector(
			"panel[is=browser-addressbar-panel]"
		);

		if (existingPanel) {
			return /** @type {BrowserAddressbarPanel} */ (existingPanel);
		}

		const newPanel = document.createXULElement("panel", {
			is: "browser-addressbar-panel"
		});

		return /** @type {BrowserAddressbarPanel} */ (newPanel);
	}

	/**
	 * The x position of the addressbar
	 */
	get x() {
		return parseFloat(this.style.getPropertyValue("--addressbar-x"));
	}

	set x(newX) {
		this.style.setProperty("--addressbar-x", newX + "px");
	}

	/**
	 * The y position of the addressbar
	 */
	get y() {
		return parseFloat(this.style.getPropertyValue("--addressbar-y"));
	}

	set y(newY) {
		this.style.setProperty("--addressbar-y", newY + "px");
	}

	/**
	 * The width of the addressbar
	 */
	get width() {
		return parseFloat(this.style.getPropertyValue("--addressbar-width"));
	}

	set width(newWidth) {
		this.style.setProperty("--addressbar-width", newWidth + "px");
	}

	/**
	 * The height of the addressbar
	 */
	get height() {
		return parseFloat(this.style.getPropertyValue("--addressbar-height"));
	}

	set height(newHeight) {
		this.style.setProperty("--addressbar-height", newHeight + "px");
	}

	/**
	 * Fired when the addressbar drawer is open
	 * @param {CustomEvent} event
	 */
	_onDrawerOpen(event) {
		this.panel.openPanel({
			root: this,

			x: this.x,
			y: this.y,

			autopurge: false
		});
	}

	/**
	 * Fired when the addressbar drawer is closed
	 * @param {CustomEvent} event
	 */
	_onDrawerClose(event) {
		this.panel.hidePopup();
	}

	/**
	 * Fired when the addressbar's bounds change
	 */
	_onResizeMutation() {
		const { x, y, width, height } = this.getBoundingClientRect();

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	/**
	 * Handles incoming events to the addressbar
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserAddressbar::DrawerOpen":
				this._onDrawerOpen(/** @type {CustomEvent} */ (event));
				break;
			case "BrowserAddressbar::DrawerClose":
				this._onDrawerClose(/** @type {CustomEvent} */ (event));
				break;
			case "popupshowing":
			case "popuphidden":
				this.addressbarContainer.slot =
					event.type == "popupshowing" ? "panel" : "content";

				break;
		}
	}

	connectedCallback() {
		super.connect("addressbar", {
			orientation: "horizontal",
			styles: ["chrome://dot/content/widgets/browser-addressbar.css"]
		});

		this.shadowRoot.appendChild(html("slot", { name: "content" }));
		this.shadowRoot.appendChild(this.panel);

		this.appendChild(this.addressbarContainer);

		this.resizeObserver.observe(this);

		this.addEventListener("BrowserAddressbar::DrawerOpen", this);
		this.addEventListener("BrowserAddressbar::DrawerClose", this);

		this.addEventListener("popupshowing", this);
		this.addEventListener("popuphidden", this);
	}

	disconnectedCallback() {
		this.removeEventListener("BrowserAddressbar::DrawerOpen", this);
		this.removeEventListener("BrowserAddressbar::DrawerClose", this);

		this.removeEventListener("popupshowing", this);
		this.removeEventListener("popuphidden", this);
	}
}

customElements.define("browser-addressbar", BrowserAddressbar);

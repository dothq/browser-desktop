/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

class MozMenuPopup extends BrowserCustomizableContextMixin(
	MozElements.MozElementMixin(XULPopupElement)
) {
	NOT_DRAGGING = 0;
	DRAG_OVER_BUTTON = -1;
	DRAG_OVER_POPUP = 1;
	AUTOSCROLL_INTERVAL = 25;

	_draggingState = this.NOT_DRAGGING;
	_scrollTimer = 0;

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	/**
	 * The context for this menu popup
	 */
	get context() {
		const self = this;

		return {
			self,
			audience: CommandAudiences.PANEL,

			/** @type {Window} */
			get window() {
				return self.ownerGlobal;
			},

			/** @type {BrowserTab} */
			get tab() {
				return self.ownerGlobal.gDot.tabs.selectedTab;
			},

			/** @type {ChromeBrowser} */
			get browser() {
				return this.tab.linkedBrowser;
			}
		};
	}

	/**
	 * The container element that holds the panel's contents
	 */
	get container() {
		return /** @type {HTMLElement} */ (
			this.shadowRoot.querySelector(".browser-panel-container")
		);
	}

	get scrollBox() {
		return this.shadowRoot.querySelector("arrowscrollbox");
	}

	/**
	 * Fires when the popup starts showing on-screen
	 * @param {Event} event
	 */
	onPopupShowing(event) {
		if (event.target != this) return;

		this._ensureInitialized();

		const animate = this.getAttribute("animate") !== "false";

		if (animate) {
			this.setAttribute("animate", "open");
			this.setAttribute("animating", "true");
		}
	}

	/**
	 * Fires when the popup is fully shown on-screen
	 * @param {Event} event
	 */
	onPopupShown(event) {
		if (event.target != this) return;

		this.removeAttribute("animating");
		this.setAttribute("open", "true");
	}

	/**
	 * Fired when the popup starts hiding
	 * @param {Event} event
	 */
	onPopupHiding(event) {
		if (event.target != this) return;

		const animate = this.getAttribute("animate") !== "false";

		if (animate) {
			this.setAttribute("animate", "cancel");
			this.setAttribute("animating", "");
		}
	}

	onPopupHidden(event) {
		if (event.target != this) return;

		this.removeAttribute("open");

		if (this.getAttribute("animate") !== "false") {
			this.removeAttribute("animating");
		}
	}

	connectedCallback() {
		if (this.delayConnectedCallback() || this.hasConnected) {
			return;
		}

		this.setAttribute("animate", "true");
		this.setAttribute("consumeoutsideclicks", "true");
		this.setAttribute("incontentshell", "false");

		this.addEventListener("popupshowing", this.onPopupShowing.bind(this));
		this.addEventListener("popupshown", this.onPopupShown.bind(this));
		this.addEventListener("popuphiding", this.onPopupHiding.bind(this));
		this.addEventListener("popuphidden", this.onPopupHidden.bind(this));

		this.hasConnected = true;

		if (this.parentElement?.localName == "menulist") {
			this._setUpMenulistPopup();
		}
	}

	_ensureInitialized() {
		if (this.shadowRoot.firstChild) return;

		// Create scrollbox
		const scrollbox = document.createXULElement("arrowscrollbox");

		scrollbox.classList.add("browser-panel-container");
		scrollbox.setAttribute("part", "arrowscrollbox content");
		scrollbox.setAttribute(
			"exportparts",
			"scrollbox: arrowscrollbox-scrollbox"
		);
		scrollbox.setAttribute("orient", "vertical");
		scrollbox.setAttribute("smoothscroll", "false");

		// Create slot
		const slot = document.createElement("slot");
		scrollbox.appendChild(slot);

		// Create menu stylesheet
		const style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = "chrome://dot/skin/menu.css";
		super.shadowRoot.prepend(style);

		// Append all to shadow root
		this.shadowRoot.append(style, scrollbox);

		this._maybeHideMenuIcons();
	}

	_setUpMenulistPopup() {
		// Access shadow root to generate menupoup shadow DOMs. We do generate
		// shadow DOM on popupshowing, but it doesn't work for HTML:selects,
		// which are implemented via menulist elements living in the main process.
		// So make them a special case then.
		this._ensureInitialized();
		this.classList.add("in-menulist");

		this.addEventListener("popupshown", () => {
			// Enable drag scrolling even when the mouse wasn't used. The
			// mousemove handler will remove it if the mouse isn't down.
			this._enableDragScrolling(false);
		});

		this.addEventListener("popuphidden", () => {
			this._draggingState = this.NOT_DRAGGING;
			this._clearScrollTimer();
			// @ts-ignore
			this.releaseCapture();
			// @ts-ignore
			this.scrollBox.scrollbox.scrollTop = 0;
		});

		this.addEventListener(
			"mousedown",
			(/** @type {MouseEvent} */ event) => {
				if (event.button != 0) {
					return;
				}

				if (
					this.state == "open" &&
					// @ts-ignore
					(event.target.localName == "menuitem" ||
						// @ts-ignore
						event.target.localName == "menu" ||
						// @ts-ignore
						event.target.localName == "menucaption")
				) {
					this._enableDragScrolling(true);
				}
			}
		);

		this.addEventListener("mouseup", (/** @type {MouseEvent} */ event) => {
			if (event.button != 0) {
				return;
			}

			this._draggingState = this.NOT_DRAGGING;
			this._clearScrollTimer();
		});

		this.addEventListener(
			"mousemove",
			(/** @type {MouseEvent} */ event) => {
				if (!this._draggingState) {
					return;
				}

				this._clearScrollTimer();

				// If the user released the mouse before the menupopup opens, we will
				// still be capturing, so check that the button is still pressed. If
				// not, release the capture and do nothing else. This also handles if
				// the dropdown was opened via the keyboard.
				if (!(event.buttons & 1)) {
					this._draggingState = this.NOT_DRAGGING;
					// @ts-ignore
					this.releaseCapture();
					return;
				}

				// If dragging outside the top or bottom edge of the menupopup, but
				// within the menupopup area horizontally, scroll the list in that
				// direction. The _draggingState flag is used to ensure that scrolling
				// does not start until the mouse has moved over the menupopup first,
				// preventing scrolling while over the dropdown button.
				let popupRect = this.getOuterScreenRect();
				if (
					event.screenX >= popupRect.left &&
					event.screenX <= popupRect.right
				) {
					if (this._draggingState == this.DRAG_OVER_BUTTON) {
						if (
							event.screenY > popupRect.top &&
							event.screenY < popupRect.bottom
						) {
							this._draggingState = this.DRAG_OVER_POPUP;
						}
					}

					if (
						this._draggingState == this.DRAG_OVER_POPUP &&
						(event.screenY <= popupRect.top ||
							event.screenY >= popupRect.bottom)
					) {
						let scrollAmount =
							event.screenY <= popupRect.top ? -1 : 1;
						// @ts-ignore
						this.scrollBox.scrollByIndex(scrollAmount, true);

						let win = this.ownerGlobal;
						this._scrollTimer = win.setInterval(() => {
							// @ts-ignore
							this.scrollBox.scrollByIndex(scrollAmount, true);
						}, this.AUTOSCROLL_INTERVAL);
					}
				}
			}
		);

		this._menulistPopupIsSetUp = true;
	}

	_maybeHideMenuIcons() {
		const directMenuItemsWithIcon = this.querySelectorAll(
			":scope > menuitem[image]"
		);

		this.toggleAttribute("hideicons", directMenuItemsWithIcon.length <= 0);
	}

	_enableDragScrolling(overItem) {
		if (!this._draggingState) {
			// @ts-ignore
			this.setCaptureAlways();
			this._draggingState = overItem
				? this.DRAG_OVER_POPUP
				: this.DRAG_OVER_BUTTON;
		}
	}

	_clearScrollTimer() {
		if (this._scrollTimer) {
			this.ownerGlobal.clearInterval(this._scrollTimer);
			this._scrollTimer = 0;
		}
	}

	on_DOMMenuItemActive(event) {
		this._maybeHideMenuIcons();

		// Scroll buttons may overlap the active item. In that case, scroll
		// further to stay clear of the buttons.
		if (
			this.parentElement?.localName == "menulist" ||
			!this.scrollBox.hasAttribute("overflowing")
		) {
			return;
		}
		let item = event.target;
		if (item.parentNode != this) {
			return;
		}
		let itemRect = item.getBoundingClientRect();
		// @ts-ignore
		let buttonRect = this.scrollBox._scrollButtonUp.getBoundingClientRect();
		if (buttonRect.bottom > itemRect.top) {
			// @ts-ignore
			this.scrollBox.scrollByPixels(
				itemRect.top - buttonRect.bottom,
				true
			);
		} else {
			buttonRect = /** @type {any} */ (
				this.scrollBox
			)._scrollButtonDown.getBoundingClientRect();
			if (buttonRect.top < itemRect.bottom) {
				// @ts-ignore
				this.scrollBox.scrollByPixels(
					itemRect.bottom - buttonRect.top,
					true
				);
			}
		}
	}
}

customElements.define("menupopup", MozMenuPopup);
MozElements.MozMenuPopup = MozMenuPopup;

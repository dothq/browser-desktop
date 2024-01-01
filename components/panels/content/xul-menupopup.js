/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @ts-nocheck

"use strict";

// This is loaded into all XUL windows. Wrap in a block to prevent
// leaking to window scope.
{
	class MozMenuPopup extends MozElements.MozElementMixin(XULPopupElement) {
		constructor() {
			super();

			this.attachShadow({ mode: "open" });
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

			this.ensureInitialized();
			this.setAttribute("open", "");
		}

		connectedCallback() {
			if (this.delayConnectedCallback() || this.hasConnected) {
				return;
			}

			this.setAttribute("animate", "true");
			this.setAttribute("consumeoutsideclicks", "true");
			this.setAttribute("incontentshell", "false");

			this.addEventListener(
				"popupshowing",
				this.onPopupShowing.bind(this)
			);

			this.hasConnected = true;

			if (this.parentNode?.localName == "menulist") {
				this._setUpMenulistPopup();
			}
		}

		ensureInitialized() {
			if (this.shadowRoot.firstChild) return;

			const style = document.createElement("link");
			style.rel = "stylesheet";
			style.href = "chrome://dot/content/widgets/xul-menupopup.css";

			const scrollbox = document.createXULElement("arrowscrollbox");
			scrollbox.classList.add("browser-panel-container");
			scrollbox.setAttribute("part", "arrowscrollbox content");
			scrollbox.setAttribute(
				"exportparts",
				"scrollbox: arrowscrollbox-scrollbox"
			);
			scrollbox.setAttribute("orient", "vertical");
			scrollbox.setAttribute("smoothscroll", "false");

			const slot = document.createElement("slot");

			scrollbox.appendChild(slot);

			super.shadowRoot.append(style, scrollbox);
		}

		_setUpMenulistPopup() {
			// Access shadow root to generate menupoup shadow DOMs. We do generate
			// shadow DOM on popupshowing, but it doesn't work for HTML:selects,
			// which are implemented via menulist elements living in the main process.
			// So make them a special case then.
			this.ensureInitialized();
			this.classList.add("in-menulist");

			this.addEventListener("popupshown", () => {
				// Enable drag scrolling even when the mouse wasn't used. The
				// mousemove handler will remove it if the mouse isn't down.
				this._enableDragScrolling(false);
			});

			this.addEventListener("popuphidden", () => {
				this._draggingState = this.NOT_DRAGGING;
				this._clearScrollTimer();
				this.releaseCapture();
				this.scrollBox.scrollbox.scrollTop = 0;
			});

			this.addEventListener("mousedown", (event) => {
				if (event.button != 0) {
					return;
				}

				if (
					this.state == "open" &&
					(event.target.localName == "menuitem" ||
						event.target.localName == "menu" ||
						event.target.localName == "menucaption")
				) {
					this._enableDragScrolling(true);
				}
			});

			this.addEventListener("mouseup", (event) => {
				if (event.button != 0) {
					return;
				}

				this._draggingState = this.NOT_DRAGGING;
				this._clearScrollTimer();
			});

			this.addEventListener("mousemove", (event) => {
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
						this.scrollBox.scrollByIndex(scrollAmount, true);

						let win = this.ownerGlobal;
						this._scrollTimer = win.setInterval(() => {
							this.scrollBox.scrollByIndex(scrollAmount, true);
						}, this.AUTOSCROLL_INTERVAL);
					}
				}
			});

			this._menulistPopupIsSetUp = true;
		}

		_enableDragScrolling(overItem) {
			if (!this._draggingState) {
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
			// Scroll buttons may overlap the active item. In that case, scroll
			// further to stay clear of the buttons.
			if (
				this.parentNode?.localName == "menulist" ||
				!this.scrollBox.hasAttribute("overflowing")
			) {
				return;
			}
			let item = event.target;
			if (item.parentNode != this) {
				return;
			}
			let itemRect = item.getBoundingClientRect();
			let buttonRect =
				this.scrollBox._scrollButtonUp.getBoundingClientRect();
			if (buttonRect.bottom > itemRect.top) {
				this.scrollBox.scrollByPixels(
					itemRect.top - buttonRect.bottom,
					true
				);
			} else {
				buttonRect =
					this.scrollBox._scrollButtonDown.getBoundingClientRect();
				if (buttonRect.top < itemRect.bottom) {
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
}

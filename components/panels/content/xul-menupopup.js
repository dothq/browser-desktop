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

		/**
		 * Fires when the popup starts showing on-screen
		 * @param {Event} event
		 */
		onPopupShowing(event) {
			if (event.target != this) return;

			this.ensureInitialized();
		}

		/**
		 * Fires when the popup is showing
		 * @param {Event} event
		 */
		onPopupShown(event) {
			this.setAttribute("open", "");
		}

		/**
		 * Fires when the popup starts being hidden
		 */
		onPopupHiding() {
			this.removeAttribute("open");

			// Remove the panel once all transitions have completed
			if (this.getAttribute("animate") == "true") {
				this.addEventListener(
					"transitionend",
					() => {
						this.hidePopup();
					},
					{
						once: true
					}
				);
			} else {
				this.hidePopup();
			}
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

			this.addEventListener("popupshown", this.onPopupShown.bind(this));

			this.addEventListener("popuphiding", this.onPopupHiding.bind(this));

			this.hasConnected = true;
		}

		ensureInitialized() {
			if (this.shadowRoot.firstChild) return;

			const style = document.createElement("link");
			style.rel = "stylesheet";
			style.href = "chrome://dot/content/widgets/xul-menupopup.css";

			const container = document.createElement("div");
			container.classList.add("browser-panel-container");

			const slot = document.createElement("slot");

			container.appendChild(slot);

			super.shadowRoot.append(style, container);
		}
	}

	customElements.define("menupopup", MozMenuPopup);

	MozElements.MozMenuPopup = MozMenuPopup;
}

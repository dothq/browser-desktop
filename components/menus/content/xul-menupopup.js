/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

class MozMenuPopup extends MozElements.MozElementMixin(XULPopupElement) {
	/**
	 * The scrollbox for the menu popup
	 */
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
		this._maybeHideMenuIcons();

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
			this.setAttribute("animate", "true");
			this.removeAttribute("animating");
		}
	}

	/**
	 * Handles incoming events to the menupopup
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "popupshowing":
				this.onPopupShowing(event);
				break;
			case "popupshown":
				this.onPopupShown(event);
				break;
			case "popuphiding":
				this.onPopupHiding(event);
				break;
			case "popuphidden":
				this.onPopupHidden(event);
				break;
		}
	}

	connectedCallback() {
		if (this.delayConnectedCallback() || this.hasConnected) {
			return;
		}

		this.setAttribute("animate", "true");
		this.setAttribute("consumeoutsideclicks", "true");
		this.setAttribute("incontentshell", "false");

		this.addEventListener("popupshowing", this);
		this.addEventListener("popupshown", this);
		this.addEventListener("popuphiding", this);
		this.addEventListener("popuphidden", this);

		this.hasConnected = true;

		if (this.parentElement?.localName == "menulist") {
			console.log("todo: init menulist");
		}
	}

	/**
	 * Determines whether we should hide menu icons as
	 * there are no menu items with icons
	 */
	_maybeHideMenuIcons() {
		const directMenuItemsWithIcon = this.querySelectorAll(
			":scope > menuitem[image]"
		);

		this.toggleAttribute("hideicons", directMenuItemsWithIcon.length <= 0);
	}

	_ensureInitialized() {
		if (this.scrollBox) return;

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

	disconnectedCallback() {
		this.removeEventListener("popupshowing", this);
		this.removeEventListener("popupshown", this);
		this.removeEventListener("popuphiding", this);
		this.removeEventListener("popuphidden", this);
	}

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}
}

customElements.define("menupopup", MozMenuPopup);
MozElements.MozMenuPopup = MozMenuPopup;

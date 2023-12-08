/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const MozPopupElement = MozElements.MozElementMixin(XULPopupElement);

class BrowserPanel extends MozPopupElement {
	constructor() {
		super();

		this.classList.add("browser-panel");

		this.setAttribute(
			"is",
			customElements.getName(
				/** @type {CustomElementConstructor} */ (this.constructor)
			)
		);
		this.setAttribute("animate", "false");
		this.setAttribute("consumeoutsideclicks", "true");
		this.setAttribute("incontentshell", "false");
		this.setAttribute("ignorekeys", "true");
		this.setAttribute("tooltip", "aHTMLTooltip");
	}

	/**
	 * Arguments supplied to the panel when it opens
	 */
	openArgs = {};

	/**
	 * The container element that holds the panel's contents
	 */
	get container() {
		return /** @type {BrowserPanelArea} */ (
			this.querySelector(".browser-panel-container")
		);
	}

	/**
	 * Fires when the popup starts showing on-screen
	 */
	onPopupShowing() {
		this.setAttribute(
			"panelid",
			customElements.getName(
				/** @type {CustomElementConstructor} */ (
					this.container?.constructor
				)
			)
		);

		Services.els.addSystemEventListener(window, "mousemove", this, true);
		Services.els.addSystemEventListener(window, "click", this, true);
	}

	/**
	 * Fires when the popup starts being hidden
	 */
	onPopupHidden() {
		Services.els.removeSystemEventListener(window, "mousemove", this, true);
		Services.els.removeSystemEventListener(window, "click", this, true);

		// Remove the panel once all transitions have completed
		if (this.getAttribute("animate") == "true") {
			window.addEventListener("transitionend", () => this.remove(), {
				once: true
			});
		} else {
			setTimeout(() => {
				this.remove();
			}, 0);
		}
	}

	/**
	 * Fired when the mouse moves across browser windows
	 * @param {MouseEvent} event
	 */
	onSystemMouseMove(event) {
		const panelBounds = this.getOuterScreenRect();

		const containerBounds = this.container.getBoundingClientRect();
		const outerContainerBounds = window.windowUtils.toScreenRect(
			containerBounds.x,
			containerBounds.y,
			containerBounds.width,
			containerBounds.height
		);

		const mouseBounds = window.windowUtils.toScreenRect(
			/** @type {MouseEvent} */ (event).clientX,
			/** @type {MouseEvent} */ (event).clientY,
			0,
			0
		);

		const lowerX = outerContainerBounds.x;
		const lowerY = outerContainerBounds.y;
		const upperX = lowerX + outerContainerBounds.width;
		const upperY = lowerY + outerContainerBounds.height;

		const lowerPanelX = panelBounds.x;
		const lowerPanelY = panelBounds.y;
		const upperPanelX = lowerPanelX + panelBounds.width;
		const upperPanelY = lowerPanelY + panelBounds.height;

		const insideContainer =
			mouseBounds.x >= lowerX &&
			mouseBounds.x <= upperX &&
			mouseBounds.y >= lowerY &&
			mouseBounds.y <= upperY;

		const insidePanel =
			mouseBounds.x >= lowerPanelX &&
			mouseBounds.x <= upperPanelX &&
			mouseBounds.y >= lowerPanelY &&
			mouseBounds.y <= upperPanelY;

		this.insideMargins = insidePanel && !insideContainer;

		this.style.pointerEvents = this.insideMargins ? "none" : "";
	}

	/**
	 * Hide the popup if it is open. The cancel argument is used as a hint that
	 * the popup is being closed because it has been cancelled, rather than
	 * something being selected within the panel.
	 *
	 * @param {boolean} [cancel] if true, then the popup is being cancelled.
	 * @returns {any}
	 */
	hidePopup(cancel) {
		// If we explicitly disallow autohiding popups, avoid
		// calling the hidePopup method on XULPopupElement
		if (Services.prefs.getBoolPref("ui.popup.disable_autohide", false)) {
			return;
		}

		super.hidePopup(cancel);
	}

	/**
	 * Handles incoming events to the popup
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "popupshowing":
				this.onPopupShowing();
				break;
			case "popuphidden":
				this.onPopupHidden();
				break;
			case "click":
				event.preventDefault();
				event.stopPropagation();

				if (this.insideMargins) {
					this.hidePopup(true);
				}

				break;
			case "mousemove":
				this.onSystemMouseMove(/** @type {MouseEvent} */ (event));
				break;
		}
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.addEventListener("popupshowing", this);
		this.addEventListener("popuphidden", this);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.removeEventListener("popupshowing", this);
		this.removeEventListener("popuphidden", this);
	}
}

customElements.define("browser-panel", BrowserPanel, { extends: "panel" });

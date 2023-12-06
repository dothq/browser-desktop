/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabIcon extends BrowserContextualMixin(HTMLElement) {
	constructor() {
		super();
	}

	get elements() {
		return {
			image: /** @type {HTMLImageElement} */ (
				this.querySelector(".browser-tab-image") ||
					html("img", { class: "browser-tab-image" })
			),
			spinner: /** @type {HTMLDivElement} */ (
				this.querySelector(".browser-tab-spinner") ||
					html("div", { class: "browser-tab-spinner" })
			)
		};
	}

	/**
	 * Handles incoming events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabsCollator::TabAttributeUpdate":
				if (event.detail.tab === this.hostContext.tab) {
					this.updateAttributes(event.detail);
				}
		}
	}

	/**
	 * Updates the attributes with the current context tab's
	 */
	updateAttributes({ tab, attributeName, newValue, oldValue }) {
		switch (attributeName) {
			case "progress":
				this.setAttribute("progress", newValue);
				this.toggleAttribute("progress", tab.hasAttribute("progress"));

				if (!tab.hasAttribute("progress")) {
					this.spinnerAnimation?.pause();
					this.spinnerAnimation = null;

					return;
				}

				if (!oldValue && newValue == "1") {
					this.elements.spinner.style.transform = "";
				}

				this.spinnerAnimation?.pause();
				this.spinnerAnimation = this.createSpinnerAnimation();

				break;
			case "hideicon":
				if (this.host instanceof BrowserRenderedTab) {
					this.setAttribute("hideicon", newValue);
					this.toggleAttribute(
						"hideicon",
						tab.hasAttribute("hideicon")
					);
				}
				break;
			case "pendingicon":
				if (this.host instanceof BrowserRenderedTab) {
					this.setAttribute("pendingicon", newValue);
					this.toggleAttribute(
						"pendingicon",
						tab.hasAttribute("pendingicon")
					);
				}
				break;
			case "icon":
				this.elements.image.src = tab.getAttribute("icon");
				break;
		}
	}

	/**
	 * Creates a new spinner animation
	 */
	createSpinnerAnimation() {
		const progress = parseInt(this.getAttribute("progress"));

		return anime({
			targets: gDot.prefersReducedMotion ? [] : this.elements.spinner,
			rotate: "+=1turn",
			direction: "normal",
			loop: true,
			easing: "linear",
			duration: progress == 2 ? 600 : 1500
		});
	}

	connectedCallback() {
		this.append(this.elements.image, this.elements.spinner);

		window.addEventListener(
			"BrowserTabsCollator::TabAttributeUpdate",
			this
		);

		this.spinnerAnimation = this.createSpinnerAnimation();
		this.spinnerAnimation.pause();

		if (this.hostContext.tab) {
			// @todo: really awful way of doing this
			this.updateAttributes({
				tab: this.hostContext.tab,
				attributeName: "progress",
				newValue: this.hostContext.tab.getAttribute("progress"),
				oldValue: null
			});

			this.updateAttributes({
				tab: this.hostContext.tab,
				attributeName: "hideicon",
				newValue: this.hostContext.tab.getAttribute("hideicon"),
				oldValue: null
			});

			this.updateAttributes({
				tab: this.hostContext.tab,
				attributeName: "pendingicon",
				newValue: this.hostContext.tab.getAttribute("pendingicon"),
				oldValue: null
			});

			this.updateAttributes({
				tab: this.hostContext.tab,
				attributeName: "icon",
				newValue: this.hostContext.tab.getAttribute("icon"),
				oldValue: null
			});
		}
	}

	disconnectedCallback() {
		window.removeEventListener(
			"BrowserTabsCollator::TabAttributeUpdate",
			this
		);
	}
}

customElements.define("browser-tab-icon", BrowserTabIcon);

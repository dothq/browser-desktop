/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabsOverflowButton extends BrowserButton {
	/** @type {"backward"} */
	DIRECTION_BACKWARD = "backward";
	/** @type {"forward"} */
	DIRECTION_FORWARD = "forward";

	/**
	 * The direction to scroll the tabs list
	 */
	get direction() {
		return this.getAttribute("direction") === this.DIRECTION_BACKWARD
			? this.DIRECTION_BACKWARD
			: this.DIRECTION_FORWARD;
	}

	/**
	 * The tabs list element
	 */
	get tabs() {
		return /** @type {BrowserTabsElement} */ (
			/** @type {ShadowRoot} */ (this.getRootNode()).host
		);
	}

	/**
	 * The tabs scroller element
	 */
	get tabScroller() {
		return this.tabs.customizableContainer;
	}

	/**
	 * Determines whether we should be scrolling or not
	 */
	scrolling = false;

	/**
	 * Starts scrolling the tabs list
	 */
	startScrolling() {
		this.scrolling = true;

		const tick = () => {
			this.scroll();

			if (this.scrolling) {
				requestAnimationFrame(tick);
			}
		};

		requestAnimationFrame(tick);
	}

	/**
	 * Scroll once on the tabs list
	 */
	scroll() {
		let { scrollLeft } = this.tabScroller;

		if (this.direction == this.DIRECTION_FORWARD) {
			scrollLeft += 5;
		} else {
			scrollLeft -= 5;
		}

		this.tabScroller.scrollLeft = scrollLeft;
	}

	/**
	 * Stops all scrolling on the tabs list
	 */
	stopScrolling() {
		this.scrolling = false;
	}

	/**
	 * Handles incoming events for the tabs overflow button
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "mousedown":
				this.startScrolling();
				break;
			case "mouseup":
				this.stopScrolling();
				break;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this.classList.add("browser-toolbar-button");
		this.classList.add("browser-tabs-overflow-button");

		this.label =
			this.direction === this.DIRECTION_FORWARD
				? "Scroll right"
				: "Scroll left";
		this.icon =
			this.direction === this.DIRECTION_FORWARD
				? "chevron-right"
				: "chevron-left";

		this.addEventListener("mousedown", this);
		this.addEventListener("mouseup", this);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener("mousedown", this);
		this.removeEventListener("mouseup", this);
	}
}

customElements.define(
	"browser-tabs-overflow-button",
	BrowserTabsOverflowButton,
	{ extends: "button" }
);

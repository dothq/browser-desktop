/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserA11yRing extends MozHTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		this.resizeObserver = new ResizeObserver(
			this.onElementResize.bind(this)
		);

		this.shadowRoot.appendChild(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/content/widgets/browser-a11y-ring.css"
			})
		);
	}

	get x() {
		return parseFloat(this.style.getPropertyValue("--ring-x"));
	}

	set x(newValue) {
		this.style.setProperty("--ring-x", newValue + "px");
	}

	get y() {
		return parseFloat(this.style.getPropertyValue("--ring-y"));
	}

	set y(newValue) {
		this.style.setProperty("--ring-y", newValue + "px");
	}

	get width() {
		return parseFloat(this.style.getPropertyValue("--ring-width"));
	}

	set width(newValue) {
		this.style.setProperty("--ring-width", newValue + "px");
	}

	get height() {
		return parseFloat(this.style.getPropertyValue("--ring-height"));
	}

	set height(newValue) {
		this.style.setProperty("--ring-height", newValue + "px");
	}

	/**
	 * Handles focus change events
	 * @param {CustomEvent<Element>} event
	 */
	handleEvent(event) {
		this.resizeObserver.disconnect();

		this.focusedElement = event.detail;
		this.resizeObserver.observe(this.focusedElement);

		this.onElementResize();
	}

	/**
	 * Fired when the resize observer detects an element's bounds changing
	 */
	onElementResize() {
		const bounds = this.focusedElement.getBoundingClientRect();

		this.x = bounds.x;
		this.y = bounds.y;
		this.width = bounds.width;
		this.height = bounds.height;
	}

	/**
	 * Fired when the window changes activity
	 * @param {Event} event
	 */
	onWindowActivate(event) {
		this.toggleAttribute("inactive", event.type == "deactivate");
	}

	connectedCallback() {
		this.addEventListener("focuschange", this);
		window.addEventListener("activate", this.onWindowActivate.bind(this));
		window.addEventListener("deactivate", this.onWindowActivate.bind(this));
	}

	disconnectedCallback() {
		this.removeEventListener("focuschange", this);
		window.removeEventListener(
			"activate",
			this.onWindowActivate.bind(this)
		);
		window.removeEventListener(
			"deactivate",
			this.onWindowActivate.bind(this)
		);
	}
}

customElements.define("browser-a11y-ring", BrowserA11yRing);

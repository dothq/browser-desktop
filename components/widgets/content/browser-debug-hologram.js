/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserDebugHologram extends HTMLElement {
	/**
	 * Creates a new debug hologram
	 * @param {object} options
	 * @param {string} options.id
	 * @param {string} [options.prefId]
	 * @param {(hologram: BrowserDebugHologram) => Element | Promise<Element>} render
	 */
	static create(options, render) {
		const el = /** @type {BrowserDebugHologram} */ (
			html("browser-debug-hologram")
		);

		el.setAttribute("debugid", options.id);

		if (options.prefId) {
			el.setAttribute("prefid", options.prefId);
		}

		el.doRender = render;

		return el;
	}

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	/** @type {number} */
	debugUpdateInt = null;

	/** @type {Function} */
	doRender = () => {};

	get prefId() {
		return this.getAttribute("prefid");
	}

	_render() {
		const isVisible = this.prefId
			? Services.prefs.getBoolPref(this.prefId, false)
			: false;

		if (isVisible && this.debugUpdateInt == null) {
			this.hidden = false;

			this.debugUpdateInt = setInterval(async () => {
				const promisedElement = await Promise.resolve(
					this.doRender(this)
				);

				this.replaceChildren(promisedElement);
			}, 1);
		} else {
			clearInterval(this.debugUpdateInt);
			this.debugUpdateInt = null;

			this.hidden = true;
			this.replaceChildren();
		}
	}

	connectedCallback() {
		this.shadowRoot.appendChild(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/content/widgets/browser-debug-hologram.css"
			})
		);
		this.shadowRoot.appendChild(html("slot"));

		this._render();

		if (this.prefId) {
			Services.prefs.addObserver(this.prefId, this._render.bind(this));
		}
	}
}

customElements.define("browser-debug-hologram", BrowserDebugHologram);

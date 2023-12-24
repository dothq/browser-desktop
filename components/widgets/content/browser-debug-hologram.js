/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserDebugHologram extends HTMLElement {
	/**
	 * Creates a new debug hologram
	 * @param {object} options
	 * @param {string} options.id
	 * @param {string} [options.prefId]
	 * @param {Function} render
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

	_createStyle() {
		const style = html("style");
		style.textContent = `:host {
            display: flex;
            flex-direction: column;
            background-color: black;
            color: white;
            font-weight: 600;
            font-size: 10px;
            font-family: monospace;
            white-space: nowrap;
        }

        :host([hidden]) {
            display: none !important;
        }

        ::slotted(*) {
            display: flex;
            gap: 4px;
        }
        `;

		return style;
	}

	_render() {
		const isVisible = this.prefId
			? Services.prefs.getBoolPref(this.prefId, false)
			: false;

		console.log(isVisible, this.debugUpdateInt);

		if (isVisible && this.debugUpdateInt == null) {
			this.hidden = false;

			this.debugUpdateInt = setInterval(() => this.doRender(this), 1);
		} else {
			clearInterval(this.debugUpdateInt);
			this.debugUpdateInt = null;

			this.hidden = true;
			this.replaceChildren();
		}
	}

	connectedCallback() {
		this.shadowRoot.appendChild(this._createStyle());
		this.shadowRoot.appendChild(html("slot"));

		this._render();

		if (this.prefId) {
			Services.prefs.addObserver(this.prefId, this._render.bind(this));
		}
	}
}

customElements.define("browser-debug-hologram", BrowserDebugHologram);

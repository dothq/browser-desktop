/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserMultipanelPage extends MozHTMLElement {
	constructor() {
		super();
	}

	/**
	 * The multipanel area element that houses this page
	 */
	get multipanel() {
		return /** @type {BrowserMultipanelArea} */ (
			/** @type {ShadowRoot} */ (this.getRootNode()).host
		);
	}

	/**
	 * Fired when a transition starts on the page
	 */
	_onTransitionStart() {
		this.toggleAttribute("opening", true);
	}

	/**
	 * Fired when a transition ends on the page
	 */
	_onTransitionEnd() {
		this.toggleAttribute("opening", false);
	}

	connectedCallback() {
		this.classList.add("multipanel-page");

		this.addEventListener(
			"transitionstart",
			this._onTransitionStart.bind(this),
			{ once: true }
		);

		this.addEventListener(
			"transitionend",
			this._onTransitionEnd.bind(this),
			{ once: true }
		);

		setInterval(() => {
			this.style.setProperty(
				"--panel-x",
				(this.previousElementSibling
					? this.previousElementSibling.getBoundingClientRect().width
					: 0) + "px"
			);
		}, 1);
	}
}

customElements.define("browser-multipanel-page", BrowserMultipanelPage);

class BrowserMultipanelArea extends BrowserPanelArea {
	constructor() {
		super();
	}

	/**
	 * The mapping of page IDs to page components
	 */
	static get pages() {
		return {};
	}

	_pages = new Map();

	_activePage = null;

	/**
	 * The page that is currently active
	 */
	get activePage() {
		return this._activePage;
	}

	/**
	 * Navigates to a page using its path
	 * @param {string} path
	 * @param {boolean} [animate]
	 */
	async navigate(path, animate = true) {
		const newPage = this._pages.get(path);

		if (!newPage) {
			throw new Error(
				`${this.constructor.name}: No page with the path '${path}'.`
			);
		}

		/** @type {BrowserMultipanelPage} */
		let newPageEl = null;
		if (this.customizableContainer.querySelector(newPage)) {
			newPageEl = this.customizableContainer.querySelector(newPage);
		} else {
			newPageEl = document.createElement(newPage);
			this.customizableContainer.appendChild(newPageEl);
		}

		this._activePage = newPageEl;

		this.customizableContainer.style.pointerEvents = "none";

		const newPageBounds = newPageEl.getBoundingClientRect();

		const animationDuration = 300;

		const cssVariables = {
			scrollX: parseFloat(
				this.customizableContainer.style.getPropertyValue("--scroll-x")
			)
		};

		anime({
			targets: cssVariables,
			scrollX:
				newPageEl.previousElementSibling?.getBoundingClientRect()
					?.width || 0,
			duration: animate ? animationDuration : 0,
			easing: "easeInOutQuad",
			endDelay: 50,
			update: () => {
				console.log(cssVariables);

				this.customizableContainer.style.setProperty(
					"--scroll-x",
					cssVariables.scrollX + "px"
				);
			},
			complete: () => {
				this.customizableContainer.style.pointerEvents = "";
			}
		});
	}

	/**
	 * Initialises the multipanel area
	 */
	_init() {
		const elementName = customElements.getName(
			/** @type {any} */ (this.constructor)
		);

		for (const [path, page] of Object.entries(
			/** @type {typeof BrowserMultipanelArea} */ (this.constructor).pages
		)) {
			const pageElementName = `${elementName}-${path}-page`;

			if (!customElements.get(pageElementName)) {
				try {
					customElements.define(pageElementName, page);
				} catch (e) {
					throw new Error(
						`${this.constructor.name}: Failed to register page '${path}'.\n` +
							e +
							"\n" +
							e.stack || ""
					);
				}
			}

			this._pages.set(path, pageElementName);
		}

		this.navigate("default");

		setInterval(() => {
			if (this._activePage) {
				const bounds = this._activePage?.getBoundingClientRect();

				this.customizableContainer.style.setProperty(
					"--current-panel-width",
					bounds.width + "px"
				);

				this.customizableContainer.style.setProperty(
					"--current-panel-height",
					bounds.height + "px"
				);
			}
		}, 1);
	}

	connectedCallback() {
		super.connectedCallback();

		this.classList.add("multipanel-area");
		this.setAttribute("orientation", "horizontal");

		this._init();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
}

customElements.define("browser-multipanel-area", BrowserMultipanelArea);

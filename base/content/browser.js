/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.defineESModuleGetters(globalThis, {
	DotAppConstants: "resource://gre/modules/DotAppConstants.sys.mjs"
});

var { DotCustomizableUI } = ChromeUtils.importESModule(
	"resource:///modules/DotCustomizableUI.sys.mjs"
);

var { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

var { BrowserTabs } = ChromeUtils.importESModule(
	"resource:///modules/BrowserTabs.sys.mjs"
);

var { BrowserSearch } = ChromeUtils.importESModule(
	"resource:///modules/BrowserSearch.sys.mjs"
);

var { BrowserShortcuts } = ChromeUtils.importESModule(
	"resource:///modules/BrowserShortcuts.sys.mjs"
);

var { NativeTitlebar } = ChromeUtils.importESModule(
	"resource:///modules/NativeTitlebar.sys.mjs"
);

class BrowserApplication extends MozHTMLElement {
	constructor() {
		super();

		this.mutationObserver = new MutationObserver(
			this.observeMutations.bind(this)
		);
		this.intersectionObserver = new IntersectionObserver(
			this.observeToolbarIntersections.bind(this)
		);
	}

	_done = false;

	/** @type {typeof BrowserTabs.prototype} */
	tabs = null;

	/** @type {typeof BrowserSearch.prototype} */
	search = null;

	/** @type {typeof BrowserShortcuts.prototype} */
	shortcuts = null;

	/**
	 * Determines whether the browser session supports multiple processes
	 * @returns {boolean}
	 */
	get isMultiProcess() {
		return window.docShell.QueryInterface(Ci.nsILoadContext).useRemoteTabs;
	}

	/**
	 * Determines whether this browser session uses remote subframes
	 * @returns {boolean}
	 */
	get usesRemoteSubframes() {
		return window.docShell.QueryInterface(Ci.nsILoadContext)
			.useRemoteSubframes;
	}

	/**
	 * Determines whether the current browser window is a popup
	 */
	get isPopupWindow() {
		return (
			document.documentElement.hasAttribute("chromehidden") &&
			document.documentElement.hasAttribute("chromepopup")
		);
	}

	get usesNativeTitlebar() {
		return NativeTitlebar.enabled;
	}

	get prefersReducedMotion() {
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	/**
	 * Obtains an area element for an area ID
	 * @param {string} area
	 * @returns {HTMLElement}
	 */
	getAreaElement(area) {
		if (area == "menubar" || area == "toolbar" || area == "navbar") {
			return /** @type {BrowserToolbar} */ (
				html("browser-toolbar", { slot: area })
			);
		}

		return this.querySelector(`[slot=${area}]`);
	}

	/**
	 * @type {Set<BrowserToolbar>}
	 */
	_toolbars = new Set();

	/**
	 * An index sorted list of BrowserToolbars
	 * @type {BrowserToolbar[]}
	 */
	get toolbars() {
		return Array.from(this._toolbars).sort(
			(a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y
		);
	}

	/**
	 * Locates a toolbar by its name
	 * @param {string} name
	 * @returns {BrowserToolbar | null}
	 */
	getToolbarByName(name) {
		return this.toolbars.find((tb) => tb.name === name);
	}

	_forcingNativeCSD = false;

	/** @type {MutationCallback} */
	observeMutations(mutations) {
		for (const mut of mutations) {
			for (const node of mut.addedNodes) {
				if (
					node instanceof BrowserToolbar &&
					!this._toolbars.has(node)
				) {
					this.intersectionObserver.observe(node);
					this._toolbars.add(node);
				}
			}

			for (const node of mut.removedNodes) {
				if (
					node instanceof BrowserToolbar &&
					this._toolbars.has(node)
				) {
					this.intersectionObserver.unobserve(node);
					this._toolbars.delete(node);
				}
			}
		}
	}

	/** @type {IntersectionObserverCallback} */
	observeToolbarIntersections(intersections) {
		for (const intersection of intersections) {
			if (intersection.target instanceof BrowserToolbar) {
				if (
					intersection.intersectionRatio === 0 ||
					intersection.intersectionRatio === 1
				) {
					this.computeInitialToolbar();
				}
			}
		}
	}

	/**
	 * Recomputes the "initial" toolbar
	 */
	computeInitialToolbar() {
		if (this._forcingNativeCSD && !window.fullScreen) {
			this._forcingNativeCSD = false;
			NativeTitlebar.set(false, false);
		}

		let oldToolbars = [];

		for (const toolbar of this.toolbars) {
			if (toolbar.hasAttribute("initial")) {
				oldToolbars.push(toolbar);
			}
		}

		let foundNewInitial = false;

		for (const toolbar of this.toolbars) {
			const bounds = toolbar.getBoundingClientRect();

			toolbar.setAttribute(
				"orientation",
				bounds.width > bounds.height ? "horizontal" : "vertical"
			);

			// Skip toolbars that are hidden
			if (bounds.width === 0 || bounds.height === 0) {
				continue;
			}

			// Once we have found a suitable toolbar to
			// make initial, return early, we're done here
			toolbar.toggleAttribute("initial", true);
			oldToolbars.forEach((t) => t.removeAttribute("initial"));
			gDot.style.setProperty(
				"--browser-csd-height",
				toolbar.getBoundingClientRect().height + "px"
			);
			gDot.style.setProperty(
				"--browser-csd-width",
				gDot.shadowRoot
					.querySelector("browser-window-controls")
					.getBoundingClientRect().width + "px"
			);

			foundNewInitial = true;
			return;
		}

		// If we weren't able to find a single toolbar to make initial
		// We will need to show the window controls over the top of everything
		//
		// If we're in fullscreen mode, we can skip this as we're expecting chrome
		// to be hidden.
		if (!foundNewInitial && !window.fullScreen) {
			this._forcingNativeCSD = true;
			NativeTitlebar.set(true, false);
		}
	}

	/**
	 * Fetches a slot from the Shadow DOM by name
	 * @param {string} name
	 */
	getSlot(name) {
		return this.shadowRoot.querySelector(`slot[name=${name}]`);
	}

	/**
	 *
	 * @param {string} name
	 * @param {number} [index] - The index to move the slot to, use undefined to move to end
	 */
	moveSlotTo(name, index) {
		const slot = this.getSlot(name);

		if (typeof index == "undefined") {
			this.shadowRoot.append(slot);
			this.computeInitialToolbar();
			return;
		}

		if (index <= 0) {
			this.shadowRoot.prepend(slot);
			this.computeInitialToolbar();
			return;
		}

		const slots = Array.from(this.shadowRoot.childNodes).filter(
			(n) => /** @type {Element} */ (n).tagName == "slot" && n !== slot
		);

		if (index >= slots.length) {
			this.shadowRoot.append(slot);
			this.computeInitialToolbar();
			return;
		}

		const beforeSlot = slots[index];
		console.log("beforeSlot", beforeSlot);

		this.shadowRoot.insertBefore(slot, beforeSlot);
		this.computeInitialToolbar();
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.attachShadow({ mode: "open" });

		const areas = ["menubar", "toolbar", "navbar", "web-contents"];
		for (const area of areas) {
			if (!this.getSlot(area)) {
				this.shadowRoot.appendChild(
					html("slot", { name: area, part: area })
				);
			}

			const areaElement = this.getAreaElement(area);

			if (area == "web-contents") {
				areaElement.hidden = false;
			}

			this.append(areaElement);
		}

		for (const node of this.childNodes) {
			if (node instanceof BrowserToolbar && !this._toolbars.has(node)) {
				this.intersectionObserver.observe(node);
				this._toolbars.add(node);
			}
		}

		this.shadowRoot.appendChild(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/skin/browser.css"
			})
		);

		this.mutationObserver.observe(this, {
			childList: true,
			subtree: true
		});
	}

	/**
	 * Initialises the browser and its components
	 */
	init() {
		if (gDot._done) {
			throw new Error("Browser cannot be initialized twice!");
		}

		gDot.tabs = new BrowserTabs(window);
		gDot.search = new BrowserSearch(window);
		gDot.shortcuts = new BrowserShortcuts(window);

		DotCustomizableUI.init(window);

		gDotRoutines.init();

		// Listens for changes to the reduced motion preference
		window
			.matchMedia("(prefers-reduced-motion: reduce)")
			.addEventListener("change", (e) => {
				document.documentElement.toggleAttribute(
					"reducedmotion",
					e.matches
				);
			});

		gDot._done = true;
	}
}

customElements.define("browser-application", BrowserApplication);

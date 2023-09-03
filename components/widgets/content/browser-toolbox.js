/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserToolbox extends MozHTMLElement {
	constructor() {
		super();

		this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
		this.intersectionObserver = new IntersectionObserver(
			this.observeToolbarIntersections.bind(this)
		);
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
				if (node instanceof BrowserToolbar && !this._toolbars.has(node)) {
					this.intersectionObserver.observe(node);
					this._toolbars.add(node);
				}
			}

			for (const node of mut.removedNodes) {
				if (node instanceof BrowserToolbar && this._toolbars.has(node)) {
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
				if (intersection.intersectionRatio === 0 || intersection.intersectionRatio === 1) {
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

		for (const toolbar of this.toolbars) {
			toolbar.removeAttribute("initial");
		}

		let foundNewInitial = false;

		for (const toolbar of this.toolbars) {
			const bounds = toolbar.getBoundingClientRect();

			// Skip toolbars that are hidden
			if (bounds.width === 0 || bounds.height === 0) {
				continue;
			}

			// Once we have found a suitable toolbar to
			// make initial, return early, we're done here
			toolbar.toggleAttribute("initial", true);
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

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		for (const node of this.childNodes) {
			if (node instanceof BrowserToolbar && !this._toolbars.has(node)) {
				this.intersectionObserver.observe(node);
				this._toolbars.add(node);
			}
		}

		this.mutationObserver.observe(this, {
			childList: true,
			subtree: true
		});
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;
	}
}

customElements.define("browser-toolbox", BrowserToolbox);

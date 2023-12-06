/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabsElement extends BrowserCustomizableArea {
	kTabMaxWidthPref = "dot.tabs.max-width";
	kTabMinWidthPref = "dot.tabs.min-width";

	constructor() {
		super();

		// The tab template part to use for all tab elements within the tabs strip
		this.shadowRoot.appendChild(this.tabTemplate);
	}

	/**
	 * The allowed customizable attributes for the toolbar
	 */
	static get customizableAttributes() {
		return {
			width: "flexibleDimension",
			height: "flexibleDimension",

			background: "namedColor",

			mode: "mode"
		};
	}

	/**
	 * The currently selected tab
	 */
	get selectedTab() {
		return this.getRenderedTabByInternalId(gDot.tabs.selectedTab.id);
	}

	/**
	 * All tabs in this tabs element
	 * @returns {BrowserRenderedTab[]}
	 */
	get tabs() {
		return Array.from(
			this.customizableContainer.querySelectorAll(
				"browser-tab:not([closing]):not([opening])"
			)
		);
	}

	/**
	 * The tab template element to use for all tabs
	 */
	get tabTemplate() {
		return /** @type {BrowserCustomizableTemplate} */ (
			this.shadowRoot.querySelector(
				"browser-customizable-template[part=tab]"
			) || html("browser-customizable-template", { part: "tab" })
		);
	}

	/**
	 * Fired when we have incoming events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		const tab = event.detail ? event.detail.tab : null;

		switch (event.type) {
			case "BrowserTabsCollator::TabAdded":
				this._onTabAdded(tab, event.detail);
				break;
			case "BrowserTabsCollator::TabRemoved":
				this._onTabRemoved(tab, event.detail);
				break;
			case "BrowserTabsCollator::TabAttributeUpdate":
				const { attributeName, oldValue, newValue } = event.detail;

				this._onTabAttributeUpdated(
					tab,
					attributeName,
					oldValue,
					newValue
				);
				break;
			case "load":
				this._init();
				break;
			case "resize":
			case "sizemodechange":
				this._computeTabSizes();
				break;
		}
	}

	/**
	 * Gets the associated rendered tab for an internal tab
	 * @param {string} id
	 * @returns {BrowserRenderedTab | null}
	 */
	getRenderedTabByInternalId(id) {
		return this.customizableContainer.querySelector(`[tab=${id}]`);
	}

	/**
	 * Fired when a new tab is added to the tabs collator
	 * @param {BrowserTab} tab
	 * @param {object} [options]
	 * @param {boolean} [options.animate] - Whether we should start animate in for this tab
	 */
	_onTabAdded(tab, options) {
		const renderedTab = /** @type {BrowserRenderedTab} */ (
			document.createElement("browser-tab")
		);
		renderedTab.customizableContainer.appendChild(
			this.tabTemplate.content.cloneNode(true)
		);
		renderedTab.linkedTab = tab;
		this.customizableContainer.appendChild(renderedTab);

		if (options && options.animate) {
			renderedTab.animateIn().then(() => {
				if (
					this.scrollWidth > this.clientWidth ||
					this.scrollHeight > this.clientHeight
				) {
					console.log("scrolling");
					renderedTab.scrollIntoView({
						behavior: "smooth",
						block: "end",
						inline: "nearest"
					});
				}
			});
		} else {
			renderedTab.width = gDot.tabs.tabMaxWidth;
			renderedTab.hidden = false;
		}

		for (const attr of Array.from(tab.attributes)) {
			this._onTabAttributeUpdated(tab, attr.name, null, attr.value);
		}

		this._computeTabSizes();
	}

	/**
	 * Fired when an existing tab is removed from the tabs collator
	 * @param {BrowserTab} tab
	 * @param {object} [options]
	 * @param {boolean} [options.animate] - Whether we should start animate in for this tab
	 */
	_onTabRemoved(tab, options) {
		const renderedTab = this.getRenderedTabByInternalId(tab.id);

		if (renderedTab) {
			renderedTab.animateOut().then(() => {
				renderedTab.remove();
			});
		}
	}

	/**
	 * Fired when an attribute on an existing tab is modified
	 * @param {BrowserTab} tab
	 * @param {string} attributeName
	 * @param {string} oldValue
	 * @param {string} newValue
	 */
	_onTabAttributeUpdated(tab, attributeName, oldValue, newValue) {
		const renderedTab = this.getRenderedTabByInternalId(tab.id);

		if (renderedTab) {
			renderedTab.internalTabAttributeChangedCallback(
				attributeName,
				oldValue,
				newValue
			);

			this._computeTabSizes();
		}
	}

	/**
	 * The current tab max width value
	 */
	get tabMaxWidth() {
		const val = parseInt(this.style.getPropertyValue("--tab-max-width"));

		return isNaN(val) ? gDot.tabs.tabMaxWidth : val;
	}

	/**
	 * The current tab min width value
	 */
	get tabMinWidth() {
		const val = parseInt(this.style.getPropertyValue("--tab-min-width"));

		return isNaN(val) ? gDot.tabs.tabMinWidth : val;
	}

	/**
	 * The actual maximum width of a tab
	 */
	get actualTabMaxWidth() {
		const tabsToCheck = this.tabs.map(
			(t) => t.getBoundingClientRect().width
		);

		const maxWidth = Math.max(...tabsToCheck);

		console.log("actualTabMaxWidth", maxWidth);

		return tabsToCheck && tabsToCheck.length && maxWidth
			? maxWidth
			: gDot.tabs.tabMaxWidth;
	}

	/**
	 * Recomputes the tab sizes
	 */
	_computeTabSizes() {
		// Tab widths

		const { tabMaxWidth, tabMinWidth } = gDot.tabs;

		this.style.setProperty("--tab-max-width", this.tabMaxWidth + "px");
		this.style.setProperty("--tab-min-width", this.tabMinWidth + "px");
	}

	/**
	 * The amount that should be subtracted from each tab's max width
	 */
	_tabMaxWidthSubtrahend = 0;

	/**
	 * Handles incoming preference updates
	 * @param {nsIPrefBranch} subject
	 * @param {string} topic
	 * @param {string} data
	 */
	_observePrefs(subject, topic, data) {
		switch (data) {
			case this.kTabMaxWidthPref:
			case this.kTabMinWidthPref:
				this._computeTabSizes();
				break;
		}
	}

	canAppendChild(node, part) {
		// We want to prevent nodes being appended to anything but the tab part
		return part === "tab";
	}

	_init() {
		this._computeTabSizes();

		for (const tab of gDot.tabs.list) {
			this._onTabAdded(tab, { animate: false });
		}

		window.addEventListener("BrowserTabsCollator::TabAdded", this);
		window.addEventListener("BrowserTabsCollator::TabRemoved", this);
		window.addEventListener("resize", this);
		window.addEventListener("sizemodechange", this);

		Services.prefs.addObserver(
			this.kTabMaxWidthPref,
			this._observePrefs.bind(this)
		);

		Services.prefs.addObserver(
			this.kTabMinWidthPref,
			this._observePrefs.bind(this)
		);
	}

	connectedCallback() {
		super.connect("tabs");

		window.addEventListener(
			"BrowserTabsCollator::TabAttributeUpdate",
			this
		);

		try {
			this._init();
		} catch (e) {
			window.addEventListener("load", this, { once: true });
		}
	}

	disconnectedCallback() {
		window.removeEventListener("BrowserTabsCollator::TabAdded", this);
		window.removeEventListener("BrowserTabsCollator::TabRemoved", this);
		window.removeEventListener(
			"BrowserTabsCollator::TabAttributeUpdate",
			this
		);

		window.removeEventListener("resize", this);
		window.removeEventListener("sizemodechange", this);
	}
}

customElements.define("browser-tabs", BrowserTabsElement);

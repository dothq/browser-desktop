/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const kTabMaxWidthPref = "dot.tabs.max-width";

class BrowserTabsElement extends MozHTMLElement {
	constructor() {
		super();
	}

	/**
	 * The currently selected tab
	 */
	get selectedTab() {
		return this.getRenderedTabByInternalId(gDot.tabs.selectedTab.id);
	}

	/**
	 * Fired when we have incoming events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		const tab = event.detail ? event.detail.tab : null;

		switch (event.type) {
			case "BrowserTabsCollator::TabAdded":
				this._onTabAdded(tab);
				break;
			case "BrowserTabsCollator::TabRemoved":
				this._onTabRemoved(tab);
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
		}
	}

	/**
	 * Gets the associated rendered tab for an internal tab
	 * @param {string} id
	 * @returns {BrowserRenderedTab | null}
	 */
	getRenderedTabByInternalId(id) {
		return this.querySelector(`[tab=${id}]`);
	}

	/**
	 * Fired when a new tab is added to the tabs collator
	 * @param {BrowserTab} tab
	 */
	_onTabAdded(tab) {
		const renderedTab = /** @type {BrowserRenderedTab} */ (
			document.createElement("browser-tab")
		);
		renderedTab.linkedTab = tab;
		this.appendChild(renderedTab);

		for (const attr of Array.from(tab.attributes)) {
			this._onTabAttributeUpdated(tab, attr.name, null, attr.value);
		}
	}

	/**
	 * Fired when an existing tab is removed from the tabs collator
	 * @param {BrowserTab} tab
	 */
	_onTabRemoved(tab) {
		const renderedTab = this.getRenderedTabByInternalId(tab.id);

		if (renderedTab) {
			renderedTab.remove();
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
		}
	}

	/**
	 * Updates the tab max width property
	 */
	_updateTabMaxWidth() {
		this.style.setProperty("--tab-max-width", `${gDot.tabs.tabMaxWidth}px`);
	}

	/**
	 * Handles incoming preference updates
	 * @param {nsIPrefBranch} subject
	 * @param {string} topic
	 * @param {string} data
	 */
	_observePrefs(subject, topic, data) {
		switch (data) {
			case kTabMaxWidthPref:
				this._updateTabMaxWidth();
				break;
		}
	}

	_init() {
		for (const tab of gDot.tabs.list) {
			this._onTabAdded(tab);
		}

		window.addEventListener("BrowserTabsCollator::TabAdded", this);
		window.addEventListener("BrowserTabsCollator::TabRemoved", this);

		Services.prefs.addObserver(
			kTabMaxWidthPref,
			this._observePrefs.bind(this)
		);

		this._updateTabMaxWidth();
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

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
		if (this.delayConnectedCallback()) return;

		window.removeEventListener("BrowserTabsCollator::TabAdded", this);
		window.removeEventListener("BrowserTabsCollator::TabRemoved", this);
		window.removeEventListener(
			"BrowserTabsCollator::TabAttributeUpdate",
			this
		);
	}
}

customElements.define("browser-tabs", BrowserTabsElement);

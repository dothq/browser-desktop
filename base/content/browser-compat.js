/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * browser-compat is used as a compatibility layer to translate Dot APIs to the original FF/Gecko APIs
 *
 * When building Dot Browser, we eventually need to use existing code built by Mozilla, and we don't really
 * want to move code into the Dot tree that could easily be changed upstream.
 *
 * For this reason, it's easier for us to create a compatibility layer between our APIs and the Mozilla APIs,
 * to avoid breaking these important scripts.
 *
 * **You shouldn't use this in Dot code directly! This is purely intended to preserve the functionality
 * of existing Mozilla modules and scripts, to maintain compatibility.**
 */

var gBrowser = {
	get tabs() {
		return gDot?.tabs?.list || [];
	},

	get visibleTabs() {
		return gDot?.tabs?.visibleTabs || [];
	},

	get browsers() {
		return gDot?.tabs?.list?.map((t) => t.linkedBrowser) || [];
	},

	get currentURI() {
		if (
			!gDot?.tabs ||
			!gDot.tabs._isWebContentsBrowserElement(this.selectedBrowser)
		) {
			return Services.io.newURI("about:blank");
		}

		return /** @type {ChromeBrowser} */ (this.selectedBrowser).currentURI;
	},

	get contentPrincipal() {
		if (
			!gDot?.tabs ||
			!gDot.tabs._isWebContentsBrowserElement(this.selectedBrowser)
		) {
			return null;
		}

		return /** @type {ChromeBrowser} */ (this.selectedBrowser)
			.contentPrincipal;
	},

	get selectedTab() {
		return gDot?.tabs?.selectedTab || null;
	},

	set selectedTab(newTab) {
		gDot.tabs.selectedTab = newTab;
	},

	get selectedBrowser() {
		return this.selectedTab.webContents;
	},

	get ownerGlobal() {
		return window;
	},

	get ownerDocument() {
		return document;
	},

	_tabContainerEl: document.createElement("div"),

	get tabContainer() {
		return this._tabContainerEl;
	},

	/**
	 * @param {ChromeBrowser} browser
	 * @returns {BrowserTab}
	 */
	getTabForBrowser(browser) {
		return gDot.tabs.getTabForWebContents(browser);
	},

	/**
	 * @param {BrowserTab} tab
	 * @returns {ChromeBrowser}
	 */
	getBrowserForTab(tab) {
		return tab.linkedBrowser;
	},

	/**
	 * @param {ChromeBrowser} browser
	 * @returns {HTMLElement}
	 */
	getBrowserContainer(browser) {
		return this.getPanel(browser).querySelector("browser-web-container");
	},

	/**
	 * @param {ChromeBrowser} browser
	 * @returns {HTMLElement}
	 */
	getPanel(browser) {
		const tab = gDot.tabs.getTabForWebContents(browser);
		return tab.webContentsPanel;
	},

	/**
	 * @param {string} uri
	 * @param {LoadURIOptions} options
	 * @returns {HTMLElement}
	 */
	addTab(uri, options) {
		return gDot.tabs.createTab({
			...options,
			uri
		});
	},

	/**
	 * @param {BrowserTab} tab
	 * @param {boolean} [forceDiscard]
	 */
	discardBrowser(tab, forceDiscard) {
		tab.maybeClose();
	},

	/**
	 * @param {BrowserTab} tab
	 * @param {Record<string, any>} options
	 */
	removeTab(tab, options) {
		tab.maybeClose();
	},

	removeTabsProgressListener(listener) {},

	_initCompat() {}
};

window.addEventListener("load", gBrowser._initCompat.bind(this), {
	once: true
});

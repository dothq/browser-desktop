/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { TabIdentityHandler } = ChromeUtils.importESModule(
	"resource://gre/modules/TabIdentityHandler.sys.mjs"
);

/**
 * Compatibility layer over Dot tabs for Mozilla APIs
 *
 * This shouldn't be modified, unless it improves coverage for existing APIs.
 * New features should be put into BrowserTab instead.
 *
 * @param {BrowserTab} tab
 */
function injectCompat(tab) {
	const { BrowserCompatibility: compat } = ChromeUtils.importESModule(
		"resource://gre/modules/BrowserCompatibility.sys.mjs"
	);

	compat.defineGetter(tab, "linkedBrowser", () => tab.webContents);
}

const kDefaultTabIcon = "chrome://dot/skin/globe.svg";

const kDefaultTabTitles = {
	"about:blank": "New Tab",
	"about:home": "New Tab",
	"about:newtab": "New Tab"
};

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").ChromeBrowser} ChromeBrowser
 */

class BrowserTab extends MozElements.MozTab {
	TAB_PROGRESS_NONE = 0;
	TAB_PROGRESS_BUSY = 1;
	TAB_PROGRESS_TRANSIT = 2;

	constructor() {
		super();

		injectCompat(this);
	}

	static get observedAttributes() {
		return ["label", "icon"];
	}

	_openerTab = null;

	/**
	 * The opener tab is the tab that opened this current tab
	 * @type {false | BrowserTab}
	 */
	get openerTab() {
		if (!this._openerTab) return false;

		const tabId = this._openerTab.id;
		const tab = gDot.tabs.getTabByTabId(tabId);

		if (!tab) return false;
		return this._openerTab;
	}

	/**
	 * The tab's contents
	 * This can either be a MozBrowser or any other element.
	 * @type {ChromeBrowser | Element}
	 */
	webContents = null;

	/**
	 * The webContents' unique numerical ID
	 *
	 * The ID can either be from a MozBrowser or from
	 * any element attached to the Tab as webContents.
	 * @returns {number}
	 */
	get webContentsId() {
		if (
			this.webContents.constructor.name === "MozBrowser" &&
			// @ts-ignore
			this.webContents.browserId
		) {
			// @ts-ignore
			return this.webContents.browserId;
		}

		return parseInt(this.webContents.id);
	}

	/**
	 * The linked browser of this tab
	 *
	 * @returns {ChromeBrowser}
	 */
	get linkedBrowser() {
		if (!gDot.tabs._isWebContentsBrowserElement(this.webContents)) {
			return document.createXULElement("browser");
		}

		return /** @type {ChromeBrowser} */ (this.webContents);
	}

	_pinned = false;
	get pinned() {
		return this._pinned;
	}

	set pinned(val) {
		this._pinned = val;
		this.toggleAttribute("pinned", val);
	}

	/**
	 * Determines whether the tab is considered visible or not
	 */
	get visible() {
		return !this.hidden || this.hasAttribute("closing");
	}

	/**
	 * Updates the visibility state of the tab
	 */
	set visible(val) {
		this.hidden = !val;
	}

	/**
	 * Determines the tab's loading progress state
	 */
	get progress() {
		return (
			parseInt(this.getAttribute("progress")) || this.TAB_PROGRESS_NONE
		);
	}

	/**
	 * Updates the tab's loading progress state
	 * @property {number} val
	 */
	set progress(val) {
		if (!val) {
			this.removeAttribute("progress");
			return;
		}

		this.setAttribute("progress", val.toString());
	}

	initialDragX = 0;

	/**
	 * Determines the tab's dragging state
	 */
	get dragging() {
		return this.hasAttribute("dragging");
	}

	_progressPercent = 0;

	/**
	 * The percentage of content loaded for tab
	 */
	get progressPercent() {
		return this._progressPercent;
	}

	set progressPercent(val) {
		this.setAttribute("progresspercent", `${val}%`);
		this._progressPercent = val;
	}

	/**
	 * Determines whether the tab is selected or not
	 */
	get selected() {
		return gDot.tabs.selectedTab.id === this.id;
	}

	/**
	 * Makes this tab the selectedTab
	 */
	select() {
		gDot.tabs.selectedTab = this;
	}

	/**
	 * The ID of the userContext (container) to use
	 */
	userContextId = null;

	/**
	 * The initial URI used to load this tab
	 *
	 * This is typically used once when we are creating the
	 * tab so we can supply a useful title to the tab on creation.
	 *
	 * @type {nsIURI}
	 */
	_initialURI = null;

	get permanentKey() {
		// @ts-ignore
		return this.webContents.permanentKey;
	}

	_webContentsPanelId = null;

	/**
	 * The webContent's panel element
	 *
	 * The panel element is responsible for containing
	 * the browser/webContents within the UI.
	 */
	get webContentsPanel() {
		return document.getElementById(this._webContentsPanelId);
	}

	/**
	 * The index of the tab in relation to the tabs list
	 */
	get index() {
		return gDot.tabs.list.findIndex((t) => t === this);
	}

	/**
	 * The tab's modal box
	 *
	 * The modal box is responsible for housing any
	 * tab modals or popups in the browser frame.
	 *
	 * @type {BrowserModals}
	 */
	get modalBox() {
		return this.webContents.parentElement.querySelector("browser-modals");
	}

	_siteIdentity = null;

	/**
	 * The tab's identity and security manager
	 *
	 * @type {typeof TabIdentityHandler.prototype}
	 */
	get siteIdentity() {
		return this._siteIdentity;
	}

	/**
	 * The current URI of the tab
	 * @returns {nsIURI}
	 */
	get currentURI() {
		if (!gDot.tabs._isWebContentsBrowserElement(this.webContents)) {
			return Services.io.newURI("about:blank");
		}

		return /** @type {ChromeBrowser} */ (this.webContents).currentURI;
	}

	/**
	 * Register any event listeners that require webContents to be setup and ready
	 *
	 * Putting these into connectedCallback can't guarantee it will work, as
	 * webContents could get added to the tab too late.
	 */
	registerEventListeners() {
		console.log("initted event listeners for", this.id);

		this.webContents.addEventListener("pagetitlechanged", this);

		// Ensure site identity is initialised
		this._siteIdentity = new TabIdentityHandler(this);
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		if (!this.getAttribute("label")) {
			console.log("No label yet!", this._initialURI?.spec);
			this.updateLabel(this._initialURI?.spec || "");
		}

		if (!this.getAttribute("icon")) {
			console.log("NO ICON YET");
			this.updateIcon(kDefaultTabIcon, true);
		}

		window.addEventListener("BrowserTabs::TabSelect", this);
		window.addEventListener("BrowserTabs::BrowserStateChange", this);
		window.addEventListener("BrowserTabs::BrowserLocationChange", this);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		window.removeEventListener("BrowserTabs::TabSelect", this);
		window.removeEventListener("BrowserTabs::BrowserStateChange", this);
		window.removeEventListener("BrowserTabs::BrowserLocationChange", this);

		this.webContents.removeEventListener("pagetitlechanged", this);
	}

	/**
	 * Handles listened to events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::TabSelect":
				this._onTabSelected(event);
				break;
			case "pagetitlechanged":
				if (gDot.tabs._isWebContentsBrowserElement(this.webContents)) {
					this.updateLabel(
						/** @type {ChromeBrowser} */ (this.webContents)
							.contentTitle
					);
				}

				break;
		}
	}

	/**
	 * Updates the tab's label
	 * @param {string} newLabel
	 */
	updateLabel(newLabel) {
		let label = newLabel;

		// If this tab is just initialising, we will want to use a neutral title
		if (!this.webContents && !newLabel) {
			label = "Untitled";
		}

		if (kDefaultTabTitles[label]) {
			label = kDefaultTabTitles[label];
		}

		try {
			if (label.trim().length <= 0) {
				label = /** @type {ChromeBrowser} */ (this.webContents)
					.contentTitle;
			}

			if (label.trim().length <= 0) {
				label = /** @type {ChromeBrowser} */ (this.webContents)
					.currentURI.spec;

				if (kDefaultTabTitles[label]) {
					label = kDefaultTabTitles[label];
				}
			}
		} catch (e) {
			console.error("Unable to use currentURI for tab title:", e);
			label = "Untitled";
		}

		try {
			const uri = Services.io.newURI(label);

			if (uri && uri.spec) {
				// trims protocols and www. from label
				label = uri.spec.replace(/^[^:]+:\/\/(?:www\.)?/, "");
			}
		} catch (e) {}

		if (label.length > 500) {
			label = `${label.substring(0, 500)}\u2026`;
		}

		this.setAttribute("label", label);
		this.setAttribute("title", label);
		console.log("Updated title to", label);

		// We need to make sure gDot.tabs is initialised
		// before we start updating the window title
		if (gDot.tabs && this.selected) {
			gDot.tabs.shouldUpdateWindowTitle();
		}

		const evt = new CustomEvent("BrowserTabs::BrowserTitleChanged", {
			detail: { tab: this, title: label }
		});

		window.dispatchEvent(evt);
	}

	/**
	 * Updates the tab's icon
	 * @param {string} newIconURI
	 */
	updateIcon(newIconURI, initial = false) {
		let iconURI = newIconURI;

		if (!newIconURI) {
			try {
				const uri = this._initialURI?.spec || this.currentURI.spec;

				iconURI = BrowserTabsUtils.INTERNAL_PAGES[uri].icon;
			} catch (e) {
				iconURI = kDefaultTabIcon;
			}
		}

		this.setAttribute("icon", iconURI);

		const shouldHideIcon =
			(!iconURI.length || iconURI == kDefaultTabIcon) && !initial;

		if (shouldHideIcon) {
			this.setAttribute("hideicon", "true");
		} else {
			this.removeAttribute("hideicon");
		}

		if (
			this.webContents &&
			gDot.tabs._isWebContentsBrowserElement(this.webContents)
		) {
			/** @type {ChromeBrowser} */ (this.webContents).mIconURL = iconURI;
		}
	}

	/**
	 * Clears the tab's icon
	 */
	clearIcon() {
		this.updateIcon(null);
	}

	/**
	 * Closes the tab if safe
	 */
	maybeClose() {
		if (window.closed) return;

		this.toggleAttribute("closing", true);

		let adoptingTab = gDot.tabs.selectedTab;

		// If the tab that's closing is the selected tab, find a replacement
		if (this.selected) {
			console.log("selected");

			if (this.openerTab && this.openerTab.visible) {
				console.log("has opener tab");
				adoptingTab = this.openerTab;
			}

			console.log(this.index, gDot.tabs.visibleTabs.length);

			const nextTab = gDot.tabs.visibleTabs[this.index + 1];
			const prevTab = gDot.tabs.visibleTabs[this.index - 1];

			let newAdoptingTab = nextTab;

			// If we're the last tab, find one before it
			if (this.index >= gDot.tabs.visibleTabs.length - 1) {
				newAdoptingTab = prevTab;
			} else if (this.index == 0) {
				// If we're the first tab, find one after it
				newAdoptingTab = nextTab;
			}

			// Check if the new tab is actually visible before confirming the adopting tab
			if (newAdoptingTab && newAdoptingTab.visible) {
				adoptingTab = newAdoptingTab;
			}
		}

		if (adoptingTab && adoptingTab.visible) {
			adoptingTab.select();
		}

		gDot.tabs._discardTab(this);

		// This is needed to recompute any attributes on the tabs, post-tab-closure
		gDot.tabs.selectedTab = gDot.tabs.selectedTab;
	}

	/**
	 * Fired when a tab is selected
	 * @param {CustomEvent} event
	 */
	_onTabSelected(event) {
		/** @type {BrowserTab} */
		const tab = event.detail;

		this.toggleAttribute("selected", tab.id === this.id);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnectedAndReady) return;

		switch (name) {
			case "label":
				if (newValue !== oldValue) {
					this.updateLabel(this.getAttribute(name));
				}
				break;
			case "icon":
				if (newValue !== oldValue) {
					this.updateIcon(this.getAttribute(name));
				}
		}
	}
}

customElements.define("browser-internal-tab", BrowserTab, { extends: "tab" });

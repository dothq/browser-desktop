/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { DotWindowTracker } = ChromeUtils.importESModule(
	"resource:///modules/DotWindowTracker.sys.mjs"
);

var { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

var { StartPage } = ChromeUtils.importESModule(
	"resource:///modules/StartPage.sys.mjs"
);

/**
 * @callback BrowserCommandAction
 * @param {BrowserCommandContext} [data] - The action's payload
 *
 * @callback BrowserCommandEnabled
 * @param {BrowserCommandContext} [data] - The action's payload
 * @returns {boolean}
 *
 * @typedef {{
 *      win: Window;
 *      tab: BrowserTab;
 *      gDot: typeof gDot;
 *      browser: ChromeBrowser;
 *      selectedTab: BrowserTab;
 *      execCommand: typeof gDotCommands.execCommand;
 *      [key: string]: any;
 * }} BrowserCommandContext
 *
 * @typedef {Object} BrowserCommand
 * @property {string} name - The command's name
 * @property {BrowserCommandAction} action - The command's action
 * @property {BrowserCommandEnabled} enabled - Determines if the command is enabled
 * @property {string} category - The command's category
 * @property {string[]} [keybindings] - The command's key bindings
 */

var gDotCommands = {
	COMMAND_CATEGORY_APPLICATION: "application",
	COMMAND_CATEGORY_BROWSING: "browsing",
	COMMAND_CATEGORY_BROWSER: "browser",
	COMMAND_CATEGORY_UTILS: "utils",

	/**
	 * Locates a command by its ID
	 * @param {string} id
	 * @returns {BrowserCommand}
	 */
	getCommandById(id) {
		return this.commands.find((c) => c.name == id);
	},

	/**
	 * A list of commands
	 * @returns {BrowserCommand[]}
	 */
	get commands() {
		return [
			/* Application */
			{
				name: "application.new_window",
				action: () => DotWindowTracker.openWindow(),

				enabled: () => true,

				category: this.COMMAND_CATEGORY_APPLICATION
			},
			{
				name: "application.new_private_browsing_window",
				action: () => DotWindowTracker.openWindow({ isPrivate: true }),

				enabled: () => true,

				category: this.COMMAND_CATEGORY_APPLICATION
			},
			{
				name: "application.close",

				action: ({ win }) => {
					if (!win && win.closed) return;

					win.close();
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_APPLICATION
			},
			{
				name: "application.new_tab",

				action: ({ win }) => {
					const [urlToLoad] = StartPage.getHomePage();

					NavigationHelper.openTrustedLinkIn(win, urlToLoad, "tab");
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_APPLICATION
			},
			{
				name: "application.close_tab",

				action: ({ tab }) => {
					tab.maybeClose();
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_APPLICATION
			},

			/* Browsing */
			{
				name: "browsing.navigate_back",

				action: ({ browser }) => {
					if (browser.canGoBack) {
						browser.goBack();
					}
				},

				enabled: ({ browser }) => browser.canGoBack,

				category: this.COMMAND_CATEGORY_BROWSING
			},
			{
				name: "browsing.navigate_forward",

				action: ({ browser }) => {
					if (browser.canGoForward) {
						browser.goForward();
					}
				},

				enabled: ({ browser }) => browser.canGoForward,

				category: this.COMMAND_CATEGORY_BROWSING
			},
			{
				name: "browsing.reload_page",

				action: ({ browser, bypassCache }) => {
					const { LOAD_FLAGS_NONE, LOAD_FLAGS_BYPASS_CACHE } =
						Ci.nsIWebNavigation;

					let flags = LOAD_FLAGS_NONE;

					if (bypassCache == true) {
						flags |= LOAD_FLAGS_BYPASS_CACHE;
					}

					browser.reloadWithFlags(flags);
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_BROWSING
			},
			{
				name: "browsing.stop_page",

				action: ({ browser, tab }) => {
					const { STOP_ALL } = Ci.nsIWebNavigation;

					browser.stop(STOP_ALL);
				},

				enabled: ({ tab }) => tab.progress !== tab.TAB_PROGRESS_NONE,

				category: this.COMMAND_CATEGORY_BROWSING
			},
			{
				name: "browsing.reload_stop_page",

				action: (ctx) => {
					const { execCommand, tab } = ctx;

					if (tab.progress !== tab.TAB_PROGRESS_NONE) {
						execCommand("browsing.stop_page", ctx);
						return;
					}

					execCommand("browsing.reload_page", ctx);
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_BROWSING
			},

			/* Browser */
			{
				name: "browser.toolbar.toggle",

				action: ({ gDot, name }) => {
					const toolbar = gDot.getToolbarByName(name);
					if (!toolbar) {
						throw new Error(
							`Toolbar with name '${name}' could not be found!`
						);
					}

					toolbar.toggleCollapsed();
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_BROWSER
			},
			{
				name: "browser.popouts.toggle",

				action: ({ win, name, tab, gDot }) => {
					switch (name) {
						case "page-identity": {
							if (
								gDot.tabs._isWebContentsBrowserElement(
									tab.webContents
								)
							) {
								win.openDialog(
									"chrome://browser/content/pageinfo/pageInfo.xhtml",
									"",
									"chrome,toolbar,dialog=no,resizable",
									{ browser: tab.webContents }
								);
							}
						}
					}
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_BROWSER
			},
			{
				name: "browser.select_all",

				action: ({ goDoCommand }) => {
					goDoCommand("cmd_selectAll");
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_BROWSER
			},

			/** Utilities */
			{
				name: "utils.print",

				action: ({ msg }) => {
					Services.console.logStringMessage(msg);
				},

				enabled: () => true,

				category: this.COMMAND_CATEGORY_UTILS
			}
		];
	},

	/**
	 * Create a combined context object using provided overrides
	 * @param {object} incomingOverrides
	 *
	 * @returns {BrowserCommandContext}
	 */
	createContext(incomingOverrides) {
		// If we accidently pass in a rendered tab, make sure we get the internal tab
		if (
			incomingOverrides.tab &&
			incomingOverrides.tab instanceof BrowserRenderedTab
		) {
			incomingOverrides.tab = /** @type {BrowserRenderedTab} */ (
				incomingOverrides.tab
			).linkedTab;
		}

		const ctx = {
			_overrides: { ...incomingOverrides },

			/** @type {Window} */
			win: incomingOverrides.win,

			/**
			 * @returns {BrowserTab}
			 */
			get tab() {
				if (
					this._overrides.tab &&
					this._overrides.tab instanceof BrowserTab
				) {
					return this._overrides.tab;
				}

				if (this)
					if (
						this._overrides.browser &&
						this._overrides.browser.constructor.name == "MozBrowser"
					) {
						return this.win.gDot.tabs.getTabForWebContents(
							this._overrides.browser
						);
					}

				return this.selectedTab;
			},

			/**
			 * @returns {BrowserTab}
			 */
			get selectedTab() {
				if (!this.win.gDot?.tabs) return null;

				return this.win.gDot?.tabs?.selectedTab;
			},

			/**
			 * @returns {ChromeBrowser}
			 */
			get browser() {
				if (
					this._overrides.browser &&
					this._overrides.browser.constructor.name == "MozBrowser"
				) {
					return this._overrides.browser;
				}

				if (!this.win.gDot?.tabs) return null;

				if (
					this.tab &&
					this.tab.webContents &&
					this.win.gDot.tabs._isWebContentsBrowserElement(
						this.tab.webContents
					)
				) {
					return /** @type {ChromeBrowser} */ (this.tab.webContents);
				}

				return this.win.gDot.tabs._isWebContentsBrowserElement(
					this.selectedTab.webContents
				)
					? /** @type {ChromeBrowser} */ (
							this.selectedTab.webContents
					  )
					: null;
			},

			get gDot() {
				return this.win.gDot;
			},

			/**
			 * @type {typeof gDotCommands.execCommand}
			 */
			execCommand(...args) {
				this.win.gDotCommands.execCommand.bind(gDotCommands, ...args)();
			},

			/**
			 * @type {typeof goDoCommand}
			 */
			goDoCommand(...args) {
				/** @type {any} */ (this.win).goDoCommand.bind(
					this.win,
					...args
				)();
			}
		};

		for (const [key, value] of Object.entries(incomingOverrides || {})) {
			if (!ctx[key]) {
				ctx[key] = value;
			}
		}

		return ctx;
	},

	/**
	 * Executes a command action
	 * @param {string} name
	 * @param {object} ctx
	 */
	execCommand(name, ctx) {
		const cmd = this.commands.find((c) => c.name == name);

		if (!cmd) {
			console.warn(`No command with the name '${name}'!`);
			return;
		}

		const context = this.createContext({
			...ctx,
			win: window
		});

		if (!cmd.enabled(context)) return;

		return cmd.action.bind(gDotCommands, context)();
	}
};

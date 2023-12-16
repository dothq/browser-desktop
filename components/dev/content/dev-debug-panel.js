/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AddonManager } = ChromeUtils.importESModule(
	"resource://gre/modules/AddonManager.sys.mjs"
);

var { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

var { DotAppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/DotAppConstants.sys.mjs"
);

var { NativeTitlebar } = ChromeUtils.importESModule(
	"resource:///modules/NativeTitlebar.sys.mjs"
);

var { NavigationHelper } = ChromeUtils.importESModule(
	"resource:///modules/NavigationHelper.sys.mjs"
);

var { DotWindowTracker } = ChromeUtils.importESModule(
	"resource:///modules/DotWindowTracker.sys.mjs"
);

/**
 * Utility function to convert bytes to a human-readable format
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
function formatBytes(bytes, decimals = 2, k = 1024) {
	if (!+bytes) return "0 Bytes";

	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "kB", "MB", "GB", "TB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Utility function to work out percentage difference between a value and its maximum
 * @param {number} val
 * @param number max
 * @returns
 */
function perDiff(val, max) {
	return ((1.0 - (max - val) / max) * 100).toFixed(2);
}

class DeveloperDebugPanel extends MozHTMLElement {
	constructor() {
		super();
	}

	elements = {
		app_info: html("span"),
		proc_info: html("div"),
		user_agent: html("span"),
		open_link_in: html(
			"div",
			{},
			html(
				"div",
				{},
				html(
					"label",
					{ for: "dev-debug-link-to-open" },
					"URL to open:"
				),
				html("input", { type: "text", id: "dev-debug-link-to-open" })
			),
			html(
				"div",
				{},
				html("label", {}, "Open where:"),
				html(
					"div",
					{ class: "dev-debug-open-link-btns" },
					html(
						"button",
						{ id: "dev-debug-open-link--current" },
						"Current"
					),
					html("button", { id: "dev-debug-open-link--tab" }, "Tab"),
					html(
						"button",
						{ id: "dev-debug-open-link--window" },
						"Window"
					)
				)
			)
		),
		active_theme: /** @type {HTMLInputElement} */ (
			html("select", { class: "dev-active-theme" })
		),

		open_profile_dir: html(
			"button",
			{ id: "dev-debug-open-profile-dir-btn" },
			"Open profile directory"
		),

		customizableui_data: /** @type {HTMLTextAreaElement} */ (
			html("textarea", { readonly: "", rows: 5 })
		)
	};

	onAddonEnabled(addon) {
		if (!addon || addon.type != "theme") return;

		this.renderThemes().then((_) => {
			this.elements.active_theme.value = addon.id;
		});
	}

	async renderThemes() {
		const allThemes = await AddonManager.getAddonsByTypes(["theme"]);

		// Clear children
		this.elements.active_theme.replaceChildren();

		for (const theme of allThemes.sort((a, b) =>
			a.id.localeCompare(b.id)
		)) {
			const option = html(
				"option",
				{ value: theme.id },
				`${theme.name} (${theme.id})`
			);

			this.elements.active_theme.appendChild(option);
		}
	}

	resourceUsageInt = null;

	createAboutProcessesBrowser() {
		const browser = document.createXULElement("browser");

		browser.setAttribute("type", "content");
		browser.setAttribute("disableglobalhistory", "true");

		Object.assign(browser.style, {
			width: "100%",
			height: "100%",
			minHeight: "275px",
			maxHeight: "275px",
			borderRadius: "8px",
			padding: "3px",
			"-moz-window-dragging": "nodrag"
		});

		browser.addEventListener("XULFrameLoaderCreated", () => {
			browser.fixupAndLoadURIString("about:processes", {
				triggeringPrincipal:
					Services.scriptSecurityManager.getSystemPrincipal()
			});
		});

		return browser;
	}

	async calculateResourceUsage() {
		const procInfo = await ChromeUtils.requestProcInfo();

		/** @type {any[]} */
		let data = [
			html("span", {}, `PID: ${procInfo.pid}`),
			html("span", {}, `Memory: ${formatBytes(procInfo.memory)}`),
			html("span", {}, `Processes: ${procInfo.children.length}`),
			html("span", {}, `Threads: ${procInfo.threads.length}`)
		];

		this.elements.proc_info.textContent = "";
		this.elements.proc_info.append(...data);
	}

	// https://stackoverflow.com/a/54931396
	prettyStringify(obj) {
		return JSON.stringify(
			obj,
			function (k, v) {
				if (v instanceof Array) return JSON.stringify(v);
				return v;
			},
			2
		);
	}

	getCustomizableUIData() {
		this.elements.customizableui_data.value = JSON.stringify(
			JSON.parse(
				Services.prefs.getStringPref("dot.customizable.state", "{}")
			)
		);
	}

	async init() {
		const activeTheme = (
			await AddonManager.getAddonsByTypes(["theme"])
		).find((ext) => ext.isActive);

		AddonManager.addAddonListener({
			onEnabled: this.onAddonEnabled.bind(this)
		});

		this.onAddonEnabled(activeTheme);

		this.resourceUsageInt = setInterval(() => {
			this.calculateResourceUsage();
		}, 1000);

		this.calculateResourceUsage();

		setInterval(() => {
			this.getCustomizableUIData();
		}, 500);

		this.elements.active_theme.addEventListener("change", async (event) => {
			const { value } = /** @type {HTMLSelectElement} */ (event.target);

			const addon = await AddonManager.getAddonByID(value);

			if (addon) {
				addon.enable();
			}
		});

		const dotVersion = document.createElement("strong");
		dotVersion.textContent = `Dot Browser v${DotAppConstants.DOT_APP_VERSION} (${AppConstants.MOZ_BUILDID})`;

		this.elements.app_info.append(
			html(
				"div",
				{ class: "dev-branding-lockup" },
				html("img", { src: "chrome://branding/content/icon32.png" }),
				html("img", {
					src: "chrome://branding/content/about-wordmark.svg",
					height: "48"
				})
			),
			html("br"),
			dotVersion,
			html("br"),
			`Firefox v${AppConstants.MOZ_APP_VERSION}`
		);

		this.elements.user_agent.textContent = `User Agent: ${
			Cc["@mozilla.org/network/protocol;1?name=http"].getService(
				Ci.nsIHttpProtocolHandler
			).userAgent
		}`;

		const openSetLinkIn = (where) => {
			const input = /** @type {HTMLInputElement} */ (
				this.elements.open_link_in.querySelector(
					"#dev-debug-link-to-open"
				)
			);

			const url = input.value;

			const win = /** @type {any} */ (
				DotWindowTracker.getTopWindow({ allowPopups: false })
			);

			NavigationHelper.openWebLinkIn(win, url, where);
		};

		this.elements.open_link_in
			.querySelector("#dev-debug-open-link--current")
			.addEventListener("click", () => openSetLinkIn("current"));
		this.elements.open_link_in
			.querySelector("#dev-debug-open-link--tab")
			.addEventListener("click", () => openSetLinkIn("tab"));
		this.elements.open_link_in
			.querySelector("#dev-debug-open-link--window")
			.addEventListener("click", () => openSetLinkIn("window"));

		this.elements.open_profile_dir.addEventListener("click", () => {
			const currProfD = Services.dirsvc.get("ProfD", Ci.nsIFile);
			const profileDir = currProfD.path;

			const nsLocalFile = Components.Constructor(
				"@mozilla.org/file/local;1",
				"nsIFile",
				"initWithPath"
			);
			/** @type {import("third_party/dothq/gecko-types/lib").nsIFile} */ (
				new nsLocalFile(profileDir)
			).reveal();
		});
	}

	insertStylesheet() {
		const sheet = document.createProcessingInstruction(
			"xml-stylesheet",
			`href="chrome://dot/content/widgets/dev-debug-panel.css" type="text/css"`
		);

		document.insertBefore(sheet, document.documentElement);
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;
		this.classList.add("dev-panel");

		this.appendChild(this.elements.app_info);
		this.appendChild(this.elements.proc_info);

		this.aboutProcessesBrowser = this.createAboutProcessesBrowser();

		this.appendChild(
			html(
				"div",
				{ slot: "panel", name: "processes" },
				this.aboutProcessesBrowser
			)
		);

		this.appendChild(this.elements.user_agent);

		this.appendChild(
			html(
				"div",
				{ class: "dev-active-theme-container" },
				html("label", {}, "Active Theme:"),
				this.elements.active_theme
			)
		);

		this.appendChild(this.elements.open_link_in);

		this.appendChild(this.elements.open_profile_dir);

		this.appendChild(
			html(
				"div",
				{ class: "dev-customizable-ui-container" },
				html("label", {}, "Customizable UI State:"),
				this.elements.customizableui_data
			)
		);

		this.insertStylesheet();

		if (
			window.location.href ==
			"chrome://dot/content/dev-debug-popout.xhtml"
		) {
			new ResizeObserver(() => {
				window.document.documentElement.style.setProperty(
					"--height",
					this.getBoundingClientRect().height + "px"
				);
			}).observe(this);

			const devtoolsButton = html("button", {}, "Open Browser Toolbox");
			devtoolsButton.addEventListener("click", () => {
				var { BrowserToolboxLauncher } = ChromeUtils.importESModule(
					"resource://devtools/client/framework/browser-toolbox/Launcher.sys.mjs"
				);

				BrowserToolboxLauncher.init();
			});

			this.appendChild(devtoolsButton);
		}
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		clearInterval(this.resourceUsageInt);
	}
}

customElements.define("dev-debug-panel", DeveloperDebugPanel);

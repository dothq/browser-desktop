/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { NetUtil } = ChromeUtils.importESModule(
	"resource://gre/modules/NetUtil.sys.mjs"
);

const { E10SUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/E10SUtils.sys.mjs"
);

const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
);

const { BrowserTabsUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/BrowserTabsUtils.sys.mjs"
);

const {
	STATE_IS_SECURE,
	STATE_IS_BROKEN,
	STATE_IDENTITY_EV_TOPLEVEL,
	STATE_LOADED_MIXED_ACTIVE_CONTENT,
	STATE_BLOCKED_MIXED_ACTIVE_CONTENT,
	STATE_LOADED_MIXED_DISPLAY_CONTENT,
	STATE_HTTPS_ONLY_MODE_UPGRADED,
	STATE_HTTPS_ONLY_MODE_UPGRADE_FAILED,
	STATE_HTTPS_ONLY_MODE_UPGRADED_FIRST,
	STATE_CERT_USER_OVERRIDDEN
} = Ci.nsIWebProgressListener;

export class TabIdentityHandler {
	/** @type {BrowserTab} */
	tab = null;

	/**
	 * The type of identity for the tab
	 */
	type = null;

	/**
	 * The icon to use for this tab identity
	 */
	icon = null;

	/**
	 * The label to use for this tab identity
	 */
	label = null;

	/**
	 * The tooltip to use for this tab identity
	 */
	tooltip = null;

	/**
	 * The icon mode to use for this tab identity
	 */
	mode = null;

	/**
	 * The browser element for this tab
	 * @returns {ChromeBrowser | null}
	 */
	get browser() {
		if (
			!this.win.gDot?.tabs?._isWebContentsBrowserElement(
				this.tab.webContents
			)
		) {
			return null;
		}
		return /** @type {ChromeBrowser} */ (this.tab.webContents);
	}

	/**
	 * The associated browser window for this tab
	 */
	get win() {
		return this.tab.ownerGlobal;
	}

	/**
	 * Determines whether the user wants to show the insecure connection icon
	 */
	get insecureConnectionIconEnabled() {
		return (
			Services.prefs.getBoolPref(
				"security.insecure_connection_icon.enabled"
			) ||
			(PrivateBrowsingUtils.isWindowPrivate(this.win) &&
				Services.prefs.getBoolPref(
					"security.insecure_connection_icon.pbmode.enabled"
				))
		);
	}

	/**
	 * Determines whether the user wants to show the insecure connection label
	 */
	get insecureConnectionTextEnabled() {
		return (
			Services.prefs.getBoolPref(
				"security.insecure_connection_text.enabled"
			) ||
			(PrivateBrowsingUtils.isWindowPrivate(this.win) &&
				Services.prefs.getBoolPref(
					"security.insecure_connection_text.pbmode.enabled"
				))
		);
	}

	/**
	 * Handles Gecko security change events from the browser
	 * @param {object} data
	 * @param {ChromeBrowser} data.browser
	 * @param {nsIWebProgress} data.webProgress
	 * @param {nsIRequest} data.request
	 * @param {number} data.state
	 */
	onSecurityChange({ browser, webProgress, request, state }) {
		// Make sure we're handling our own browser's events only
		if (this.browser !== browser) return;

		this._state = state;

		this.update();
	}

	/**
	 * Gets Fluent attributes in an object for a Fluent string
	 * @param {string} id
	 * @param {object} [args]
	 * @returns {Promise<Record<string, string>>}
	 */
	async _getAttributesForStr(id, args) {
		const [msg] = await this.win.document.l10n.formatMessages([
			{ id, args }
		]);

		/** @type {Record<string, string>} */
		let attrs = {};

		for (const attr of msg.attributes) {
			attrs[attr.name] = attr.value;
		}

		return attrs;
	}

	/**
	 * Updates the tab's identity
	 */
	async update(cache = false) {
		// We're updating too early, returning early will prevent any issues
		if (!this.browser) return;

		let type = this.type || "";
		let icon = this.icon || "";
		let label = this.label || "";
		let tooltip = this.tooltip || "";
		let mode = this.mode || "";

		if (!cache || !type.length || !icon.length) {
			type = "unknown";
			icon = "info";
			label = "Page";
			tooltip = "Unknown connection";
			mode = "icons";

			if (this.isInternalContext) {
				const attrs = await this._getAttributesForStr(
					"tab-identity-type-chrome"
				);

				type = "chrome";
				icon = "brand32";
				label = attrs.label;
				tooltip = attrs.tooltip;
				mode = "icons_text";
			} else if (this.isExtensionContext) {
				const attrs = await this._getAttributesForStr(
					"tab-identity-type-extension",
					{ name: this.webExtensionPolicy.name }
				);

				const icons = Object.values(
					this.webExtensionPolicy.extension.manifest.icons
				);

				type = "extension";
				icon = icons[0] || "jigsaw";
				label = attrs.label;
				tooltip = attrs.tooltip;
				mode = "icons_text";
			} else if (this.hasInvalidPageProxyState || this.isInternalPage) {
				type = "search";
				icon = "search";
				label = "";
				tooltip = "";
				mode = "icons";
			} else if (this.uriHasHost && this.isSecureConnection) {
				const attrs = await this._getAttributesForStr(
					"tab-identity-type-secure",
					{ caOrg: this.certificate.caOrg }
				);

				type = "secure";
				icon = "padlock";
				label = attrs.label;
				tooltip = attrs.label;
				mode = "icons";

				if (this.isMixedActiveContentBlocked) {
					type = "mixed_content_blocked";
				}

				if (!this.hasUserSecurityException) {
					tooltip = attrs.tooltip;
				}
			} else if (this.isBrokenConnection) {
				const attrs = await this._getAttributesForStr(
					"tab-identity-type-unsecure"
				);

				type = "unsecure";
				icon = "close";
				label = attrs.label;
				tooltip = attrs.tooltip;
				mode = "icons_text";

				if (this.isMixedActiveContentLoaded) {
					type = "mixed_active_content_loaded";
				} else if (this.isMixedActiveContentBlocked) {
					type = "mixed_active_content_blocked";
				} else if (this.isMixedPassiveContentLoaded) {
					type = "mixed_passive_content_loaded";
				} else {
					type = "weak_ciphers";
				}
			} else if (
				this.hasCertError ||
				this.hasHTTPSOnlyError ||
				this.hasNetError ||
				this.hasBlockedError
			) {
				let errorType = "";

				if (this.hasCertError) errorType = "cert";
				else if (this.hasHTTPSOnlyError) errorType = "https_only";
				else if (this.hasNetError) errorType = "net";
				else if (this.hasBlockedError) errorType = "blocked";

				const attrs = await this._getAttributesForStr(
					"tab-identity-type-error",
					{ type: errorType }
				);

				type = "error";
				icon = "warning";
				label = attrs.label;
				tooltip = attrs.tooltip;
				mode = "icons_text";
			} else if (this.isPotentiallyTrustworthy) {
				const attrs = await this._getAttributesForStr(
					"tab-identity-type-local"
				);

				type = "local_resource";
				icon = "page";
				label = attrs.label;
				tooltip = attrs.tooltip;
				mode = "icons_text";
			} else {
				const attrs = await this._getAttributesForStr(
					"tab-identity-type-unsecure"
				);

				type = "unsecure";
				icon = this.insecureConnectionIconEnabled
					? "padlock-unsecure"
					: "info";
				label = attrs.label;
				tooltip = attrs.tooltip;
				mode = "icons_text";
			}
		}

		if (this.hasUserSecurityException) {
			console.log("todo: user has set security exception");
			tooltip = "You have added a security exception for this site.";
		}

		const data = {
			type,
			icon,
			label,
			tooltip,
			mode
		};

		this.type = type;
		this.icon = icon;
		this.label = label;
		this.tooltip = tooltip;
		this.mode = mode;

		const evt = new CustomEvent("BrowserTabs::TabIdentityChanged", {
			detail: {
				tab: this.tab,
				...data
			}
		});

		this.win.dispatchEvent(evt);
	}

	/**
	 * Determines if the URI has a host
	 *
	 * For special pages like about: or file:, we don't have a host
	 * so we can use this to check if our connection originated from
	 * a remote source.
	 */
	get uriHasHost() {
		try {
			return !!this.browser.currentURI.host;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Determines whether the current page
	 * has an invalid page proxy state
	 *
	 * This will typically be used to show a search icon
	 * instead of "Not Secure" for blank, hostless pages.
	 */
	get hasInvalidPageProxyState() {
		const uri = this.browser.currentURI;

		return (
			!this.uriHasHost &&
			uri.spec &&
			BrowserTabsUtils.isBlankPageURL(uri.spec) &&
			!uri.schemeIs("moz-extension")
		);
	}

	/**
	 * Determines whether the current page is an
	 * internal page.
	 *
	 * Internal pages are defined in BrowserTabsUtils.INTERNAL_PAGES
	 */
	get isInternalPage() {
		const uri = this.browser.currentURI;

		return !!BrowserTabsUtils.INTERNAL_PAGES[uri.spec];
	}

	/**
	 * Determines whether a URL was loaded from a file
	 */
	get isURILoadedFromFile() {
		try {
			let resolvedURI = NetUtil.newChannel({
				uri: this.browser.currentURI.spec,
				loadUsingSystemPrincipal: true
			}).URI;

			if (resolvedURI.schemeIs("jar")) {
				// Given a URI "jar:<jar-file-uri>!/<jar-entry>"
				// create a new URI using <jar-file-uri>!/<jar-entry>
				resolvedURI = NetUtil.newURI(resolvedURI.pathQueryRef);
			}

			// Check the URI again after resolving.
			return resolvedURI.schemeIs("file");
		} catch (ex) {
			return false;
		}
	}

	/**
	 * Determines whether the connection to the site is secure
	 */
	get isSecureConnection() {
		return !this.isURILoadedFromFile && this._state & STATE_IS_SECURE;
	}

	/**
	 * Determines whether the connection to the site is broken
	 *
	 * If the site features mixed content or uses weak cryptography,
	 * this connection will be considered broken by Gecko.
	 */
	get isBrokenConnection() {
		return Boolean(this._state & STATE_IS_BROKEN);
	}

	/**
	 * Determines whether the certificate is of an extended validation (EV) type
	 */
	get isCertificateEV() {
		return (
			!this.isURILoadedFromFile &&
			this._state & STATE_IDENTITY_EV_TOPLEVEL
		);
	}

	/**
	 * Determines whether the browser is in a secure context
	 */
	get isSecureContext() {
		if (
			this.browser.contentPrincipal?.originNoSuffix == "resource://pdf.js"
		) {
			// For PDF viewer pages (pdf.js) we can't rely on the isSecureContext field.
			// The backend will return isSecureContext = true, because the content
			// principal has a resource:// URI. Instead use the URI of the selected
			// browser to perform the isPotentiallyTrustworthy check.
			let principal;
			try {
				principal =
					Services.scriptSecurityManager.createContentPrincipal(
						this.browser.documentURI,
						{}
					);

				return principal.isOriginPotentiallyTrustworthy;
			} catch (e) {
				console.error(
					"Error while computing isPotentiallyTrustworthy for pdf viewer page: ",
					e
				);

				return false;
			}
		}

		return this.browser.securityUI.isSecureContext;
	}

	/**
	 * Determines whether we are in an internal, secure about:* context
	 */
	get isInternalContext() {
		if (!this.browser.currentURI.schemeIs("about")) return false;

		const module = E10SUtils.getAboutModule(this.browser.currentURI);
		if (module) {
			const flags = module.getURIFlags(this.browser.currentURI);

			return !!(flags & Ci.nsIAboutModule.IS_SECURE_CHROME_UI);
		}

		return false;
	}

	/**
	 * Determines whether we are in a moz-extension context
	 */
	get isExtensionContext() {
		return !!this.webExtensionPolicy;
	}

	/**
	 * Determines whether the site has mixed active content loaded in
	 */
	get isMixedActiveContentLoaded() {
		return Boolean(this._state & STATE_LOADED_MIXED_ACTIVE_CONTENT);
	}

	/**
	 * Determines whether the mixed active content for the site has been blocked
	 */
	get isMixedActiveContentBlocked() {
		return Boolean(this._state & STATE_BLOCKED_MIXED_ACTIVE_CONTENT);
	}

	/**
	 * Determines whether mixed passive content has been loaded
	 */
	get isMixedPassiveContentLoaded() {
		return Boolean(this._state & STATE_LOADED_MIXED_DISPLAY_CONTENT);
	}

	/**
	 * Determines whether content on the page was successfully upgraded by HTTPS-Only mode
	 */
	get isContentHTTPSOnlyUpgraded() {
		return Boolean(this._state & STATE_HTTPS_ONLY_MODE_UPGRADED);
	}

	/**
	 * Determines whether content on the page failed to upgrade in HTTPS-Only mode
	 */
	get isContentHTTPSOnlyUpgradeFailed() {
		return Boolean(this._state & STATE_HTTPS_ONLY_MODE_UPGRADE_FAILED);
	}

	/**
	 * Determines whether content on the page was successfully upgraded by HTTPS-First mode
	 */
	get isContentHTTPSFirstUpgraded() {
		return Boolean(this._state & STATE_HTTPS_ONLY_MODE_UPGRADED_FIRST);
	}

	/**
	 * Determines whether the user has added a security exception to the load of this site
	 */
	get hasUserSecurityException() {
		return Boolean(this._state & STATE_CERT_USER_OVERRIDDEN);
	}

	/**
	 * Determines whether the browser has encountered a about:neterror page
	 */
	get hasNetError() {
		const { documentURI } = this.browser;

		return (
			documentURI?.scheme == "about" && documentURI.filePath == "neterror"
		);
	}

	/**
	 * Determines whether the browser has encountered a certificate error
	 */
	get hasCertError() {
		const { documentURI } = this.browser;

		if (!documentURI || documentURI?.scheme !== "about") return false;

		if (this.hasNetError) {
			const q = new URLSearchParams(documentURI.query);

			return q.get("e") == "nssFailure2";
		}

		return documentURI.filePath == "certerror";
	}

	/**
	 * Determines whether the browser has encountered a HTTPS-only gate
	 */
	get hasHTTPSOnlyError() {
		const { documentURI } = this.browser;

		return (
			documentURI &&
			documentURI.scheme == "about" &&
			documentURI.filePath == "httpsonlyerror"
		);
	}

	/**
	 * Determines whether the browser has encounted the about:blocked page
	 */
	get hasBlockedError() {
		const { documentURI } = this.browser;
		return (
			documentURI &&
			documentURI.scheme == "about" &&
			documentURI.filePath == "blocked"
		);
	}

	/**
	 * Determines whether this browser could be in a trustworthy context
	 */
	get isPotentiallyTrustworthy() {
		return (
			!this.isBrokenConnection &&
			(this.isSecureContext ||
				this.browser.documentURI?.scheme == "chrome")
		);
	}

	/**
	 * The associated web extension policy for the current URL
	 *
	 * This will only be defined if the currentURI is using a moz-extension: scheme
	 */
	get webExtensionPolicy() {
		return WebExtensionPolicy.getByURI(this.browser.currentURI);
	}

	/**
	 * The certificate data for this site
	 */
	get certificate() {
		const data = {};
		const x509 = this.browser.securityUI.secInfo.serverCert;

		data.subjectOrg = x509.organization;

		if (x509.subjectName) {
			/** @type {Record<string, string>} */
			data.subjectNameFields = {};

			for (const kv of x509.subjectName.split(",")) {
				const [key, value] = kv.split("=");

				data.subjectNameFields[key] = value;
			}

			data.city = data.subjectNameFields.L;
			data.state = data.subjectNameFields.ST;
			data.country = data.subjectNameFields.C;
		}

		data.caOrg = x509.issuerOrganization || x509.issuerCommonName;
		data.cert = x509;

		return data;
	}

	/**
	 * Handle incoming tab events
	 * @param {CustomEvent} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "BrowserTabs::BrowserSecurityChange":
				this.onSecurityChange(event.detail);
				break;
			case "BrowserTabs::TabSelect": {
				if (event.detail !== this.tab) return;

				this.update(true);
				break;
			}
		}
	}

	/**
	 * @param {BrowserTab} tab
	 */
	constructor(tab) {
		this.tab = tab;

		this.win.addEventListener("BrowserTabs::BrowserSecurityChange", this);

		this.win.addEventListener("BrowserTabs::TabSelect", this);
	}
}

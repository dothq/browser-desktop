/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class ErrorPageInterstitial extends InterstitialPage {
	/**
	 * The query parameters for the error page
	 */
	get params() {
		return new URLSearchParams(document.documentURI.split("?")[1]);
	}

	/**
	 * The error code for this error page
	 */
	get errorCode() {
		return this.params.get("e");
	}

	/**
	 * The error prefix to use for localised strings
	 */
	get errorPrefix() {
		if (this.errorCode === "nssBadCert") {
			return "certerror";
		}

		return "neterror";
	}

	/**
	 * The URI associated with this error
	 */
	get errorURI() {
		return new URL(this.params.get("u"));
	}

	/**
	 * The elements for this error page
	 */
	get elements() {
		return {
			icon: /** @type {BrowserIcon} */ (
				this.querySelector("#error-icon") ||
					html("browser-icon", { id: "error-icon", slot: "icon" })
			),
			title: /** @type {HTMLHeadingElement} */ (
				this.querySelector("#error-title") ||
					html("h1", { id: "error-title", slot: "title" })
			)
		};
	}

	/**
	 * The localization registry for this error page
	 */
	get l10n() {
		return document.l10n;
	}

	/**
	 * The localized cert error data
	 */
	async getCertErrorData() {
		let docTitle = "certerror-page-title";
		let title = "certerror-connection-not-secure-title";
		let icon = "padlock-unsecure";
		let content = [
			[
				"certerror-insecure-connection-authenticity-preface",
				{ host: this.errorURI.host }
			],
			"certerror-insecure-connection-attackers-message"
		];
		let actions = {
			center: [
				{
					l10nId: "certerror-go-back-action",
					action: () => window.history.back(),
					primary: true
				}
			]
		};

		return {
			docTitle,
			title,
			icon,
			content,
			actions
		};
	}

	/**
	 * The localized data associated with this error
	 *
	 * @returns {Promise<Record<string, any>>}
	 */
	async getErrorData() {
		let docTitle = "neterror-page-title";
		let title = "neterror-page-title";
		let icon = "info";
		/** @type {(string | [string, Record<string, any>])[]} */
		let content = ["neterror-unknown-error-message"];
		/** @type {Record<string, { l10nId: string, action: any, primary?: boolean }[]>} */
		let actions = {
			center: [
				{
					l10nId: "neterror-try-again-action",
					action: () => {
						this.disabled = true;
						window.location.reload();
					},
					primary: true
				}
			]
		};

		switch (this.errorCode) {
			case "nssBadCert":
				return await this.getCertErrorData();
			case "connectionFailure":
			case "netInterrupt":
			case "netReset":
			case "netTimeout":
				title = "neterror-connection-failure-title";
				icon = "warning";
				break;
			case "dnsNotFound":
				title = "neterror-dns-not-found-title";
				icon = "question";
				content = [
					[
						"neterror-dns-not-found-message",
						{ host: this.errorURI.host }
					]
				];
				break;
			case "malformedURI":
				docTitle = "neterror-malformed-uri-page-title";
				title = "neterror-malformed-uri-title";
				content = ["neterror-malformed-uri-message"];
				actions = {};
				break;
		}

		return {
			docTitle,
			title,
			icon,
			content,
			actions
		};
	}

	/**
	 * Converts our localisation notation to an object
	 * @param {string | [string, Record<string, any>]} data
	 * @returns {[string, Record<string, any>]}
	 */
	getLocalised(data) {
		let l10nId = "";
		let l10nArgs = {};

		if (typeof data == "string") {
			l10nId = data;
		} else if (Array.isArray(data)) {
			l10nId = /** @type {string[]} */ (data)[0];
			l10nArgs = /** @type {string[]} */ (data)[1] || {};
		}

		return [l10nId, l10nArgs];
	}

	constructor() {
		super();
	}

	/**
	 * Initializes the error page and hydrates the data
	 */
	async init() {
		const { docTitle, title, icon, content, actions } =
			await this.getErrorData();

		document.l10n.setAttributes(
			document.querySelector("title"),
			...this.getLocalised(docTitle)
		);

		document.l10n.setAttributes(
			this.elements.title,
			...this.getLocalised(title)
		);

		this.elements.icon.name = icon;

		for (const text of content) {
			const paragraph = html("p", {}, "");

			document.l10n.setAttributes(
				/** @type {HTMLParagraphElement} */ (paragraph),
				...this.getLocalised(text)
			);

			this.appendChild(paragraph);
		}

		for (const [side, sideActions] of Object.entries(actions)) {
			for (const action of sideActions) {
				const btn = html("button", {
					slot: `action_${side}`,
					primary: !!action.primary
				});

				document.l10n.setAttributes(
					/** @type {HTMLParagraphElement} */ (btn),
					action.l10nId
				);

				if (action.action) {
					btn.addEventListener("click", action.action.bind(btn));
				}

				this.appendChild(btn);
			}
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this._params = new URLSearchParams(document.documentURI.split("?")[1]);

		this.appendChild(this.elements.icon);
		this.appendChild(this.elements.title);

		this.init();
	}
}

customElements.define("error-page", ErrorPageInterstitial);

document.body.appendChild(
	html("pre", {}, "documentURI: " + document.documentURI)
);

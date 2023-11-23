/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const BrowserCustomizableComponents = {
	/**
	 * Creates a new area using its area ID and optional arguments
	 * @param {Document} doc
	 * @param {string} areaId
	 * @param {Record<string, any>} [args]
	 */
	createArea(doc, areaId, args) {
		const win = doc.ownerGlobal;
		const { html } = win;

		const elementMapping = {
			toolbar: "browser-toolbar",
			addressbar: "browser-addressbar",
			tabs: "browser-tabs"
		};

		return areaId in elementMapping ? html(elementMapping[areaId]) : null;
	},

	/**
	 * Creates a new widget using its widget ID and optional arguments
	 * @param {Document} doc
	 * @param {string} widgetId
	 * @param {Record<string, any>} [args]
	 */
	createWidget(doc, widgetId, args) {
		const win = doc.ownerGlobal;
		const { html } = win;

		switch (widgetId) {
			case "toolbar-button":
				if (!win.customElements.get(args.is)) {
					throw new Error(
						`Unknown toolbar button type '${args.is}'.`
					);
				}

				return html("button", { is: args.is });
			case "web-contents":
				return html("browser-web-contents");
			case "tab-status":
				return html("browser-status");
			case "tab-icon":
				return html("browser-tab-icon");
			case "tab-label":
			case "tab-title":
				return html("browser-tab-label");
			case "":
				return doc.createDocumentFragment();
			default:
				return null;
		}
	}
};

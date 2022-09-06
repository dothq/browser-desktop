/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DotLitElement } from "base/content/widget-utils";
import { customElement } from "lit/decorators.js";

@customElement("dot-browser-element")
export class BrowserElement extends DotLitElement {
	public get browser() {
		return this.getElementsByTagName<any>("xul:browser")[0];
	}

	render() {
		const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		const browser = document.createElementNS(XUL_NS, "xul:browser");

		const attributes = {
			contextmenu: "contentAreaContextMenu",
			message: "true",
			messagemanagergroup: "browsers",
			tooltip: "aHTMLTooltip",
			type: "content",
			maychangeremoteness: "true",
			initiallyactive: "false",
			remote: "true",
			nodefaultsrc: "true",
			autocompletepopup: "PopupAutoComplete"
		};

		for (const [key, value] of Object.entries(attributes)) {
			browser.setAttribute(key, value);
		}

		return browser;
	}
}

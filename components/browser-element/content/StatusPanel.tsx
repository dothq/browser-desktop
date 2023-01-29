/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class DotStatusPanelLabel extends MozHTMLElement {
	public get value() {
		return this.textContent;
	}

	public set value(newValue: string) {
		this.textContent = newValue;
	}

	public constructor() {
		super();
	}
}

customElements.define("browser-statuspanel-label", DotStatusPanelLabel);

export default class DotStatusPanel extends MozHTMLElement {
	public constructor() {
		super();

		const markup = <browser-statuspanel-label id="statuspanel-label" />;

		this.appendChild(markup);
	}
}

customElements.define("browser-statuspanel", DotStatusPanel);

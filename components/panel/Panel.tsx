/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default class Panel extends MozHTMLElement {
	public constructor() {
		super();

		const markup = (
			<div class="panel-container">
				<h4>Testing panel</h4>
			</div>
		);

		this.appendChild(markup);
	}
}

customElements.define("browser-panel", Panel);

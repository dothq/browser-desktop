/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Scoped to prevent leakage
{
	const createButton = (direction) =>
		class extends BrowserToolbarButton {
			constructor() {
				super();

				this.buttonId =
					direction === "back" ? "navigate-back" : "navigate-forward";
				this.commandId =
					direction === "back" ? "go-back" : "go-forward";
			}

			connectedCallback() {
				super.connectedCallback();
			}

			disconnectedCallback() {
				super.disconnectedCallback();
			}
		};

	customElements.define("back-button", createButton("back"), {
		extends: "button"
	});
	customElements.define("forward-button", createButton("forward"), {
		extends: "button"
	});
}

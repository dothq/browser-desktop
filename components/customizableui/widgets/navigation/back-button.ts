/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ToolbarButtonWidget from "../common/toolbar-button.js";
import { applyWidgetConfiguration } from "../index.js";

class BackButtonWidget extends ToolbarButtonWidget {
	public configure(options: Partial<this>) {
		applyWidgetConfiguration(
			this,
			{
				visible: ["boolean"]
			},
			options
		);
	}

	public constructor() {
		super({
			id: "back-button",
			label: "Go Back",
			icon: "chrome://dot/skin/icons/back.svg"
		});

		// Use browser event emitter to listen for changes to
		// navigation state then apply this.disabled as necessary.
	}
}

customElements.define("widget-back-button", BackButtonWidget);

export default BackButtonWidget;

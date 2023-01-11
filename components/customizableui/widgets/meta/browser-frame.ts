/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIWidgetDisplay } from "../../CustomizableUIWidgets.js";
import Widget from "../common/index.js";
import { applyConfig } from "../index.js";

class BrowserFrameWidget extends Widget {
	public render() {
		const frame = document.querySelector("#browser");

		frame.removeAttribute("hidden");

		return frame;
	}

	public deconstruct() {
		return false;
	}

	public constructor() {
		const props = {
			id: "browser-frame",
			visible: true,
			display: CustomizableUIWidgetDisplay.IconsBesideText,
			configurableProps: {}
		};

		super(props);

		applyConfig(this, props);
	}
}

customElements.define("widget-browser-frame", BrowserFrameWidget);

export default BrowserFrameWidget;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIWidgetDisplay } from "../../CustomizableUIWidgets";
import Widget from "../common/index";
import { applyConfig } from "../index";

class BrowserFrameWidget extends Widget {
	public rendered: boolean = false;

	public internalRender() {
		if (this.rendered) return;

		const frame = document.querySelector("#browser");
		frame.removeAttribute("hidden");

		this.appendChild(frame);
		this.rendered = true;
	}

	public render() {
		return document.createDocumentFragment();
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIWidgetDisplay } from "../../CustomizableUIWidgets";
import Widget from "./index";

class ItemListWidget extends Widget {
	public constructor() {
		super({
			visible: true,
			display: CustomizableUIWidgetDisplay.IconsBesideText
		});
	}
}

customElements.define("widget-item-list", ItemListWidget);

export default ItemListWidget;

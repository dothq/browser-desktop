/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Widget from ".";
import { CustomisableUIWidgetDisplay } from "../../CustomisableUIWidgets.js";

class ItemListWidget extends Widget {
	public constructor() {
		super({
			visible: true,
			display: CustomisableUIWidgetDisplay.IconsBesideText
		});
	}
}

export default ItemListWidget;

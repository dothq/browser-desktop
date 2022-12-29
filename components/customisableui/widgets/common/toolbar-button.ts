/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Widget from ".";
import { applyConfig } from "..";
import { CustomisableUIWidgetDisplay } from "../../CustomisableUIWidgets.js";

class ToolbarButtonWidget extends Widget {
	/**
	 * Icon URI to use for ToolbarButton
	 */
	public icon: string = "";

	/**
	 * Text to use for ToolbarButton
	 */
	public text: string = "";

	/**
	 * Tooltip text to use for ToolbarButton
	 */
	public tooltipText: string = "";

	/**
	 * Keybind to use to run command of ToolbarButton
	 */
	public keybind: string = "";

	public constructor(widget?: Partial<ToolbarButtonWidget>) {
		super({
			visible: true,
			display: CustomisableUIWidgetDisplay.Icons
		});

		applyConfig(this, widget);
	}
}

export default ToolbarButtonWidget;

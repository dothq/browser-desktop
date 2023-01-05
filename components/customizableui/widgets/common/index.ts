/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIComponentBase } from "../../CustomizableUIComponent.js";
import { CustomizableUIWidgetDisplay } from "../../CustomizableUIWidgets.js";

const generateWidgetID = () => `widget-${generateID(4)}`;

class Widget extends CustomizableUIComponentBase<Widget> {
	/**
	 * Determines the widget ID
	 */
	public id: string = generateWidgetID();

	/**
	 * Determines whether the widget is visible on screen
	 */
	public get visible() {
		return !this.hidden;
	}

	/**
	 * Updates the widget's visibility
	 */
	public set visible(newValue: boolean) {
		this.hidden = !newValue;
	}

	/**
	 * Determines whether the widget is unable to be interfaced with
	 */
	public get disabled() {
		return !!this.getAttribute("disabled");
	}

	/**
	 * Updates the widget's disabled status
	 */
	public set disabled(newValue: boolean) {
		this.setAttribute("disabled", newValue.toString());
	}

	/**
	 * Determines how icons and text should be rendered
	 */
	public get display() {
		return this.getAttribute("display") as CustomizableUIWidgetDisplay;
	}

	/**
	 * Updates how the widget renders icons and text
	 */
	public set display(newValue: CustomizableUIWidgetDisplay) {
		this.setAttribute("display", newValue);
	}

	public constructor(widget: Partial<Widget>) {
		super(widget);
	}
}

customElements.define("widget-base", Widget);

export default Widget;

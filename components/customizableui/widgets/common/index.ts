/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIComponentBase } from "../../CustomizableUIComponent.js";
import { CustomizableUIWidgetDisplay } from "../../CustomizableUIWidgets.js";
import { applyWidgetConfiguration, CustomizableUIWidgetConfiguration } from "../index.js";

const generateWidgetID = () => `widget-${generateID(4)}`;

class Widget extends CustomizableUIComponentBase<Widget> {
	/**
	 * Gets the widget ID
	 */
	public get id() {
		return this.widgetId;
	}

	/**
	 * Updates the widget id
	 */
	public set id(newValue: string) {
		this.widgetId = newValue;
	}

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

	/**
	 * Gets the widget ID
	 */
	public get widgetId() {
		return this.getAttribute("widgetid");
	}

	/**
	 * Updates the widget ID
	 */
	public set widgetId(newValue: string) {
		this.setAttribute("widgetid", newValue);
	}

	public configure(options: Partial<this>) {
		applyWidgetConfiguration(this, (this as any).configurableProps, options);
	}

	public constructor(
		widget: Partial<Widget> & { configurableProps?: CustomizableUIWidgetConfiguration }
	) {
		super(widget);

		this.id = generateWidgetID();

		if (!(this as any).configurableProps) {
			throw new Error(
				`'configurableProps' is a required option on ${super.constructor.name}.`
			);
		}
	}
}

customElements.define("widget-base", Widget);

export default Widget;

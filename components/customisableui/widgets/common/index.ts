/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomisableUIWidgetDisplay } from "../../CustomisableUIWidgets.js";

const generateWidgetID = () => `widget-${generateID(4)}`;

class Widget {
	/**
	 * Determines the widget ID
	 */
	public id: string = generateWidgetID();

	/**
	 * Determines whether the widget is visible on screen
	 */
	public visible: boolean = true;

	/**
	 * Determines whether the widget is unable to be interfaced with
	 */
	public disabled: boolean = false;

	/**
	 * Determines how icons and text should be rendered
	 */
	public display: CustomisableUIWidgetDisplay = CustomisableUIWidgetDisplay.Icons;

	public render() {
		/* @todo */
	}

	public constructor(widget: Partial<Widget>) {
		for (const kv of Object.entries(widget)) {
			const key = kv[0] as keyof Widget;
			const value = kv[1] as any;

			(this as any)[key] = value;
		}
	}
}

export default Widget;

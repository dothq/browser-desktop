/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomisableUIWidgetDisplay } from "../../CustomisableUIWidgets.js";

const generateWidgetID = () => `widget-${generateID(4)}`;

class Widget extends MozHTMLElement {
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
		return this.getAttribute("display") as CustomisableUIWidgetDisplay;
	}

	/**
	 * Updates how the widget renders icons and text
	 */
	public set display(newValue: CustomisableUIWidgetDisplay) {
		this.setAttribute("display", newValue);
	}

	/**
	 * Handle the Web Components connectedCallback
	 */
	public connectedCallback() {
		/* Widget.render would need to exist in any child components that inherit this */
		if ((this as any).render) {
			const markup = (this as any).render();

			if (markup instanceof HTMLElement) {
				if (this.firstElementChild) {
					// If there is already something rendered to the
					// widget, replace the node with the newly rendered node.
					this.replaceWith(markup);
				} else {
					// Otherwise, we just append the node as normal
					this.appendChild(markup);
				}
			}
		} else {
			throw new Error(
				`${this.constructor.name}.render() is expected to be function but was ${typeof (
					this as any
				).render}.`
			);
		}
	}

	/**
	 * Handle the Web Components disconnectedCallback
	 */
	public disconnectedCallback() {
		/* Widget.deconstruct would need to exist in any child components that inherit this */
		if ((this as any).deconstruct) {
			(this as any).deconstruct();

			this.removeChild(this);
		} else {
			throw new Error(
				`${
					this.constructor.name
				}.deconstruct() is expected to be function but was ${typeof (this as any)
					.deconstruct}.`
			);
		}
	}

	public constructor(widget: Partial<Widget>) {
		super();

		for (const kv of Object.entries(widget)) {
			const key = kv[0] as keyof Widget;
			const value = kv[1] as any;

			(this as any)[key] = value;
		}
	}
}

export default Widget;
